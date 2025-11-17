import express from 'express';
import configController from '../src/controllers/configController.js';
import { verifyToken } from '../src/middleware/tokenMiddleware.js';

const router = express.Router();

/**
 * Rutas para la configuración de la tienda
 * Base: /api/config
 */

// Ruta pública para obtener configuración
router.get('/api/config', configController.getConfig);

// Rutas protegidas (solo admin)
router.put('/api/config', verifyToken, configController.updateConfig);
router.post('/api/config/init', verifyToken, configController.initializeConfig);

export default router;
