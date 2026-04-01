import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import {
  listarPlanos,
  listarPlanosPublicos,
  criarPlano,
  atualizarPlano,
  deletarPlano,
} from '../controllers/planos.controller';

const router = Router();

// Rota pública — usada pelo CadastroPage para mostrar planos disponíveis
router.get('/public/planos', listarPlanosPublicos);

// Rotas protegidas — apenas Admin
router.get('/admin/planos', authMiddleware, roleMiddleware('ADMIN'), listarPlanos);
router.post('/admin/planos', authMiddleware, roleMiddleware('ADMIN'), criarPlano);
router.put('/admin/planos/:id', authMiddleware, roleMiddleware('ADMIN'), atualizarPlano);
router.delete('/admin/planos/:id', authMiddleware, roleMiddleware('ADMIN'), deletarPlano);

export default router;
