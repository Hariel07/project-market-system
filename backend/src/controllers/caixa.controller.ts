import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { TipoMovimentoCaixa } from '@prisma/client';

// ========== VENDA PDV ==========

export const registrarVenda = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { comercioId, pdvId, itens, formaPagamento, valorRecebido } = req.body;

  if (!comercioId || !itens || !Array.isArray(itens) || itens.length === 0) {
    res.status(400).json({ error: 'comercioId e itens são obrigatórios.' });
    return;
  }

  try {
    // Buscar caixa ativo do comércio (não filtra por pdvId — PDVs são terminais do mesmo caixa)
    const caixaAtivo = await (prisma.aberturaCaixa as any).findFirst({
      where: { comercioId, status: 'ABERTA' },
      orderBy: { dataAbertura: 'desc' },
    });
    if (!caixaAtivo) {
      res.status(400).json({ error: 'Nenhum caixa aberto para este comércio.' });
      return;
    }

    // Calcular total e validar estoque
    let total = 0;
    const linhas: { produtoId: string; quantidade: number; precoUnitario: number; subtotal: number }[] = [];

    for (const item of itens) {
      const produto = await prisma.product.findUnique({ where: { id: item.produtoId } });
      if (!produto) { res.status(404).json({ error: `Produto ${item.produtoId} não encontrado.` }); return; }
      if (produto.estoque < item.quantidade) {
        res.status(400).json({ error: `Estoque insuficiente para "${produto.nome}": disponível ${produto.estoque}.` });
        return;
      }
      const preco = item.precoUnitario ?? produto.precoVenda;
      const sub = preco * item.quantidade;
      total += sub;
      linhas.push({ produtoId: produto.id, quantidade: item.quantidade, precoUnitario: preco, subtotal: sub });
    }

    // Baixar estoque e registrar venda atomicamente
    await prisma.$transaction(async (tx: any) => {
      // Baixar estoque de cada produto
      for (const linha of linhas) {
        await tx.product.update({
          where: { id: linha.produtoId },
          data: { estoque: { decrement: linha.quantidade } },
        });
      }

      // Registrar movimento de caixa
      await tx.movimentoCaixa.create({
        data: {
          comercioId,
          pdvId: pdvId || null,
          tipo: 'VENDA' as TipoMovimentoCaixa,
          valor: total,
          descricao: `Venda PDV — ${formaPagamento || 'DINHEIRO'} — ${linhas.length} item(ns)`,
          responsavelId: userId,
          aberturaCaixaId: caixaAtivo.id,
        },
      });
    });

    const troco = formaPagamento === 'DINHEIRO' && valorRecebido ? valorRecebido - total : 0;

    res.status(201).json({
      ok: true,
      total,
      troco: Math.max(0, troco),
      itens: linhas,
      formaPagamento: formaPagamento || 'DINHEIRO',
    });
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    res.status(500).json({ error: 'Erro ao registrar venda.' });
  }
};

// ========== MOVIMENTO DE CAIXA ==========

export const listarMovimentos = async (req: Request, res: Response) => {
  try {
    const comercioId = req.params.comercioId;
    const { pdvId, tipo, dataInicio, dataFim } = req.query;

    let filtros: any = { comercioId };
    if (pdvId) filtros.pdvId = pdvId as string;
    if (tipo) filtros.tipo = tipo as TipoMovimentoCaixa;
    if (dataInicio || dataFim) {
      filtros.createdAt = {};
      if (dataInicio) filtros.createdAt.gte = new Date(dataInicio as string);
      if (dataFim) filtros.createdAt.lte = new Date(dataFim as string);
    }

    const movimentos = await prisma.movimentoCaixa.findMany({
      where: filtros,
      include: { responsavel: true, aberturaCaixa: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalEntrada = movimentos
      .filter(m => m.valor > 0)
      .reduce((sum, m) => sum + m.valor, 0);

    const totalSaida = movimentos
      .filter(m => m.valor < 0)
      .reduce((sum, m) => sum + Math.abs(m.valor), 0);

    res.json({
      movimentos,
      resumo: {
        total: movimentos.length,
        totalEntrada,
        totalSaida,
        saldo: totalEntrada - totalSaida,
      },
    });
  } catch (error) {
    console.error('Erro ao listar movimentos:', error);
    res.status(500).json({ error: 'Erro ao listar movimentos' });
  }
};

export const criarMovimento = async (req: Request, res: Response) => {
  try {
    const { comercioId, pdvId, tipo, valor, descricao, referencia } = req.body;
    const userId = req.user!.id;

    if (!comercioId || !tipo || valor === undefined || !descricao) {
      return res.status(400).json({ error: 'Campos obrigatórios: comercioId, tipo, valor, descricao' });
    }

    // Buscar abertura de caixa ativa do comércio (PDVs compartilham o mesmo caixa)
    const aberturaCaixa = await (prisma.aberturaCaixa as any).findFirst({
      where: { comercioId, status: 'ABERTA' },
      orderBy: { dataAbertura: 'desc' },
    });

    const movimento = await prisma.movimentoCaixa.create({
      data: {
        comercioId,
        pdvId,
        tipo: tipo as TipoMovimentoCaixa,
        valor,
        descricao,
        referencia,
        responsavelId: userId,
        aberturaCaixaId: aberturaCaixa?.id,
      },
      include: { responsavel: true },
    });

    res.status(201).json(movimento);
  } catch (error) {
    console.error('Erro ao criar movimento:', error);
    res.status(500).json({ error: 'Erro ao criar movimento' });
  }
};

export const atualizarMovimento = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { valor, descricao } = req.body;

    const movimento = await prisma.movimentoCaixa.update({
      where: { id },
      data: {
        valor: valor !== undefined ? valor : undefined,
        descricao: descricao !== undefined ? descricao : undefined,
      },
      include: { responsavel: true },
    });

    res.json(movimento);
  } catch (error) {
    console.error('Erro ao atualizar movimento:', error);
    res.status(500).json({ error: 'Erro ao atualizar movimento' });
  }
};

export const deletarMovimento = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await prisma.movimentoCaixa.delete({ where: { id } });
    res.json({ msg: 'Movimento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar movimento:', error);
    res.status(500).json({ error: 'Erro ao deletar movimento' });
  }
};

// ========== ABERTURA E FECHAMENTO DE CAIXA ==========

export const abrirCaixa = async (req: Request, res: Response) => {
  try {
    const { comercioId, pdvId, saldoInicial, observacoes } = req.body;
    const userId = req.user!.id;

    // Verificar se há caixa aberta
    const caixaAberta = await (prisma.aberturaCaixa as any).findFirst({
      where: { comercioId, status: 'ABERTA', pdvId: pdvId || undefined },
    });

    if (caixaAberta) {
      return res.status(400).json({ error: 'Já existe um caixa aberto para este PDV' });
    }

    const aberturaCaixa = await (prisma.aberturaCaixa as any).create({
      data: {
        comercioId,
        pdvId,
        saldoInicial: saldoInicial || 0,
        status: 'ABERTA',
        responsavelId: userId,
        observacoes,
      },
      include: { responsavel: true },
    });

    // Criar movimento de abertura
    await prisma.movimentoCaixa.create({
      data: {
        comercioId,
        pdvId,
        tipo: 'ABERTURA',
        valor: saldoInicial || 0,
        descricao: `Abertura de caixa - Saldo inicial: R$ ${saldoInicial || 0}`,
        responsavelId: userId,
        aberturaCaixaId: aberturaCaixa.id,
      },
    });

    // Marcar loja como aberta
    await prisma.commerce.update({
      where: { id: comercioId },
      data: { isOpen: true },
    });

    res.status(201).json(aberturaCaixa);
  } catch (error) {
    console.error('Erro ao abrir caixa:', error);
    res.status(500).json({ error: 'Erro ao abrir caixa' });
  }
};

export const fecharCaixa = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { saldoFinal, observacoes } = req.body;
    const userId = req.user!.id;

    const aberturaCaixa = await (prisma.aberturaCaixa as any).update({
      where: { id },
      data: {
        status: 'FECHADA',
        saldoFinal,
        dataFechamento: new Date(),
        observacoes,
      },
      include: { responsavel: true, movimentos: true },
    });

    // Calcular diferença
    const totalMovimentos = (aberturaCaixa.movimentos as any[])
      .filter((m: any) => m.tipo !== 'ABERTURA' && m.tipo !== 'FECHAMENTO')
      .reduce((sum: number, m: any) => sum + m.valor, 0);

    const diferenca = (saldoFinal || 0) - (aberturaCaixa.saldoInicial + totalMovimentos);

    // Criar movimento de fechamento
    if (diferenca !== 0) {
      await prisma.movimentoCaixa.create({
        data: {
          comercioId: aberturaCaixa.comercioId,
          pdvId: aberturaCaixa.pdvId,
          tipo: 'AJUSTE',
          valor: diferenca,
          descricao: `Ajuste de fechamento - Diferença: R$ ${diferenca.toFixed(2)}`,
          responsavelId: userId,
          aberturaCaixaId: id,
        },
      });
    }

    // Marcar loja como fechada
    await prisma.commerce.update({
      where: { id: aberturaCaixa.comercioId },
      data: { isOpen: false },
    });

    res.json(aberturaCaixa);
  } catch (error) {
    console.error('Erro ao fechar caixa:', error);
    res.status(500).json({ error: 'Erro ao fechar caixa' });
  }
};

export const listarAberturasCaixa = async (req: Request, res: Response) => {
  try {
    const comercioId = req.params.comercioId;
    const { pdvId, status } = req.query;

    let filtros: any = { comercioId };
    if (pdvId) filtros.pdvId = pdvId as string;
    if (status) filtros.status = status as string;

    const aberturas = await (prisma.aberturaCaixa as any).findMany({
      where: filtros,
      include: { responsavel: true, movimentos: true },
      orderBy: { dataAbertura: 'desc' },
    });

    res.json(aberturas);
  } catch (error) {
    console.error('Erro ao listar aberturas:', error);
    res.status(500).json({ error: 'Erro ao listar aberturas' });
  }
};

export const obterAberturaAtiva = async (req: Request, res: Response) => {
  try {
    const { comercioId, pdvId } = req.params;

    const abertura = await (prisma.aberturaCaixa as any).findFirst({
      where: { comercioId, status: 'ABERTA', pdvId: pdvId || undefined },
      include: { responsavel: true, movimentos: true },
      orderBy: { dataAbertura: 'desc' },
    });

    if (!abertura) {
      return res.status(404).json({ error: 'Nenhum caixa aberto' });
    }

    const movimentos: any[] = abertura.movimentos ?? [];
    const totalMovimentos = movimentos
      .filter((m: any) => m.tipo !== 'ABERTURA')
      .reduce((sum: number, m: any) => sum + m.valor, 0);

    res.json({
      ...abertura,
      saldoAtual: abertura.saldoInicial + totalMovimentos,
      totalMovimentos: movimentos.length,
    });
  } catch (error) {
    console.error('Erro ao obter abertura ativa:', error);
    res.status(500).json({ error: 'Erro ao obter abertura ativa' });
  }
};
