import pool from "../../database/config.js";

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

const createOrder = async (orderData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      usuario_id,
      items, // Array de { producto_id, cantidad, precio_unit }
      direccion_id,
      metodo_despacho = 'standard',
      metodo_pago = 'transferencia',
      subtotal_cents = 0,
      envio_cents = 0,
      total_cents,
      notas_cliente,
    } = orderData;

    // Generar código de orden
    const order_code = await generateOrderCode();

    // Crear orden con campos disponibles en DDL
    const insertOrderQuery = `
      INSERT INTO ordenes (
        order_code,
        usuario_id,
        direccion_id,
        metodo_despacho,
        metodo_pago,
        subtotal_cents,
        envio_cents,
        total_cents,
        notas_cliente
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const { rows: [orden] } = await client.query(insertOrderQuery, [
      order_code,
      usuario_id,
      direccion_id,
      metodo_despacho,
      metodo_pago,
      subtotal_cents,
      envio_cents,
      total_cents,
      notas_cliente,
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

const getOrderById = async (ordenId) => {
  const query = `
    SELECT 
      o.*,
      u.nombre as usuario_nombre, 
      u.email as usuario_email, 
      u.telefono as usuario_telefono
    FROM ordenes o
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

const getOrdersByUserId = async (usuarioId, options = {}) => {
  const { limit = 20, offset = 0 } = options;

  const query = `
    SELECT 
      o.*,
      COUNT(oi.orden_item_id) as total_items
    FROM ordenes o
    LEFT JOIN orden_items oi ON o.orden_id = oi.orden_id
    WHERE o.usuario_id = $1
    GROUP BY o.orden_id
    ORDER BY o.creado_en DESC
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await pool.query(query, [usuarioId, limit, offset]);
  return rows;
};

const cancelOrder = async (ordenId, usuarioId) => {
  // Por ahora solo verifica que la orden existe y pertenece al usuario
  // Cuando agregues estado_pago, podrás agregar lógica de cancelación
  const query = `
    SELECT * FROM ordenes 
    WHERE orden_id = $1 AND usuario_id = $2
  `;

  const { rows } = await pool.query(query, [ordenId, usuarioId]);
  return rows[0] || null;
};

const orderModel = {
  createOrder,
  getOrderById,
  getOrdersByUserId,
  cancelOrder,
};

export default orderModel;
