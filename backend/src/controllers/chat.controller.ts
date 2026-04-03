import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Obter ou criar Chat para uma entrega
export async function obterOuCriarChat(req: Request, res: Response) {
  try {
    const entregaId = Array.isArray(req.params.entregaId)
      ? req.params.entregaId[0]
      : req.params.entregaId;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    // Verificar se a entrega existe
    const entrega = await prisma.delivery.findUnique({
      where: { id: entregaId },
      include: { pedido: { include: { cliente: true } }, entregador: true },
    });

    if (!entrega) {
      return res.status(404).json({ erro: "Entrega não encontrada" });
    }

    // Verificar permissão (apenas entregador ou cliente podem acessar)
    if (
      userId !== entrega.entregadorId &&
      userId !== entrega.pedido?.cliente?.id
    ) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    // Procurar ou criar chat
    let chat = await prisma.chat.findUnique({
      where: { entregaId: entregaId },
      include: { mensagens: { orderBy: { createdAt: "asc" } } },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          entregaId: entregaId,
          entregadorId: entrega.entregadorId!,
          clienteId: entrega.pedido?.cliente?.id!,
        },
        include: { mensagens: true },
      });
    }

    res.json(chat);
  } catch (erro: any) {
    console.error("Erro ao obter/criar chat:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Obter mensagens do chat
export async function obterMensagens(req: Request, res: Response) {
  try {
    const chatId = Array.isArray(req.params.chatId)
      ? req.params.chatId[0]
      : req.params.chatId;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    // Verificar permissão
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return res.status(404).json({ erro: "Chat não encontrado" });
    }

    if (userId !== chat.entregadorId && userId !== chat.clienteId) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    const mensagens = await prisma.chatMessage.findMany({
      where: { chatId: chatId },
      orderBy: { createdAt: "asc" },
      include: { usuario: { select: { nome: true } } },
    });

    res.json(mensagens);
  } catch (erro: any) {
    console.error("Erro ao obter mensagens:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Enviar mensagem
export async function enviarMensagem(req: Request, res: Response) {
  try {
    const chatId = Array.isArray(req.params.chatId)
      ? req.params.chatId[0]
      : req.params.chatId;
    const { conteudo } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    if (!conteudo?.trim()) {
      return res.status(400).json({ erro: "Conteúdo da mensagem é obrigatório" });
    }

    // Verificar permissão
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return res.status(404).json({ erro: "Chat não encontrado" });
    }

    if (userId !== chat.entregadorId && userId !== chat.clienteId) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    // Determinar quem enviou (entregador ou cliente)
    const enviadoPor = userId === chat.entregadorId ? "entregador" : "cliente";

    // Criar mensagem
    const mensagem = await prisma.chatMessage.create({
      data: {
        chatId: chatId,
        userId: userId,
        conteudo: conteudo.trim(),
        enviahoPor: enviadoPor,
        lido: false,
      },
      include: { usuario: { select: { nome: true } } },
    });

    // Atualizar última mensagem do chat
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        ultimaMensagem: conteudo.trim(),
        ultimaAtividadeEm: new Date(),
      },
    });

    res.status(201).json(mensagem);
  } catch (erro: any) {
    console.error("Erro ao enviar mensagem:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Marcar mensagens como lidas
export async function marcarComoLido(req: Request, res: Response) {
  try {
    const chatId = Array.isArray(req.params.chatId)
      ? req.params.chatId[0]
      : req.params.chatId;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    // Verificar permissão
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return res.status(404).json({ erro: "Chat não encontrado" });
    }

    if (userId !== chat.entregadorId && userId !== chat.clienteId) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    // Marcar todas as mensagens não lidas como lidas
    await prisma.chatMessage.updateMany({
      where: {
        chatId: chatId,
        lido: false,
        NOT: { userId: userId },
      },
      data: { lido: true },
    });

    res.json({ sucesso: true });
  } catch (erro: any) {
    console.error("Erro ao marcar como lido:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Listar chats do entregador
export async function listarChatsEntregador(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    const chats = await prisma.chat.findMany({
      where: { entregadorId: userId },
      include: {
        entrega: { include: { pedido: true } },
        cliente: { select: { id: true, nome: true } },
        mensagens: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { ultimaAtividadeEm: "desc" },
    });

    res.json(chats);
  } catch (erro: any) {
    console.error("Erro ao listar chats:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

// Listar chats do cliente
export async function listarChatsCliente(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    const chats = await prisma.chat.findMany({
      where: { clienteId: userId },
      include: {
        entrega: { include: { pedido: true } },
        entregador: { select: { id: true, nome: true } },
        mensagens: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { ultimaAtividadeEm: "desc" },
    });

    res.json(chats);
  } catch (erro: any) {
    console.error("Erro ao listar chats:", erro);
    res.status(500).json({ erro: erro.message });
  }
}
