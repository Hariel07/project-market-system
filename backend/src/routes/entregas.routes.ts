import { Router } from 'express';
import {
  listarOportunidades,
  buscarEntregaPorPedido,
  aceitarEntrega,
  rejeitarEntrega,
  atualizarLocalizacao,
  confirmarColeta,
  confirmarEntrega,
  minhasEntregas,
  obterHistoricoEntregas,
} from '../controllers/entregas.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

// Rotas de leitura — entregador e admin podem acessar
router.get('/oportunidades', roleMiddleware('ENTREGADOR', 'ADMIN'), listarOportunidades);
router.get('/historico', roleMiddleware('ENTREGADOR', 'ADMIN'), obterHistoricoEntregas);
router.get('/entregador/:entregadorId', roleMiddleware('ENTREGADOR', 'ADMIN'), minhasEntregas);
router.get('/pedido/:pedidoId', roleMiddleware('ENTREGADOR', 'ADMIN'), buscarEntregaPorPedido);

// Rotas de ação — apenas entregador
router.post('/:entregaId/aceitar', roleMiddleware('ENTREGADOR'), aceitarEntrega);
router.post('/:entregaId/rejeitar', roleMiddleware('ENTREGADOR'), rejeitarEntrega);
router.post('/:entregaId/gps', roleMiddleware('ENTREGADOR'), atualizarLocalizacao);
router.post('/:entregaId/coleta', roleMiddleware('ENTREGADOR'), confirmarColeta);
router.post('/:entregaId/entregar', roleMiddleware('ENTREGADOR'), confirmarEntrega);

export default router;
