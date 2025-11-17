import pool from "../../database/config.js";

/**
 * Obtener todas las órdenes (admin view) con filtros y paginación
 */
const getAllOrders = async (options = {}) => {
  const {
    limit = 20,
    offset = 0,
    estado_pago,
    estado_envio,
    metodo_despacho,
    fecha_desde,
    fecha_hasta,
    search, // Busca por order_code, email, nombre
    order_by = 'creado_en',
    order_dir = 'DESC',
  } = options;

  let query = `
    SELECT 
      o.*,
      u.nombre as usuario_nombre,
      u.email as usuario_email,
      u.telefono as usuario_telefono,
      COUNT(oi.orden_item_id) as total_items,
      d.comuna,
      d.ciudad,
      d.region
    FROM ordenes o
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    LEFT JOIN orden_items oi ON o.orden_id = oi.orden_id
    LEFT JOIN direcciones d ON o.direccion_id = d.direccion_id
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  // Filtros
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

  if (metodo_despacho) {
    query += ` AND o.metodo_despacho = $${paramIndex}`;
    params.push(metodo_despacho);
    paramIndex++;
  }

  if (fecha_desde) {
    query += ` AND o.creado_en >= $${paramIndex}`;
    params.push(fecha_desde);
    paramIndex++;
  }

  if (fecha_hasta) {
    query += ` AND o.creado_en <= $${paramIndex}`;
    params.push(fecha_hasta);
    paramIndex++;
  }

  if (search) {
    query += ` AND (
      o.order_code ILIKE $${paramIndex} OR
      u.email ILIKE $${paramIndex} OR
      u.nombre ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Agrupar
  query += `
    GROUP BY o.orden_id, u.usuario_id, d.direccion_id
  `;

  // Ordenamiento
  const validOrderBy = ['creado_en', 'total_cents', 'estado_pago', 'estado_envio', 'order_code'];
  const orderByColumn = validOrderBy.includes(order_by) ? `o.${order_by}` : 'o.creado_en';
  const orderDirection = order_dir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  query += ` ORDER BY ${orderByColumn} ${orderDirection}`;

  // Paginación
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);

  // Obtener total de registros para paginación
  let countQuery = `
    SELECT COUNT(DISTINCT o.orden_id) as total
    FROM ordenes o
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    WHERE 1=1
  `;
  
  const countParams = [];
  let countParamIndex = 1;

  if (estado_pago) {
    countQuery += ` AND o.estado_pago = $${countParamIndex}`;
    countParams.push(estado_pago);
    countParamIndex++;
  }

  if (estado_envio) {
    countQuery += ` AND o.estado_envio = $${countParamIndex}`;
    countParams.push(estado_envio);
    countParamIndex++;
  }

  if (metodo_despacho) {
    countQuery += ` AND o.metodo_despacho = $${countParamIndex}`;
    countParams.push(metodo_despacho);
    countParamIndex++;
  }

  if (fecha_desde) {
    countQuery += ` AND o.creado_en >= $${countParamIndex}`;
    countParams.push(fecha_desde);
    countParamIndex++;
  }

  if (fecha_hasta) {
    countQuery += ` AND o.creado_en <= $${countParamIndex}`;
    countParams.push(fecha_hasta);
    countParamIndex++;
  }

  if (search) {
    countQuery += ` AND (
      o.order_code ILIKE $${countParamIndex} OR
      u.email ILIKE $${countParamIndex} OR
      u.nombre ILIKE $${countParamIndex}
    )`;
    countParams.push(`%${search}%`);
  }

  const { rows: [{ total }] } = await pool.query(countQuery, countParams);

  return {
    orders: rows,
    pagination: {
      total: Number.parseInt(total),
      limit,
      offset,
      hasMore: offset + limit < Number.parseInt(total),
    },
  };
};

/**
 * Obtener orden por ID (admin view) con todos los detalles
 */
const getOrderByIdAdmin = async (ordenId) => {
  const query = `
    SELECT 
      o.*,
      -- Usuario
      u.nombre as usuario_nombre,
      u.email as usuario_email,
      u.telefono as usuario_telefono,
      u.public_id as usuario_public_id,
      -- Dirección completa
      d.calle, d.numero, d.depto_oficina, 
      d.comuna, d.ciudad, d.region, 
      d.codigo_postal, d.pais,
      d.telefono_contacto, 
      d.instrucciones_entrega,
      -- Método de pago
      mp.tipo as metodo_pago_tipo, 
      mp.ultimos_digitos, 
      mp.marca as metodo_pago_marca
    FROM ordenes o
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    LEFT JOIN direcciones d ON o.direccion_id = d.direccion_id
    LEFT JOIN metodos_pago mp ON o.metodo_pago_id = mp.metodo_pago_id
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
      p.sku as producto_sku,
      p.img_url as producto_img,
      p.stock as producto_stock_actual
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
 * Actualizar estado de una orden (pago y/o envío)
 */
const updateOrderStatus = async (ordenId, updates = {}) => {
  const {
    estado_pago,
    estado_envio,
    notas_internas,
    fecha_pago,
    fecha_envio,
    fecha_entrega_real,
    numero_seguimiento,
    empresa_envio,
  } = updates;

  // Construir query dinámicamente solo con campos proporcionados
  const fields = [];
  const params = [];
  let paramIndex = 1;

  if (estado_pago !== undefined) {
    fields.push(`estado_pago = $${paramIndex}`);
    params.push(estado_pago);
    paramIndex++;
  }

  if (estado_envio !== undefined) {
    fields.push(`estado_envio = $${paramIndex}`);
    params.push(estado_envio);
    paramIndex++;
  }

  if (notas_internas !== undefined) {
    fields.push(`notas_internas = $${paramIndex}`);
    params.push(notas_internas);
    paramIndex++;
  }

  if (fecha_pago !== undefined) {
    fields.push(`fecha_pago = $${paramIndex}`);
    params.push(fecha_pago);
    paramIndex++;
  }

  if (fecha_envio !== undefined) {
    fields.push(`fecha_envio = $${paramIndex}`);
    params.push(fecha_envio);
    paramIndex++;
  }

  if (fecha_entrega_real !== undefined) {
    fields.push(`fecha_entrega_real = $${paramIndex}`);
    params.push(fecha_entrega_real);
    paramIndex++;
  }

  if (numero_seguimiento !== undefined) {
    fields.push(`numero_seguimiento = $${paramIndex}`);
    params.push(numero_seguimiento);
    paramIndex++;
  }

  if (empresa_envio !== undefined) {
    fields.push(`empresa_envio = $${paramIndex}`);
    params.push(empresa_envio);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error('No hay campos para actualizar');
  }

  const query = `
    UPDATE ordenes 
    SET ${fields.join(', ')}
    WHERE orden_id = $${paramIndex}
    RETURNING *
  `;

  params.push(ordenId);

  const { rows } = await pool.query(query, params);
  return rows[0];
};

/**
 * Agregar información de seguimiento a una orden
 */
const addTrackingInfo = async (ordenId, trackingData) => {
  const {
    numero_seguimiento,
    empresa_envio,
    fecha_envio,
  } = trackingData;

  const query = `
    UPDATE ordenes 
    SET 
      numero_seguimiento = $1,
      empresa_envio = $2,
      fecha_envio = COALESCE($3, now()),
      estado_envio = CASE 
        WHEN estado_envio IN ('preparacion', 'empaquetado') 
        THEN 'enviado'
        ELSE estado_envio
      END
    WHERE orden_id = $4
    RETURNING *
  `;

  const { rows } = await pool.query(query, [
    numero_seguimiento,
    empresa_envio,
    fecha_envio,
    ordenId,
  ]);

  return rows[0];
};

/**
 * Obtener estadísticas de órdenes
 */
const getOrderStats = async (options = {}) => {
  const { fecha_desde, fecha_hasta } = options;

  let query = `
    SELECT 
      COUNT(*) as total_ordenes,
      COUNT(CASE WHEN estado_pago = 'pendiente' THEN 1 END) as pendientes,
      COUNT(CASE WHEN estado_pago = 'procesando' THEN 1 END) as procesando,
      COUNT(CASE WHEN estado_pago = 'pagado' THEN 1 END) as pagadas,
      COUNT(CASE WHEN estado_pago = 'cancelado' THEN 1 END) as canceladas,
      COUNT(CASE WHEN estado_envio = 'preparacion' THEN 1 END) as en_preparacion,
      COUNT(CASE WHEN estado_envio = 'enviado' THEN 1 END) as enviadas,
      COUNT(CASE WHEN estado_envio = 'entregado' THEN 1 END) as entregadas,
      SUM(total_cents) as total_ventas_cents,
      AVG(total_cents) as ticket_promedio_cents,
      SUM(CASE WHEN estado_pago = 'pagado' THEN total_cents ELSE 0 END) as ventas_confirmadas_cents
    FROM ordenes
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (fecha_desde) {
    query += ` AND creado_en >= $${paramIndex}`;
    params.push(fecha_desde);
    paramIndex++;
  }

  if (fecha_hasta) {
    query += ` AND creado_en <= $${paramIndex}`;
    params.push(fecha_hasta);
    paramIndex++;
  }

  const { rows } = await pool.query(query, params);
  return rows[0];
};

/**
 * Obtener órdenes por rango de fechas
 */
const getOrdersByDateRange = async (fechaDesde, fechaHasta, options = {}) => {
  const { estado_pago, estado_envio, limit = 100 } = options;

  let query = `
    SELECT 
      o.*,
      u.nombre as usuario_nombre,
      u.email as usuario_email,
      COUNT(oi.orden_item_id) as total_items
    FROM ordenes o
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    LEFT JOIN orden_items oi ON o.orden_id = oi.orden_id
    WHERE o.creado_en >= $1 AND o.creado_en <= $2
  `;

  const params = [fechaDesde, fechaHasta];
  let paramIndex = 3;

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
    GROUP BY o.orden_id, u.usuario_id
    ORDER BY o.creado_en DESC
    LIMIT $${paramIndex}
  `;

  params.push(limit);

  const { rows } = await pool.query(query, params);
  return rows;
};

/**
 * Actualizar notas internas de una orden
 */
const updateInternalNotes = async (ordenId, notas) => {
  const query = `
    UPDATE ordenes 
    SET notas_internas = $1
    WHERE orden_id = $2
    RETURNING *
  `;

  const { rows } = await pool.query(query, [notas, ordenId]);
  return rows[0];
};

const orderAdminModel = {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  addTrackingInfo,
  getOrderStats,
  getOrdersByDateRange,
  updateInternalNotes,
};

export default orderAdminModel;
