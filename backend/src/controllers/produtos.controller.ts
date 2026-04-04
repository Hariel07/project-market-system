import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

/**
 * GET /api/produtos
 * Lista todos os produtos do comércio do usuário logado.
 * Suporta filtros opcionais: ?categoriaId=xxx&busca=nome&ativo=true
 */
export async function listarProdutos(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    if (!comercioId) {
      res.status(400).json({ error: 'Usuário não vinculado a nenhum comércio.' });
      return;
    }

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

/**
 * GET /api/produtos/:id
 * Busca um produto específico por ID.
 */
export async function buscarProduto(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    const id = req.params.id as string;

    const produto = await prisma.product.findFirst({
      where: { id, comercioId: comercioId || '' },
      include: { categoria: true },
    });

    if (!produto) {
      res.status(404).json({ error: 'Produto não encontrado.' });
      return;
    }

    res.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno ao buscar produto.' });
  }
}

/**
 * POST /api/produtos
 * Cria um novo produto vinculado ao comércio do usuário logado.
 */
export async function criarProduto(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    if (!comercioId) {
      res.status(400).json({ error: 'Usuário não vinculado a nenhum comércio.' });
      return;
    }

    const {
      nome,
      descricao,
      precoVenda,
      precoPromocional,
      unidade,
      imagemUrl,
      estoque,
      categoriaId,
      isCombo,
    } = req.body;

    if (!nome || precoVenda === undefined) {
      res.status(400).json({ error: 'Nome e preço de venda são obrigatórios.' });
      return;
    }

    // Se categoriaId foi enviado, verifica se pertence ao mesmo comércio
    if (categoriaId) {
      const categoriaValida = await prisma.category.findFirst({
        where: { id: categoriaId, comercioId },
      });
      if (!categoriaValida) {
        res.status(400).json({ error: 'Categoria inválida ou não pertence ao seu comércio.' });
        return;
      }
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
        isCombo: isCombo || false,
        categoriaId: categoriaId || null,
        comercioId,
      },
      include: { categoria: true },
    });

    res.status(201).json(produto);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno ao criar produto.' });
  }
}

/**
 * PUT /api/produtos/:id
 * Atualiza um produto existente (validando que pertence ao comércio do usuário).
 */
export async function atualizarProduto(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    const id = req.params.id as string;

    const produtoExistente = await prisma.product.findFirst({
      where: { id, comercioId: comercioId || '' },
    });

    if (!produtoExistente) {
      res.status(404).json({ error: 'Produto não encontrado ou não pertence ao seu comércio.' });
      return;
    }

    const {
      nome,
      descricao,
      precoVenda,
      precoPromocional,
      unidade,
      imagemUrl,
      estoque,
      categoriaId,
      isCombo,
      ativo,
    } = req.body;

    // Se categoriaId foi enviado, verifica se pertence ao mesmo comércio
    if (categoriaId) {
      const categoriaValida = await prisma.category.findFirst({
        where: { id: categoriaId, comercioId: comercioId || '' },
      });
      if (!categoriaValida) {
        res.status(400).json({ error: 'Categoria inválida ou não pertence ao seu comércio.' });
        return;
      }
    }

    const produtoAtualizado = await prisma.product.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(precoVenda !== undefined && { precoVenda: parseFloat(precoVenda) }),
        ...(precoPromocional !== undefined && { precoPromocional: precoPromocional ? parseFloat(precoPromocional) : null }),
        ...(unidade !== undefined && { unidade }),
        ...(imagemUrl !== undefined && { imagemUrl }),
        ...(estoque !== undefined && { estoque: parseFloat(estoque) }),
        ...(categoriaId !== undefined && { categoriaId }),
        ...(isCombo !== undefined && { isCombo }),
        ...(ativo !== undefined && { ativo }),
      },
      include: { categoria: true },
    });

    res.json(produtoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar produto.' });
  }
}

/**
 * DELETE /api/produtos/:id
 * Remove um produto (validando que pertence ao comércio do usuário).
 */
export async function deletarProduto(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    const id = req.params.id as string;

    const produtoExistente = await prisma.product.findFirst({
      where: { id, comercioId: comercioId || '' },
    });

    if (!produtoExistente) {
      res.status(404).json({ error: 'Produto não encontrado ou não pertence ao seu comércio.' });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Produto removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno ao deletar produto.' });
  }
}
