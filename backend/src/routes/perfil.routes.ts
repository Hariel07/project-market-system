import { Router } from 'express';
import { updateProfile, getAddresses, createAddress, updateAddress, setPrincipalAddress, deleteAddress } from '../controllers/perfil.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de perfil precisam de usuário autenticado
router.use(authMiddleware);

// Editar Perfil Base
router.put('/', updateProfile);

// CRUD de Endereços
router.get('/enderecos', getAddresses);
router.post('/enderecos', createAddress);
router.put('/enderecos/:id', updateAddress);
router.put('/enderecos/:id/principal', setPrincipalAddress);
router.delete('/enderecos/:id', deleteAddress);

export { router as perfilRoutes };
