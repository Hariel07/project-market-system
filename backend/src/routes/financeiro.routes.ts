import { Router } from 'express';
import {
  getSaldo,
  getTransacoes,
  confirmarPagamento,
  getAssinaturas,
  pagarAssinatura,
} from '../controllers/financeiro.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/saldo',   roleMiddleware('ADMIN', 'DONO', 'GERENTE', 'ENTREGADOR'), getSaldo);
router.get('/transacoes', roleMiddleware('ADMIN', 'DONO', 'GERENTE', 'ENTREGADOR'), getTransacoes);

router.post('/confirmar-pagamento', roleMiddleware('ADMIN', 'DONO', 'GERENTE'), confirmarPagamento);

router.get('/assinaturas',         roleMiddleware('ADMIN', 'DONO'), getAssinaturas);
router.post('/assinaturas/pagar',  roleMiddleware('ADMIN', 'DONO'), pagarAssinatura);

export default router;
