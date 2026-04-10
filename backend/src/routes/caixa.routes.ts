import { Router } from 'express';
import {
  abrirCaixa,
  fecharCaixa,
  obterAberturaAtiva,
  listarAberturasCaixa,
  listarMovimentos,
  criarMovimento,
  registrarVenda,
} from '../controllers/caixa.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('DONO', 'GERENTE', 'CAIXA', 'AJUDANTE_GERAL', 'GARCOM', 'ADMIN'));

// Abertura e fechamento
router.post('/abrir', abrirCaixa);
router.post('/:id/fechar', fecharCaixa);

// Consultas
router.get('/comercio/:comercioId', listarAberturasCaixa);
router.get('/ativo/:comercioId/:pdvId', obterAberturaAtiva);
router.get('/ativo/:comercioId', obterAberturaAtiva);

// Movimentos
router.get('/movimentos/:comercioId', listarMovimentos);
router.post('/movimentos', criarMovimento);

// PDV — Venda
router.post('/venda', registrarVenda);

export default router;
