import { Router } from 'express';
import {
  criarPedido,
  listarPedidosCliente,
  listarPedidosComercio,
  atualizarStatusPedido,
  buscarPedido,
} from '../controllers/pedidos.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);

// Criar pedido — apenas CLIENTE
router.post('/', roleMiddleware('CLIENTE'), criarPedido);

// Listar meus pedidos — apenas CLIENTE
router.get('/meus', roleMiddleware('CLIENTE'), listarPedidosCliente);

// Listar pedidos do comércio — DONO, GERENTE, ADMIN
router.get('/comercio', roleMiddleware('DONO', 'GERENTE', 'ADMIN'), listarPedidosComercio);

// Avançar status do pedido — DONO, GERENTE, ADMIN
router.patch('/:id/status', roleMiddleware('DONO', 'GERENTE', 'ADMIN'), atualizarStatusPedido);

// Buscar pedido por ID — CLIENTE, DONO, GERENTE, ADMIN
router.get('/:id', roleMiddleware('CLIENTE', 'DONO', 'GERENTE', 'ADMIN'), buscarPedido);

export default router;
