import { Router } from 'express';
import {
  abrirCaixa,
  fecharCaixa,
  obterAberturaAtiva,
  listarAberturasCaixa,
  listarMovimentos,
  criarMovimento,
} from '../controllers/caixa.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('DONO', 'GERENTE', 'CAIXA', 'ADMIN'));

// Abertura e fechamento
router.post('/abrir', abrirCaixa);
router.post('/:id/fechar', fecharCaixa);

// Consultas
router.get('/comercio/:comercioId', listarAberturasCaixa);
router.get('/ativo/:comercioId/:pdvId?', obterAberturaAtiva);

// Movimentos
router.get('/movimentos/:comercioId', listarMovimentos);
router.post('/movimentos', criarMovimento);

export default router;
