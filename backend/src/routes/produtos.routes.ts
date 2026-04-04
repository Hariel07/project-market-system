import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
} from '../controllers/produtos.controller.js';

const router = Router();

// Todas as rotas de produtos exigem autenticação
router.use(authMiddleware);

// GET    /api/produtos          → Listar (DONO, GERENTE, ESTOQUE, CAIXA)
router.get('/', roleMiddleware('DONO', 'GERENTE', 'ESTOQUE', 'CAIXA'), listarProdutos);

// GET    /api/produtos/:id      → Buscar um (DONO, GERENTE, ESTOQUE, CAIXA)
router.get('/:id', roleMiddleware('DONO', 'GERENTE', 'ESTOQUE', 'CAIXA'), buscarProduto);

// POST   /api/produtos          → Criar (DONO, GERENTE)
router.post('/', roleMiddleware('DONO', 'GERENTE'), criarProduto);

// PUT    /api/produtos/:id      → Atualizar (DONO, GERENTE, ESTOQUE)
router.put('/:id', roleMiddleware('DONO', 'GERENTE', 'ESTOQUE'), atualizarProduto);

// DELETE /api/produtos/:id      → Deletar (DONO apenas)
router.delete('/:id', roleMiddleware('DONO'), deletarProduto);

export default router;
