import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { PaymentMethod } from '@prisma/client';

const metodoPagtoMap: Record<string, PaymentMethod> = {
  pix: 'PIX',
  credito: 'CREDITO',
  debito: 'DEBITO',
  dinheiro: 'DINHEIRO',
};

// Criar pedido + delivery + transação financeira automaticamente
export async function criarPedido(req: Request, res: Response) {
  try {
    const { comercioId, itens, enderecoEntrega, formaPagamento, observacoes, troco } = req.body;
    const clienteId = req.user!.id;

    if (!comercioId || !itens?.length || !enderecoEntrega || !formaPagamento) {
      return res.status(400).json({ error: 'Campos obrigatórios: comercioId, itens, enderecoEntrega, formaPagamento' });
    }

    const metodoPagto = metodoPagtoMap[formaPagamento.toLowerCase()];
    if (!metodoPagto) {
      return res.status(400).json({ error: 'Forma de pagamento inválida. Use: pix, credito, debito ou dinheiro' });
    }

    if (metodoPagto === 'DINHEIRO' && troco !== undefined && troco < 0) {
      return res.status(400).json({ error: 'Valor do troco inválido' });
    }

    const comercio = await prisma.commerce.findUnique({ where: { id: comercioId } });
    if (!comercio) return res.status(404).json({ error: 'Comércio não encontrado' });

    let valorItens = 0;
    const itensComPreco: { produtoId: string; quantidade: number; precoUnitario: number }[] = [];

    for (const item of itens) {
      const produto = await prisma.product.findUnique({ where: { id: item.produtoId } });
      if (!produto) return res.status(404).json({ error: `Produto ${item.produtoId} não encontrado` });
      if (!produto.ativo) return res.status(400).json({ error: `Produto "${produto.nome}" não está disponível` });

      const preco = produto.precoPromocional ?? produto.precoVenda;
      valorItens += preco * item.quantidade;
      itensComPreco.push({ produtoId: item.produtoId, quantidade: item.quantidade, precoUnitario: preco });
    }

    const taxaEntrega = comercio.taxaEntrega ?? 0;
    const valorTotal = valorItens + taxaEntrega;

    // Cria pedido + delivery em transação atômica
    const pedido = await prisma.$transaction(async (tx) => {
      const novoPedido = await tx.order.create({
        data: {
          comercioId,
          clienteId,
          status: 'PENDENTE',
          valorTotal,
          taxaEntrega,
          metodoPagto,
          observacoes: observacoes ?? null,
          enderecoEntrega,
          troco: metodoPagto === 'DINHEIRO' && troco ? parseFloat(troco) : null,
          itens: { create: itensComPreco },
        },
        include: {
          comercio: true,
          itens: { include: { produto: true } },
        },
      });

      await tx.delivery.create({
        data: {
          pedidoId: novoPedido.id,
          status: 'AGUARDANDO_COLETA',
          taxaRepasse: taxaEntrega * 0.7,
        },
      });

      return novoPedido;
    });

    return res.status(201).json(pedido);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return res.status(500).json({ error: 'Erro ao criar pedido' });
  }
}

// Listar pedidos do cliente
export async function listarPedidosCliente(req: Request, res: Response) {
  try {
    const clienteId = req.user!.id;

    const pedidos = await prisma.order.findMany({
      where: { clienteId },
      include: {
        comercio: { select: { id: true, nomeFantasia: true, logoUrl: true } },
        itens: { include: { produto: { select: { nome: true } } } },
        entrega: {
          include: { entregador: { include: { account: { select: { telefone: true } } } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(pedidos);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
}

// Listar pedidos do comércio (para DONO/GERENTE)
export async function listarPedidosComercio(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { comercioId: true },
    });

    if (!usuario?.comercioId) {
      return res.status(400).json({ error: 'Usuário não vinculado a nenhum comércio' });
    }

    const { status } = req.query;

    const pedidos = await prisma.order.findMany({
      where: {
        comercioId: usuario.comercioId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        cliente: { select: { nome: true, account: { select: { telefone: true } } } },
        itens: { include: { produto: { select: { nome: true, imagemUrl: true } } } },
        entrega: { select: { id: true, status: true, entregadorId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(pedidos);
  } catch (error) {
    console.error('Erro ao listar pedidos do comércio:', error);
    return res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
}

// Avançar status do pedido (DONO/GERENTE) + gera transação ao confirmar entrega
export async function atualizarStatusPedido(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const userId = req.user!.id;

    const statusValidos = ['PENDENTE', 'PREPARANDO', 'PRONTO', 'CANCELADO'];
    if (!status || !statusValidos.includes(status)) {
      return res.status(400).json({ error: `Status inválido. Use: ${statusValidos.join(', ')}` });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { comercioId: true },
    });

    const pedido = await prisma.order.findUnique({ where: { id } });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (pedido.comercioId !== usuario?.comercioId) {
      return res.status(403).json({ error: 'Sem permissão para este pedido' });
    }

    const atualizado = await prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        itens: { include: { produto: { select: { nome: true } } } },
        entrega: { select: { id: true, status: true } },
      },
    });

    return res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return res.status(500).json({ error: 'Erro ao atualizar status' });
  }
}

// Buscar pedido por ID
export async function buscarPedido(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const pedido = await prisma.order.findUnique({
      where: { id },
      include: {
        comercio: { select: { id: true, nomeFantasia: true, logoUrl: true } },
        cliente: { select: { nome: true, account: { select: { telefone: true, email: true } } } },
        itens: { include: { produto: { select: { nome: true, imagemUrl: true } } } },
        entrega: {
          include: {
            entregador: { select: { nome: true, account: { select: { telefone: true } } } },
          },
        },
      },
    });

    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    return res.json(pedido);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
}
