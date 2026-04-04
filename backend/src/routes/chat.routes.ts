import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  obterOuCriarChat,
  obterMensagens,
  enviarMensagem,
  marcarComoLido,
  listarChatsEntregador,
  listarChatsCliente,
} from "../controllers/chat.controller.js";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Obter ou criar chat para uma entrega
router.get("/entrega/:entregaId", obterOuCriarChat);

// Listar chats do entregador
router.get("/entregador/lista", listarChatsEntregador);

// Listar chats do cliente
router.get("/cliente/lista", listarChatsCliente);

// Obter mensagens do chat
router.get("/:chatId/mensagens", obterMensagens);

// Enviar mensagem
router.post("/:chatId/mensagens", enviarMensagem);

// Marcar como lido
router.put("/:chatId/lido", marcarComoLido);

export default router;
