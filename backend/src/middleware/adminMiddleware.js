/**
 * Middleware para verificar que el usuario autenticado sea administrador
 * Debe usarse después del middleware verifyToken
 */
export const verifyAdmin = (req, res, next) => {
  try {
    // El middleware verifyToken debe haber agregado req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    // Verificar si el usuario tiene rol de admin
    // Puede ser role_code: 'admin' o rol: 'admin'
    const isAdmin = 
      req.user.role_code === 'admin' || 
      req.user.rol === 'admin' ||
      req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    // Usuario es admin, continuar
    next();
  } catch (error) {
    console.error('Error en verifyAdmin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
};
