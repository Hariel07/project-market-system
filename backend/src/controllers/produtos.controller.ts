import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function listarProdutos(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    if (!comercioId) { res.status(400).json({ error: 'Usuário não vinculado a nenhum comércio.' }); return; }

    const { categoriaId, busca, ativo } = req.query;
    const where: any = { comercioId };
    if (categoriaId) where.categoriaId = categoriaId as string;
    if (busca) where.nome = { contains: busca as string, mode: 'insensitive' };
    if (ativo !== undefined) where.ativo = ativo === 'true';

    const produtos = await prisma.product.findMany({
      where,
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });

    res.json(produtos);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar produtos.' });
  }
}

export async function buscarProdutoPublico(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const produto = await prisma.product.findFirst({
      where: { id, ativo: true },
      include: {
        categoria: true,
        comercio: {
          select: {
            id: true,
            nomeFantasia: true,
            logoUrl: true,
            taxaEntrega: true,
            tempoMedio: true,
          },
        },
      },
    });

    if (!produto) { res.status(404).json({ error: 'Produto não encontrado.' }); return; }
    res.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto público:', error);
    res.status(500).json({ error: 'Erro interno ao buscar produto.' });
  }
}

export async function buscarProduto(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    const id = req.params.id as string;

    const produto = await prisma.product.findFirst({
      where: { id, comercioId: comercioId || '' },
      include: { categoria: true },
    });

    if (!produto) { res.status(404).json({ error: 'Produto não encontrado.' }); return; }
    res.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno ao buscar produto.' });
  }
}

export async function criarProduto(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    if (!comercioId) { res.status(400).json({ error: 'Usuário não vinculado a nenhum comércio.' }); return; }

    const {
      nome, descricao, precoVenda, precoPromocional, unidade,
      imagemUrl, estoque, estoqueMinimo, categoriaId, isCombo,
      dataValidade, alertaValidadeDias,
    } = req.body;

    if (!nome || precoVenda === undefined) {
      res.status(400).json({ error: 'Nome e preço de venda são obrigatórios.' }); return;
    }

    if (categoriaId) {
      const cat = await prisma.category.findFirst({ where: { id: categoriaId, comercioId } });
      if (!cat) { res.status(400).json({ error: 'Categoria inválida ou não pertence ao seu comércio.' }); return; }
    }

    const produto = await prisma.product.create({
      data: {
        nome,
        descricao: descricao || null,
        precoVenda: parseFloat(precoVenda),
        precoPromocional: precoPromocional ? parseFloat(precoPromocional) : null,
        unidade: unidade || 'UN',
        imagemUrl: imagemUrl || null,
        estoque: estoque ? parseFloat(estoque) : 0,
        estoqueMinimo: estoqueMinimo ? parseFloat(estoqueMinimo) : null,
        isCombo: isCombo || false,
        categoriaId: categoriaId || null,
        comercioId,
        dataValidade: dataValidade ? new Date(dataValidade) : null,
        alertaValidadeDias: alertaValidadeDias ? parseInt(alertaValidadeDias) : null,
      },
      include: { categoria: true },
    });

    res.status(201).json(produto);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno ao criar produto.' });
  }
}

export async function atualizarProduto(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    const id = req.params.id as string;

    const existente = await prisma.product.findFirst({ where: { id, comercioId: comercioId || '' } });
    if (!existente) { res.status(404).json({ error: 'Produto não encontrado ou não pertence ao seu comércio.' }); return; }

    if (req.body.categoriaId) {
      const cat = await prisma.category.findFirst({ where: { id: req.body.categoriaId, comercioId: comercioId || '' } });
      if (!cat) { res.status(400).json({ error: 'Categoria inválida.' }); return; }
    }

    const {
      nome, descricao, precoVenda, precoPromocional, unidade,
      imagemUrl, estoque, estoqueMinimo, categoriaId, isCombo, ativo,
      dataValidade, alertaValidadeDias,
    } = req.body;

    const atualizado = await prisma.product.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(precoVenda !== undefined && { precoVenda: parseFloat(precoVenda) }),
        ...(precoPromocional !== undefined && { precoPromocional: precoPromocional ? parseFloat(precoPromocional) : null }),
        ...(unidade !== undefined && { unidade }),
        ...(imagemUrl !== undefined && { imagemUrl }),
        ...(estoque !== undefined && { estoque: parseFloat(estoque) }),
        ...(estoqueMinimo !== undefined && { estoqueMinimo: estoqueMinimo ? parseFloat(estoqueMinimo) : null }),
        ...(categoriaId !== undefined && { categoriaId }),
        ...(isCombo !== undefined && { isCombo }),
        ...(ativo !== undefined && { ativo }),
        ...(dataValidade !== undefined && { dataValidade: dataValidade ? new Date(dataValidade) : null }),
        ...(alertaValidadeDias !== undefined && { alertaValidadeDias: alertaValidadeDias ? parseInt(alertaValidadeDias) : null }),
      },
      include: { categoria: true },
    });

    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar produto.' });
  }
}

export async function deletarProduto(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    const id = req.params.id as string;

    const existente = await prisma.product.findFirst({ where: { id, comercioId: comercioId || '' } });
    if (!existente) { res.status(404).json({ error: 'Produto não encontrado.' }); return; }

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Produto removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno ao deletar produto.' });
  }
}

// GET /api/produtos/vencendo — produtos próximos do vencimento ou vencidos
export async function listarVencendo(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    if (!comercioId) { res.status(400).json({ error: 'Sem comércio associado.' }); return; }

    const comercio = await (prisma.commerce as any).findUnique({ where: { id: comercioId }, select: { alertaValidadeDias: true } });
    const diasAlerta = (comercio as any)?.alertaValidadeDias ?? 7;

    const limite = new Date();
    limite.setDate(limite.getDate() + diasAlerta);

    const produtos = await (prisma.product as any).findMany({
      where: {
        comercioId,
        ativo: true,
        dataValidade: { not: null, lte: limite },
      },
      include: { categoria: true },
      orderBy: { dataValidade: 'asc' },
    }) as any[];

    const hoje = new Date();
    const resultado = produtos.map((p: any) => ({
      ...p,
      vencido: p.dataValidade ? new Date(p.dataValidade) < hoje : false,
      diasRestantes: p.dataValidade
        ? Math.ceil((new Date(p.dataValidade).getTime() - hoje.getTime()) / 86400000)
        : null,
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao listar vencendo:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
}
