import { Router } from 'express';
import { getPublicComercios, getMyCommerce, updateMyCommerce } from '../controllers/comercios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rota pública para a vitrine
router.get('/public', getPublicComercios);

// Rotas do painel (logadas)
router.get('/me', authMiddleware, getMyCommerce);
router.put('/me', authMiddleware, updateMyCommerce);

export default router;
