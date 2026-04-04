import { Router } from 'express';
import { getPublicComercios, getProdutosPublicos, getMyCommerce, updateMyCommerce } from '../controllers/comercios.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Rotas públicas (vitrine do cliente)
router.get('/public', getPublicComercios);
router.get('/:id/produtos', getProdutosPublicos);

// Rotas do painel (logadas)
router.get('/me', authMiddleware, getMyCommerce);
router.put('/me', authMiddleware, updateMyCommerce);

export default router;
