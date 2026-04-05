import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getMyProfile, updateMyProfile, deleteMyAccount, deleteMyProfile } from '../controllers/perfil.controller.js';

const router = Router();

// Rota unificada para o usuário ver seus próprios dados mestres
router.get('/me', authMiddleware, getMyProfile);

// Rota unificada para o usuário editar seus dados (reflete em todos os perfis)
router.patch('/me', authMiddleware, updateMyProfile);

// Rotas de exclusão (Soft Delete)
router.delete('/me', authMiddleware, deleteMyProfile);
router.delete('/account', authMiddleware, deleteMyAccount);

export { router as perfilRoutes };
