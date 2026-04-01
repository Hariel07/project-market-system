import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { getConfig, updateConfig, getPublicConfig } from '../controllers/config.controller';

const router = Router();

// Rota pública — CadastroPage precisa saber se assinatura é obrigatória
router.get('/public/config', getPublicConfig);

// Rotas protegidas — apenas Admin
router.get('/admin/config', authMiddleware, roleMiddleware('ADMIN'), getConfig);
router.put('/admin/config', authMiddleware, roleMiddleware('ADMIN'), updateConfig);

export default router;
