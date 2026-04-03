import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  criarNotificacao,
  obterNotificacoes,
  obterNaoLidas,
  contarNaoLidas,
  marcarComoLida,
  marcarTodasComoLida,
  deletarNotificacao,
} from "../controllers/notification.controller";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Criar notificação (via API interna ou admin)
router.post("/", criarNotificacao);

// Obter todas as notificações
router.get("/", obterNotificacoes);

// Obter notificações não lidas
router.get("/nao-lidas/lista", obterNaoLidas);

// Contar não lidas
router.get("/nao-lidas/count", contarNaoLidas);

// Marcar como lida
router.put("/:id/lido", marcarComoLida);

// Marcar todas como lida
router.put("/", marcarTodasComoLida);

// Deletar notificação
router.delete("/:id", deletarNotificacao);

export default router;
