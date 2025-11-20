import express from 'express';
import configController from '../src/controllers/configController.js';
import { verifyToken } from '../src/middleware/tokenMiddleware.js';

const router = express.Router();

router.get('/api/config', configController.getConfig);

router.put('/api/config', verifyToken, configController.updateConfig);
router.post('/api/config/init', verifyToken, configController.initializeConfig);

export default router;