import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { TipoContaFinanceira, TipoTransacao, StatusTransacao } from '@prisma/client';

// Garante que a ContaFinanceira existe para o comercio/entregador, cria se não existir
async function obterOuCriarConta(tipo: TipoContaFinanceira, comercioId?: string, userId?: string) {
  const where: any = tipo === 'PLATAFORMA' ? { tipo: 'PLATAFORMA' } :
    tipo === 'COMERCIO' ? { comercioId } : { userId };

  let conta = await prisma.contaFinanceira.findFirst({ where });
  if (!conta) {
    conta = await prisma.contaFinanceira.create({
      data: { tipo, comercioId: comercioId ?? null, userId: userId ?? null },
    });
  }
  return conta;
}

// GET /api/financeiro/saldo — Saldo da ContaFinanceira do usuário logado
export async function getSaldo(req: Request, res: Response) {
  try {
    const user = req.user!;
    let conta: any = null;

    if (user.role === 'ADMIN') {
      conta = await prisma.contaFinanceira.findFirst({ where: { tipo: 'PLATAFORMA' } });
      if (!conta) conta = await obterOuCriarConta('PLATAFORMA');
    } else if (user.comercioId) {
      conta = await obterOuCriarConta('COMERCIO', user.comercioId);
    } else if (user.role === 'ENTREGADOR') {
      conta = await obterOuCriarConta('ENTREGADOR', undefined, user.id);
    } else {
      return res.status(400).json({ error: 'Usuário sem conta financeira.' });
    }

    return res.json(conta);
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// GET /api/financeiro/transacoes — Extrato de transações
export async function getTransacoes(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { limit = '20', offset = '0' } = req.query;

    let contaId: string | undefined;

    if (user.comercioId) {
      const conta = await obterOuCriarConta('COMERCIO', user.comercioId);
      contaId = conta.id;
    } else if (user.role === 'ENTREGADOR') {
      const conta = await obterOuCriarConta('ENTREGADOR', undefined, user.id);
      contaId = conta.id;
    } else if (user.role === 'ADMIN') {
      const conta = await prisma.contaFinanceira.findFirst({ where: { tipo: 'PLATAFORMA' } });
      contaId = conta?.id;
    }

    if (!contaId) return res.status(400).json({ error: 'Sem conta financeira.' });

    const transacoes = await prisma.transacaoFinanceira.findMany({
      where: { OR: [{ origemId: contaId }, { destinoId: contaId }] },
      include: { origem: true, destino: true },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    return res.json(transacoes);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// POST /api/financeiro/confirmar-pagamento — Registra pagamento do pedido e divide valores
export async function confirmarPagamento(req: Request, res: Response) {
  try {
    const { pedidoId, valorPago } = req.body;
    if (!pedidoId) return res.status(400).json({ error: 'pedidoId obrigatório.' });

    const pedido = await prisma.order.findUnique({
      where: { id: pedidoId },
      include: { entrega: true, comercio: true },
    });

    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });
    if (pedido.transacaoId) return res.status(409).json({ error: 'Pagamento já confirmado.' });

    const contaComercio = await obterOuCriarConta('COMERCIO', pedido.comercioId);
    const contaPlataforma = await prisma.contaFinanceira.findFirst({ where: { tipo: 'PLATAFORMA' } })
      ?? await obterOuCriarConta('PLATAFORMA');

    const valorFrete = pedido.taxaEntrega ?? 0;
    const valorProdutos = pedido.valorTotal - valorFrete;
    // Plataforma retém 5% sobre os produtos
    const taxaPlataforma = +(valorProdutos * 0.05).toFixed(2);
    const valorLiquidoComercio = +(valorProdutos - taxaPlataforma).toFixed(2);
    const repasseEntregador = pedido.entrega?.taxaRepasse ?? +(valorFrete * 0.7).toFixed(2);

    const resultado = await prisma.$transaction(async (tx) => {
      // Transação principal: cliente → comércio (valor dos produtos líquido)
      const transacaoPrincipal = await tx.transacaoFinanceira.create({
        data: {
          tipo: 'PAGAMENTO_PEDIDO' as TipoTransacao,
          status: 'PROCESSADO' as StatusTransacao,
          destinoId: contaComercio.id,
          valor: valorLiquidoComercio,
          descricao: `Pagamento pedido #${pedidoId.slice(-8).toUpperCase()}`,
          metadata: { metodoPagto: pedido.metodoPagto, valorPago: valorPago ?? pedido.valorTotal },
        },
      });

      // Atualiza saldo do comércio
      await tx.contaFinanceira.update({
        where: { id: contaComercio.id },
        data: { saldo: { increment: valorLiquidoComercio } },
      });

      // Taxa de plataforma: comércio → plataforma
      await tx.transacaoFinanceira.create({
        data: {
          tipo: 'PAGAMENTO_ASSINATURA' as TipoTransacao,
          status: 'PROCESSADO' as StatusTransacao,
          origemId: contaComercio.id,
          destinoId: contaPlataforma.id,
          valor: taxaPlataforma,
          descricao: `Taxa de plataforma pedido #${pedidoId.slice(-8).toUpperCase()}`,
          parentId: transacaoPrincipal.id,
        },
      });
      await tx.contaFinanceira.update({
        where: { id: contaPlataforma.id },
        data: { saldo: { increment: taxaPlataforma } },
      });

      // Repasse frete ao entregador (se atribuído)
      if (pedido.entrega?.entregadorId) {
        const contaEntregador = await obterOuCriarConta('ENTREGADOR', undefined, pedido.entrega.entregadorId);
        await tx.transacaoFinanceira.create({
          data: {
            tipo: 'REPASSE_ENTREGADOR' as TipoTransacao,
            status: 'PROCESSADO' as StatusTransacao,
            destinoId: contaEntregador.id,
            valor: repasseEntregador,
            descricao: `Frete pedido #${pedidoId.slice(-8).toUpperCase()}`,
            parentId: transacaoPrincipal.id,
          },
        });
        await tx.contaFinanceira.update({
          where: { id: contaEntregador.id },
          data: { saldo: { increment: repasseEntregador } },
        });
      }

      // Vincula transação ao pedido e registra valorPago
      await tx.order.update({
        where: { id: pedidoId },
        data: {
          transacaoId: transacaoPrincipal.id,
          valorPago: valorPago ?? pedido.valorTotal,
          status: 'ENTREGUE',
        },
      });

      return transacaoPrincipal;
    });

    return res.json({
      transacao: resultado,
      resumo: { valorProdutos, taxaPlataforma, valorLiquidoComercio, repasseEntregador },
    });
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// GET /api/financeiro/assinaturas — Histórico de assinaturas do comércio
export async function getAssinaturas(req: Request, res: Response) {
  try {
    const comercioId = req.user?.comercioId;
    if (!comercioId) return res.status(403).json({ error: 'Sem comércio associado.' });

    const assinaturas = await prisma.pagamentoAssinatura.findMany({
      where: { comercioId },
      include: { plano: true },
      orderBy: { vencimento: 'desc' },
    });

    return res.json(assinaturas);
  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// POST /api/financeiro/assinaturas/pagar — Paga mensalidade debitando da ContaFinanceira
export async function pagarAssinatura(req: Request, res: Response) {
  try {
    const comercioId = req.user?.comercioId;
    const { pagamentoId } = req.body;

    if (!comercioId) return res.status(403).json({ error: 'Sem comércio associado.' });
    if (!pagamentoId) return res.status(400).json({ error: 'pagamentoId obrigatório.' });

    const pagamento = await prisma.pagamentoAssinatura.findFirst({
      where: { id: pagamentoId, comercioId },
    });
    if (!pagamento) return res.status(404).json({ error: 'Pagamento não encontrado.' });
    if (pagamento.status === 'PAGO') return res.status(409).json({ error: 'Já pago.' });

    const contaComercio = await obterOuCriarConta('COMERCIO', comercioId);
    if (contaComercio.saldo < pagamento.valor) {
      return res.status(402).json({
        error: 'Saldo insuficiente na conta.',
        saldoAtual: contaComercio.saldo,
        valorDevido: pagamento.valor,
      });
    }

    const contaPlataforma = await prisma.contaFinanceira.findFirst({ where: { tipo: 'PLATAFORMA' } })
      ?? await obterOuCriarConta('PLATAFORMA');

    await prisma.$transaction(async (tx) => {
      const transacao = await tx.transacaoFinanceira.create({
        data: {
          tipo: 'PAGAMENTO_ASSINATURA' as TipoTransacao,
          status: 'PROCESSADO' as StatusTransacao,
          origemId: contaComercio.id,
          destinoId: contaPlataforma.id,
          valor: pagamento.valor,
          descricao: `Assinatura ${pagamento.planoId} — ${new Date(pagamento.vencimento).toLocaleDateString('pt-BR')}`,
        },
      });

      await tx.contaFinanceira.update({
        where: { id: contaComercio.id },
        data: { saldo: { decrement: pagamento.valor } },
      });
      await tx.contaFinanceira.update({
        where: { id: contaPlataforma.id },
        data: { saldo: { increment: pagamento.valor } },
      });

      await tx.pagamentoAssinatura.update({
        where: { id: pagamentoId },
        data: { status: 'PAGO', pagoEm: new Date(), contaId: contaComercio.id },
      });
    });

    return res.json({ message: 'Assinatura paga com sucesso.' });
  } catch (error) {
    console.error('Erro ao pagar assinatura:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}
