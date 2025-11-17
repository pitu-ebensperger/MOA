import pool from "../../database/config.js";

/**
 * Obtener todos los métodos de pago de un usuario
 */
const getByUserId = async (usuarioId) => {
  const query = `
    SELECT 
      metodo_pago_id,
      usuario_id,
      tipo_metodo,
      ultimos_digitos,
      nombre_titular,
      fecha_expiracion,
      marca,
      proveedor_pago,
      token_pago,
      metadata,
      predeterminado,
      creado_en,
      actualizado_en
    FROM metodos_pago
    WHERE usuario_id = $1
    ORDER BY predeterminado DESC, creado_en DESC
  `;

  const { rows } = await pool.query(query, [usuarioId]);
  return rows;
};

/**
 * Obtener método de pago por ID (validando que pertenezca al usuario)
 */
const getById = async (metodoPagoId, usuarioId) => {
  const query = `
    SELECT 
      metodo_pago_id,
      usuario_id,
      tipo_metodo,
      ultimos_digitos,
      nombre_titular,
      fecha_expiracion,
      marca,
      proveedor_pago,
      token_pago,
      metadata,
      predeterminado,
      creado_en,
      actualizado_en
    FROM metodos_pago
    WHERE metodo_pago_id = $1 AND usuario_id = $2
  `;

  const { rows } = await pool.query(query, [metodoPagoId, usuarioId]);
  return rows[0];
};

/**
 * Buscar un método por token dentro del usuario
 */
const getByToken = async (tokenPago, usuarioId) => {
  const query = `
    SELECT 
      metodo_pago_id,
      usuario_id,
      tipo_metodo,
      ultimos_digitos,
      nombre_titular,
      fecha_expiracion,
      marca,
      proveedor_pago,
      token_pago,
      metadata,
      predeterminado,
      creado_en,
      actualizado_en
    FROM metodos_pago
    WHERE token_pago = $1 AND usuario_id = $2
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [tokenPago, usuarioId]);
  return rows[0];
};

/**
 * Obtener método de pago predeterminado del usuario
 */
const getDefault = async (usuarioId) => {
  const query = `
    SELECT 
      metodo_pago_id,
      usuario_id,
      tipo_metodo,
      ultimos_digitos,
      nombre_titular,
      fecha_expiracion,
      predeterminado,
      creado_en,
      actualizado_en
    FROM metodos_pago
    WHERE usuario_id = $1 AND predeterminado = true
  `;

  const { rows } = await pool.query(query, [usuarioId]);
  return rows[0];
};

/**
 * Crear nuevo método de pago
 */
const create = async (metodoPagoData) => {
  const {
    usuario_id,
    tipo_metodo,
    ultimos_digitos,
    nombre_titular,
    fecha_expiracion,
    token_pago, // Token tokenizado del procesador de pagos (Transbank, Stripe, etc.)
    predeterminado = false,
    marca = null,
    proveedor_pago = null,
    metadata = null
  } = metodoPagoData;

  // Si es el primer método de pago, forzar como predeterminado
  const countQuery = 'SELECT COUNT(*) as total FROM metodos_pago WHERE usuario_id = $1';
  const { rows: countRows } = await pool.query(countQuery, [usuario_id]);
  const isFirstMethod = parseInt(countRows[0].total) === 0;

  // Si se marca como predeterminado o es el primero, desmarcar otros
  if (predeterminado || isFirstMethod) {
    await pool.query(
      'UPDATE metodos_pago SET predeterminado = false WHERE usuario_id = $1',
      [usuario_id]
    );
  }

  const query = `
    INSERT INTO metodos_pago (
      usuario_id,
      tipo_metodo,
      ultimos_digitos,
      nombre_titular,
      fecha_expiracion,
      token_pago,
      predeterminado,
      marca,
      proveedor_pago,
      metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING 
      metodo_pago_id,
      usuario_id,
      tipo_metodo,
      ultimos_digitos,
      nombre_titular,
      fecha_expiracion,
      predeterminado,
      marca,
      proveedor_pago,
      token_pago,
      metadata,
      creado_en,
      actualizado_en
  `;

  const { rows } = await pool.query(query, [
    usuario_id,
    tipo_metodo,
    ultimos_digitos,
    nombre_titular,
    fecha_expiracion,
    token_pago,
    predeterminado || isFirstMethod,
    marca,
    proveedor_pago,
    metadata
  ]);

  return rows[0];
};

/**
 * Actualizar método de pago existente
 */
const update = async (metodoPagoId, usuarioId, metodoPagoData) => {
  const {
    nombre_titular,
    fecha_expiracion
  } = metodoPagoData;

  // Construir query dinámicamente solo con campos proporcionados
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (nombre_titular !== undefined) {
    updates.push(`nombre_titular = $${paramCount++}`);
    values.push(nombre_titular);
  }

  if (fecha_expiracion !== undefined) {
    updates.push(`fecha_expiracion = $${paramCount++}`);
    values.push(fecha_expiracion);
  }

  // Siempre actualizar timestamp
  updates.push(`actualizado_en = CURRENT_TIMESTAMP`);

  // Agregar condiciones WHERE
  values.push(metodoPagoId, usuarioId);

  const query = `
    UPDATE metodos_pago
    SET ${updates.join(', ')}
    WHERE metodo_pago_id = $${paramCount++} AND usuario_id = $${paramCount++}
    RETURNING 
      metodo_pago_id,
      usuario_id,
      tipo_metodo,
      ultimos_digitos,
      nombre_titular,
      fecha_expiracion,
      predeterminado,
      creado_en,
      actualizado_en
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

/**
 * Establecer método de pago como predeterminado
 */
const setAsDefault = async (metodoPagoId, usuarioId) => {
  // Primero desmarcar todos los métodos del usuario
  await pool.query(
    'UPDATE metodos_pago SET predeterminado = false WHERE usuario_id = $1',
    [usuarioId]
  );

  // Luego marcar el método seleccionado
  const query = `
    UPDATE metodos_pago
    SET predeterminado = true, actualizado_en = CURRENT_TIMESTAMP
    WHERE metodo_pago_id = $1 AND usuario_id = $2
    RETURNING 
      metodo_pago_id,
      usuario_id,
      tipo_metodo,
      ultimos_digitos,
      nombre_titular,
      fecha_expiracion,
      predeterminado,
      creado_en,
      actualizado_en
  `;

  const { rows } = await pool.query(query, [metodoPagoId, usuarioId]);
  return rows[0];
};

/**
 * Eliminar método de pago
 */
const remove = async (metodoPagoId, usuarioId) => {
  const query = 'DELETE FROM metodos_pago WHERE metodo_pago_id = $1 AND usuario_id = $2 RETURNING *';
  const { rows } = await pool.query(query, [metodoPagoId, usuarioId]);
  return rows[0];
};

/**
 * Contar métodos de pago del usuario
 */
const countByUserId = async (usuarioId) => {
  const query = 'SELECT COUNT(*) as total FROM metodos_pago WHERE usuario_id = $1';
  const { rows } = await pool.query(query, [usuarioId]);
  return parseInt(rows[0].total);
};

const paymentModel = {
  getByUserId,
  getById,
  getByToken,
  getDefault,
  create,
  update,
  setAsDefault,
  remove,
  countByUserId,
};

export default paymentModel;
