import pool from "../../database/config.js";

/**
 * Generar código único para la orden
 * Formato: MOA-YYYYMMDD-XXXX
 */
const generateOrderCode = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `MOA-${year}${month}${day}`;

  // Buscar el último número del día
  const query = `
    SELECT order_code 
    FROM ordenes 
    WHERE order_code LIKE $1 
    ORDER BY order_code DESC 
    LIMIT 1
  `;
  
  const { rows } = await pool.query(query, [`${datePrefix}-%`]);
  
  let sequence = 1;
  if (rows.length > 0) {
    const lastCode = rows[0].order_code;
    const lastNumber = parseInt(lastCode.split('-').pop());
    sequence = lastNumber + 1;
  }

  return `${datePrefix}-${String(sequence).padStart(4, '0')}`;
};

/**
 * Crear nueva orden con items del carrito
 */
const createOrder = async (orderData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      usuario_id,
      direccion_id,
      metodo_pago_id,
      metodo_despacho,
      items, // Array de { producto_id, cantidad, precio_unit }
      subtotal_cents,
      envio_cents = 0,
      descuento_cents = 0,
      impuestos_cents = 0,
      notas_cliente,
      metodo_pago_usado,
    } = orderData;

    // Calcular total
    const total_cents = subtotal_cents + envio_cents - descuento_cents + impuestos_cents;

    // Generar código de orden
    const order_code = await generateOrderCode();

    // Crear orden
    const insertOrderQuery = `
      INSERT INTO ordenes (
        order_code,
        usuario_id,
        direccion_id,
        metodo_pago_id,
        metodo_despacho,
        total_cents,
        subtotal_cents,
        envio_cents,
        descuento_cents,
        impuestos_cents,
        estado_pago,
        estado_envio,
        notas_cliente,
        metodo_pago_usado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const { rows: [orden] } = await client.query(insertOrderQuery, [
      order_code,
      usuario_id,
      direccion_id,
      metodo_pago_id,
      metodo_despacho,
      total_cents,
      subtotal_cents,
      envio_cents,
      descuento_cents,
      impuestos_cents,
      'pendiente', // estado_pago
      'preparacion', // estado_envio
      notas_cliente,
      metodo_pago_usado,
    ]);

    // Insertar items de la orden
    if (items && items.length > 0) {
      const insertItemsQuery = `
        INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unit)
        VALUES ($1, $2, $3, $4)
      `;

      for (const item of items) {
        await client.query(insertItemsQuery, [
          orden.orden_id,
          item.producto_id,
          item.cantidad,
          item.precio_unit,
        ]);
      }
    }

    // Limpiar carrito del usuario
    await client.query(
      'DELETE FROM carrito_items WHERE carrito_id IN (SELECT carrito_id FROM carritos WHERE usuario_id = $1)',
      [usuario_id]
    );

    await client.query('COMMIT');

    // Retornar orden completa con items
    return getOrderById(orden.orden_id);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Obtener orden por ID con todos sus datos relacionados
 */
const getOrderById = async (ordenId) => {
  const query = `
    SELECT 
      o.*,
      d.calle, d.numero, d.depto_oficina, d.comuna, d.ciudad, d.region, d.codigo_postal, d.pais,
      d.telefono_contacto, d.instrucciones_entrega,
      mp.tipo as metodo_pago_tipo, mp.ultimos_digitos, mp.marca as metodo_pago_marca,
      u.nombre as usuario_nombre, u.email as usuario_email, u.telefono as usuario_telefono
    FROM ordenes o
    LEFT JOIN direcciones d ON o.direccion_id = d.direccion_id
    LEFT JOIN metodos_pago mp ON o.metodo_pago_id = mp.metodo_pago_id
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    WHERE o.orden_id = $1
  `;

  const { rows } = await pool.query(query, [ordenId]);
  if (rows.length === 0) return null;

  const orden = rows[0];

  // Obtener items de la orden
  const itemsQuery = `
    SELECT 
      oi.*,
      p.nombre as producto_nombre,
      p.slug as producto_slug,
      p.img_url as producto_img
    FROM orden_items oi
    LEFT JOIN productos p ON oi.producto_id = p.producto_id
    WHERE oi.orden_id = $1
  `;

  const { rows: items } = await pool.query(itemsQuery, [ordenId]);

  return {
    ...orden,
    items,
  };
};

/**
 * Obtener órdenes de un usuario
 */
const getOrdersByUserId = async (usuarioId, options = {}) => {
  const { limit = 20, offset = 0, estado_pago, estado_envio } = options;

  let query = `
    SELECT 
      o.*,
      COUNT(oi.orden_item_id) as total_items
    FROM ordenes o
    LEFT JOIN orden_items oi ON o.orden_id = oi.orden_id
    WHERE o.usuario_id = $1
  `;

  const params = [usuarioId];
  let paramIndex = 2;

  if (estado_pago) {
    query += ` AND o.estado_pago = $${paramIndex}`;
    params.push(estado_pago);
    paramIndex++;
  }

  if (estado_envio) {
    query += ` AND o.estado_envio = $${paramIndex}`;
    params.push(estado_envio);
    paramIndex++;
  }

  query += `
    GROUP BY o.orden_id
    ORDER BY o.creado_en DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const { rows } = await pool.query(query, params);
  return rows;
};

/**
 * Actualizar estado de pago de una orden
 */
const updatePaymentStatus = async (ordenId, estadoPago, transaccionId = null, metodoPagoUsado = null) => {
  const query = `
    UPDATE ordenes 
    SET 
      estado_pago = $1,
      transaccion_id = $2,
      metodo_pago_usado = COALESCE($3, metodo_pago_usado),
      fecha_pago = CASE 
        WHEN $1 = 'pagado' AND fecha_pago IS NULL THEN now() 
        ELSE fecha_pago 
      END
    WHERE orden_id = $4
    RETURNING *
  `;

  const { rows } = await pool.query(query, [estadoPago, transaccionId, metodoPagoUsado, ordenId]);
  return rows[0];
};

/**
 * Actualizar estado de envío de una orden
 */
const updateShippingStatus = async (ordenId, estadoEnvio, data = {}) => {
  const { 
    numero_seguimiento, 
    empresa_envio, 
    fecha_envio,
    fecha_entrega_real 
  } = data;

  const query = `
    UPDATE ordenes 
    SET 
      estado_envio = $1,
      numero_seguimiento = COALESCE($2, numero_seguimiento),
      empresa_envio = COALESCE($3, empresa_envio),
      fecha_envio = COALESCE($4, fecha_envio),
      fecha_entrega_real = COALESCE($5, fecha_entrega_real)
    WHERE orden_id = $6
    RETURNING *
  `;

  const { rows } = await pool.query(query, [
    estadoEnvio,
    numero_seguimiento,
    empresa_envio,
    fecha_envio,
    fecha_entrega_real,
    ordenId,
  ]);

  return rows[0];
};

/**
 * Cancelar orden
 */
const cancelOrder = async (ordenId, usuarioId) => {
  const query = `
    UPDATE ordenes 
    SET 
      estado_pago = 'cancelado',
      estado_envio = 'devuelto'
    WHERE orden_id = $1 
    AND usuario_id = $2
    AND estado_pago NOT IN ('pagado', 'reembolsado')
    RETURNING *
  `;

  const { rows } = await pool.query(query, [ordenId, usuarioId]);
  return rows[0];
};

const orderModel = {
  createOrder,
  getOrderById,
  getOrdersByUserId,
  updatePaymentStatus,
  updateShippingStatus,
  cancelOrder,
};

export default orderModel;
