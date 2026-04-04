import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  deletarCategoria,
} from '../controllers/categorias.controller.js';

const router = Router();

// Todas as rotas de categorias exigem autenticação
router.use(authMiddleware);

// GET    /api/categorias        → Listar (DONO, GERENTE, ESTOQUE)
router.get('/', roleMiddleware('DONO', 'GERENTE', 'ESTOQUE'), listarCategorias);

// POST   /api/categorias        → Criar (DONO, GERENTE)
router.post('/', roleMiddleware('DONO', 'GERENTE'), criarCategoria);

// PUT    /api/categorias/:id    → Atualizar (DONO, GERENTE)
router.put('/:id', roleMiddleware('DONO', 'GERENTE'), atualizarCategoria);

// DELETE /api/categorias/:id    → Deletar (DONO apenas)
router.delete('/:id', roleMiddleware('DONO'), deletarCategoria);

export default router;
