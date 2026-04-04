import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { PaymentMethod } from '@prisma/client';

const metodoPagtoMap: Record<string, PaymentMethod> = {
  pix: 'PIX',
  credito: 'CREDITO',
  debito: 'DEBITO',
  dinheiro: 'DINHEIRO',
};

// Criar pedido + delivery automaticamente
export async function criarPedido(req: Request, res: Response) {
  try {
    const { comercioId, itens, enderecoEntrega, formaPagamento, observacoes } = req.body;
    const clienteId = req.user!.id;

    if (!comercioId || !itens?.length || !enderecoEntrega || !formaPagamento) {
      return res.status(400).json({ error: 'Campos obrigatórios: comercioId, itens, enderecoEntrega, formaPagamento' });
    }

    const metodoPagto = metodoPagtoMap[formaPagamento.toLowerCase()];
    if (!metodoPagto) {
      return res.status(400).json({ error: 'Forma de pagamento inválida. Use: pix, credito, debito ou dinheiro' });
    }

    // Buscar comércio para obter taxa de entrega
    const comercio = await prisma.commerce.findUnique({ where: { id: comercioId } });
    if (!comercio) return res.status(404).json({ error: 'Comércio não encontrado' });

    // Validar e calcular valor dos itens
    let valorTotal = 0;
    const itensComPreco: { produtoId: string; quantidade: number; precoUnitario: number }[] = [];

    for (const item of itens) {
      const produto = await prisma.product.findUnique({ where: { id: item.produtoId } });
      if (!produto) return res.status(404).json({ error: `Produto ${item.produtoId} não encontrado` });
      if (!produto.ativo) return res.status(400).json({ error: `Produto ${produto.nome} não está disponível` });

      const preco = produto.precoPromocional ?? produto.precoVenda;
      valorTotal += preco * item.quantidade;
      itensComPreco.push({ produtoId: item.produtoId, quantidade: item.quantidade, precoUnitario: preco });
    }

    const taxaEntrega = comercio.taxaEntrega ?? 0;
    valorTotal += taxaEntrega;

    // Criar pedido com itens e delivery em transação
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
          itens: {
            create: itensComPreco,
          },
        },
        include: {
          comercio: true,
          itens: { include: { produto: true } },
        },
      });

      // Criar Delivery automaticamente
      await tx.delivery.create({
        data: {
          pedidoId: novoPedido.id,
          status: 'AGUARDANDO_COLETA',
          taxaRepasse: taxaEntrega * 0.7, // 70% da taxa vai para o entregador
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
          include: {
            entregador: { include: { account: { select: { telefone: true } } } },
          },
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

// Buscar pedido por ID
export async function buscarPedido(req: Request, res: Response) {
  try {
    const id = String(req.params.id);

    const pedido = await prisma.order.findUnique({
      where: { id },
      include: {
        comercio: {
          select: { id: true, nomeFantasia: true, logoUrl: true },
        },
        cliente: {
          select: { nome: true, account: { select: { telefone: true, email: true } } },
        },
        itens: {
          include: { produto: { select: { nome: true, imagemUrl: true } } },
        },
        entrega: {
          include: {
            entregador: {
              select: { nome: true, account: { select: { telefone: true } } },
            },
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
