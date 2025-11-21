import pool from '../../database/config.js';
import crypto from 'crypto';

/**
 * Crear token de reset de contraseña
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Object>} Token creado
 */
export const createResetToken = async (usuarioId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  const query = `
    INSERT INTO password_reset_tokens 
      (usuario_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING token_id, usuario_id, token, created_at, expires_at
  `;

  try {
    const result = await pool.query(query, [usuarioId, token, expiresAt]);
    return result.rows[0];
  } catch (error) {
    console.error('[PasswordResetModel] Error al crear token:', error);
    throw error;
  }
};

/**
 * Buscar token válido (no usado y no expirado)
 * @param {string} token - Token a buscar
 * @returns {Promise<Object|null>} Token si es válido, null si no
 */
export const findValidToken = async (token) => {
  const query = `
    SELECT 
      token_id,
      usuario_id,
      token,
      created_at,
      expires_at,
      used_at
    FROM password_reset_tokens
    WHERE token = $1 
      AND used_at IS NULL 
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;

  try {
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[PasswordResetModel] Error al buscar token:', error);
    throw error;
  }
};

/**
 * Marcar token como usado
 * @param {string} token - Token a marcar
 * @returns {Promise<Object>} Token actualizado
 */
export const markTokenAsUsed = async (token) => {
  const query = `
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE token = $1
    RETURNING token_id, usuario_id, token, used_at
  `;

  try {
    const result = await pool.query(query, [token]);
    return result.rows[0];
  } catch (error) {
    console.error('[PasswordResetModel] Error al marcar token como usado:', error);
    throw error;
  }
};

/**
 * Limpiar tokens expirados o usados
 * Para ejecutar en cron job
 * @returns {Promise<number>} Cantidad de tokens eliminados
 */
export const cleanExpiredTokens = async () => {
  const query = `
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW() 
       OR used_at IS NOT NULL
  `;

  try {
    const result = await pool.query(query);
    return result.rowCount;
  } catch (error) {
    console.error('[PasswordResetModel] Error al limpiar tokens:', error);
    throw error;
  }
};

/**
 * Invalidar todos los tokens de un usuario
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<number>} Cantidad de tokens invalidados
 */
export const invalidateUserTokens = async (usuarioId) => {
  const query = `
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE usuario_id = $1 
      AND used_at IS NULL
  `;

  try {
    const result = await pool.query(query, [usuarioId]);
    return result.rowCount;
  } catch (error) {
    console.error('[PasswordResetModel] Error al invalidar tokens:', error);
    throw error;
  }
};
