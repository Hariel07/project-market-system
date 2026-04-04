import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  criarRating,
  obterRating,
  obterRatingsEntregador,
  adicionarRespostaEntregador,
  obterMeuRating,
} from "../controllers/rating.controller.js";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Criar rating para uma entrega
router.post("/", criarRating);

// Obter ratings de um entregador
router.get("/entregador/:entregadorId", obterRatingsEntregador);

// Obter rating específico
router.get("/:entregaId", obterRating);

// Obter o meu rating para uma entrega
router.get("/entrega/:entregaId/meu", obterMeuRating);

// Adicionar resposta do entregador
router.patch("/:id/resposta", adicionarRespostaEntregador);

export default router;
