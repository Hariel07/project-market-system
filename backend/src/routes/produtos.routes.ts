import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  listarVencendo,
} from '../controllers/produtos.controller.js';

const router = Router();

router.use(authMiddleware);

// Rota específica antes do /:id para não ser interceptada
router.get('/vencendo', roleMiddleware('ADMIN', 'DONO', 'GERENTE', 'ESTOQUE'), listarVencendo);

router.get('/',    roleMiddleware('ADMIN', 'DONO', 'GERENTE', 'ESTOQUE', 'CAIXA'), listarProdutos);
router.get('/:id', roleMiddleware('ADMIN', 'DONO', 'GERENTE', 'ESTOQUE', 'CAIXA'), buscarProduto);
router.post('/',   roleMiddleware('ADMIN', 'DONO', 'GERENTE', 'ESTOQUE'), criarProduto);
router.put('/:id', roleMiddleware('ADMIN', 'DONO', 'GERENTE', 'ESTOQUE'), atualizarProduto);
router.delete('/:id', roleMiddleware('ADMIN', 'DONO', 'GERENTE'), deletarProduto);

export default router;
