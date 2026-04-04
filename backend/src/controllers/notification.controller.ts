import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// Criar notificação
export async function criarNotificacao(req: Request, res: Response) {
  try {
    const { userId, tipo, titulo, corpo, icone, entregaId, dados } = req.body;

    if (!userId || !tipo || !titulo || !corpo) {
      return res.status(400).json({
        erro: "userId, tipo, titulo e corpo são obrigatórios",
      });
    }

    const notificacao = await prisma.notification.create({
      data: {
        userId,
        tipo,
        titulo,
        corpo,
        icone: icone || null,
        entregaId: entregaId || null,
        dados: dados ? JSON.stringify(dados) : null,
        lido: false,
      },
    });

    res.status(201).json(notificacao);
  } catch (erro: any) {
    console.error("Erro ao criar notificação:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Obter notificações do usuário
export async function obterNotificacoes(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    const notificacoes = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(notificacoes);
  } catch (erro: any) {
    console.error("Erro ao obter notificações:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Obter notificações não lidas
export async function obterNaoLidas(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    const notificacoes = await prisma.notification.findMany({
      where: { userId, lido: false },
      orderBy: { createdAt: "desc" },
    });

    res.json(notificacoes);
  } catch (erro: any) {
    console.error("Erro ao obter notificações não lidas:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Contar notificações não lidas
export async function contarNaoLidas(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    const count = await prisma.notification.count({
      where: { userId, lido: false },
    });

    res.json({ count });
  } catch (erro: any) {
    console.error("Erro ao contar notificações:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Marcar como lida
export async function marcarComoLida(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    // Verificar permissão
    const notificacao = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notificacao || notificacao.userId !== userId) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { lido: true },
    });

    res.json(updated);
  } catch (erro: any) {
    console.error("Erro ao marcar como lida:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Marcar todas como lida
export async function marcarTodasComoLida(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    await prisma.notification.updateMany({
      where: { userId, lido: false },
      data: { lido: true },
    });

    res.json({ sucesso: true });
  } catch (erro: any) {
    console.error("Erro ao marcar todas como lida:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Deletar notificação
export async function deletarNotificacao(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    // Verificar permissão
    const notificacao = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notificacao || notificacao.userId !== userId) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({ sucesso: true });
  } catch (erro: any) {
    console.error("Erro ao deletar notificação:", erro);
    res.status(500).json({ erro: erro.message });
  }
}
