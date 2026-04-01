import { Router } from 'express';
import { criarPedido, listarPedidosCliente, buscarPedido } from '../controllers/pedidos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

// Criar pedido — apenas CLIENTE
router.post('/', roleMiddleware('CLIENTE'), criarPedido);

// Listar meus pedidos — apenas CLIENTE (usa req.user.id internamente)
router.get('/meus', roleMiddleware('CLIENTE'), listarPedidosCliente);

// Buscar pedido por ID — CLIENTE, DONO, ADMIN
router.get('/:id', roleMiddleware('CLIENTE', 'DONO', 'GERENTE', 'ADMIN'), buscarPedido);

export default router;
