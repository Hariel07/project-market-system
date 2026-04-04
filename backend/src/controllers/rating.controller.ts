import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// Criar rating/avaliação
export async function criarRating(req: Request, res: Response) {
  try {
    const { entregaId, estrelas, comentario } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    if (!entregaId || !estrelas) {
      return res.status(400).json({
        erro: "entregaId e estrelas são obrigatórios",
      });
    }

    if (estrelas < 1 || estrelas > 5) {
      return res.status(400).json({
        erro: "Estrelas deve ser entre 1 e 5",
      });
    }

    // Obter informações da entrega
    const entrega = await prisma.delivery.findUnique({
      where: { id: entregaId },
      include: { pedido: true },
    });

    if (!entrega) {
      return res.status(404).json({ erro: "Entrega não encontrada" });
    }

    // Verificar se o usuário é o cliente
    if (entrega.pedido.clienteId !== userId) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    // Verificar se já existe rating
    const existente = await prisma.rating.findUnique({
      where: { entregaId },
    });

    if (existente) {
      return res.status(400).json({ erro: "Este pedido já foi avaliado" });
    }

    // Criar rating
    const rating = await prisma.rating.create({
      data: {
        entregaId,
        entregadorId: entrega.entregadorId!,
        clienteId: userId,
        estrelas: Math.floor(estrelas),
        comentario: comentario || null,
      },
      include: {
        entregador: { select: { id: true, nome: true } },
        cliente: { select: { id: true, nome: true } },
      },
    });

    // Criar notificação para o entregador
    await prisma.notification.create({
      data: {
        userId: entrega.entregadorId!,
        tipo: "rating",
        titulo: "Nova Avaliação",
        corpo: `Você recebeu uma ${estrelas}-⭐ avaliação`,
        icone: "⭐",
        entregaId: entregaId,
        dados: JSON.stringify({
          estrelas,
          comentario: comentario || "Sem comentário",
        }),
      },
    });

    res.status(201).json(rating);
  } catch (erro: any) {
    console.error("Erro ao criar rating:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Obter rating de uma entrega
export async function obterRating(req: Request, res: Response) {
  try {
    const entregaId = Array.isArray(req.params.entregaId)
      ? req.params.entregaId[0]
      : req.params.entregaId;

    const rating = await prisma.rating.findUnique({
      where: { entregaId },
      include: {
        entregador: { select: { id: true, nome: true } },
        cliente: { select: { id: true, nome: true } },
      },
    });

    if (!rating) {
      return res.status(404).json({ erro: "Rating não encontrado" });
    }

    res.json(rating);
  } catch (erro: any) {
    console.error("Erro ao obter rating:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Obter ratings do entregador (média e histórico)
export async function obterRatingsEntregador(req: Request, res: Response) {
  try {
    const entregadorId = Array.isArray(req.params.entregadorId)
      ? req.params.entregadorId[0]
      : req.params.entregadorId;

    const ratings = await prisma.rating.findMany({
      where: { entregadorId },
      include: {
        cliente: { select: { id: true, nome: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calcular média
    let media = 0;
    if (ratings.length > 0) {
      const soma = ratings.reduce((acc, r) => acc + r.estrelas, 0);
      media = parseFloat((soma / ratings.length).toFixed(2));
    }

    res.json({
      entregadorId,
      total: ratings.length,
      media,
      ratings,
    });
  } catch (erro: any) {
    console.error("Erro ao obter ratings:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Adicionar resposta do entregador
export async function adicionarRespostaEntregador(
  req: Request,
  res: Response
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { resposta } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    if (!resposta?.trim()) {
      return res.status(400).json({ erro: "Resposta é obrigatória" });
    }

    // Verificar permissão
    const rating = await prisma.rating.findUnique({
      where: { id },
    });

    if (!rating || rating.entregadorId !== userId) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    const updated = await prisma.rating.update({
      where: { id },
      data: { respostaEntregador: resposta.trim() },
      include: {
        entregador: { select: { id: true, nome: true } },
        cliente: { select: { id: true, nome: true } },
      },
    });

    // Notificar cliente
    await prisma.notification.create({
      data: {
        userId: rating.clienteId,
        tipo: "resposta_rating",
        titulo: "Resposta do Entregador",
        corpo: `${updated.entregador?.nome || "Um entregador"} respondeu sua avaliação`,
        icone: "💬",
        entregaId: rating.entregaId,
      },
    });

    res.json(updated);
  } catch (erro: any) {
    console.error("Erro ao adicionar resposta:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Obter rating do cliente para uma entrega
export async function obterMeuRating(req: Request, res: Response) {
  try {
    const entregaId = Array.isArray(req.params.entregaId)
      ? req.params.entregaId[0]
      : req.params.entregaId;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    const rating = await prisma.rating.findUnique({
      where: { entregaId },
    });

    if (!rating || rating.clienteId !== userId) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    res.json(rating);
  } catch (erro: any) {
    console.error("Erro ao obter meu rating:", erro);
    res.status(500).json({ erro: erro.message });
  }
}
