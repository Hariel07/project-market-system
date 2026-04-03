import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { getConfig, updateConfig, getPublicConfig, getConfigSistema, updateConfigSistema } from '../controllers/config.controller';

const router = Router();

// Rota pública — CadastroPage precisa saber se assinatura é obrigatória
router.get('/public/config', getPublicConfig);

// Rotas do Sistema — Admin pode mudar configurações gerais (nome do app, etc)
router.get('/sistema', getConfigSistema);
router.post('/sistema', authMiddleware, roleMiddleware('ADMIN'), updateConfigSistema);

// Rotas protegidas — apenas Admin
router.get('/admin/config', authMiddleware, roleMiddleware('ADMIN'), getConfig);
router.put('/admin/config', authMiddleware, roleMiddleware('ADMIN'), updateConfig);

export default router;
