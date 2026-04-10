import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  getMyProfile,
  getProfileById,
  updateMyProfile,
  deleteMyAccount,
  deleteMyProfile,
  getMyEnderecos,
  createEndereco,
  updateEndereco,
  setPrincipalEndereco,
  deleteEndereco,
} from '../controllers/perfil.controller.js';

const router = Router();

// Dados do perfil autenticado
router.get('/me', authMiddleware, getMyProfile);
router.patch('/me', authMiddleware, updateMyProfile);
router.delete('/me', authMiddleware, deleteMyProfile);
router.delete('/account', authMiddleware, deleteMyAccount);

// Endereços
router.get('/enderecos', authMiddleware, getMyEnderecos);
router.post('/enderecos', authMiddleware, createEndereco);
router.put('/enderecos/:id/principal', authMiddleware, setPrincipalEndereco);
router.put('/enderecos/:id', authMiddleware, updateEndereco);
router.delete('/enderecos/:id', authMiddleware, deleteEndereco);

// Perfil por ID (usado pelo EntregadorConfig — retorna dados do JWT)
router.get('/:id', authMiddleware, getProfileById);

export { router as perfilRoutes };
