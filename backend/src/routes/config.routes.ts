import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { getConfig, updateConfig, getPublicConfig, checkSetupMode } from '../controllers/config.controller.js';

const router = Router();

/**
 * Prefixado com /api/config no server.ts
 */

// Rota pública (ex: CadastroPage) -> /api/config/public
router.get('/public', getPublicConfig);
router.get('/setup-check', checkSetupMode);

// Rotas do Sistema (Admin) -> /api/config/sistema
router.get('/sistema', authMiddleware, roleMiddleware('ADMIN'), getConfig);
router.post('/sistema', authMiddleware, roleMiddleware('ADMIN'), updateConfig);

export default router;
