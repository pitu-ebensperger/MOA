import pool from '../../database/config.js';

/**
 * Middleware para verificar la salud de la conexión a la base de datos
 * Intenta reconectar si la conexión se perdió
 */
export const dbHealthCheck = async (req, res, next) => {
  try {
    // Hacer una query simple para verificar la conexión
    await pool.query('SELECT 1');
    next();
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error.message);
    
    // Intentar una reconexión automática
    try {
      await pool.query('SELECT 1');
      console.log('Reconexión exitosa a la base de datos');
      next();
    } catch (retryError) {
      console.error('Fallo al reconectar:', retryError.message);
      res.status(503).json({
        success: false,
        message: 'Servicio de base de datos temporalmente no disponible',
        error: process.env.NODE_ENV === 'development' ? retryError.message : undefined
      });
    }
  }
};

/**
 * Middleware para loguear información del pool de conexiones (solo en desarrollo)
 */
export const logPoolStats = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const stats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    };
    console.log('📊 Pool Stats:', stats);
  }
  next();
};
