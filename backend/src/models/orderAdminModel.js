import pool from "../../database/config.js";

const getAllOrders = async (options = {}) => {
  const {
    limit = 20,
    offset = 0,
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
      COUNT(oi.orden_item_id) as total_items
    FROM ordenes o
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    LEFT JOIN orden_items oi ON o.orden_id = oi.orden_id
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  // Filtros básicos (solo lo que existe en DDL actual)
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
    GROUP BY o.orden_id, u.usuario_id
  `;

  // Ordenamiento
  const validOrderBy = ['creado_en', 'total_cents', 'order_code'];
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

const getOrderByIdAdmin = async (ordenId) => {
  const query = `
    SELECT 
      o.*,
      u.nombre as usuario_nombre,
      u.email as usuario_email,
      u.telefono as usuario_telefono,
      u.public_id as usuario_public_id
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

const updateOrderStatus = async (ordenId, updates = {}) => {
  // Por ahora solo retorna la orden sin modificar
  // Cuando agregues columnas de estado, podrás implementar actualizaciones
  const query = `SELECT * FROM ordenes WHERE orden_id = $1`;
  const { rows } = await pool.query(query, [ordenId]);
  return rows[0];
};

const addTrackingInfo = async (ordenId, trackingData) => {
  // Tracking no disponible sin columnas de estado_envio/numero_seguimiento
  // Por ahora solo retorna la orden
  const query = `SELECT * FROM ordenes WHERE orden_id = $1`;
  const { rows } = await pool.query(query, [ordenId]);
  return rows[0];
};

const getOrderStats = async (options = {}) => {
  const { fecha_desde, fecha_hasta } = options;

  let query = `
    SELECT 
      COUNT(*) as total_ordenes,
      SUM(total_cents) as total_ventas_cents,
      AVG(total_cents) as ticket_promedio_cents
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

const orderAdminModel = {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  addTrackingInfo,
  getOrderStats,
  getOrdersByDateRange,
};

export default orderAdminModel;
