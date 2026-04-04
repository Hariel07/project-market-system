import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

/**
 * GET /api/categorias
 * Lista todas as categorias do comércio do usuário logado.
 */
export async function listarCategorias(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    if (!comercioId) {
      res.status(400).json({ error: 'Usuário não vinculado a nenhum comércio.' });
      return;
    }

    const categorias = await prisma.category.findMany({
      where: { comercioId },
      include: { _count: { select: { produtos: true } } },
      orderBy: { nome: 'asc' },
    });

    res.json(categorias);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro interno ao buscar categorias.' });
  }
}

/**
 * POST /api/categorias
 * Cria uma nova categoria no comércio do usuário logado.
 */
export async function criarCategoria(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    if (!comercioId) {
      res.status(400).json({ error: 'Usuário não vinculado a nenhum comércio.' });
      return;
    }

    const { nome, icone } = req.body;

    if (!nome) {
      res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
      return;
    }

    const categoria = await prisma.category.create({
      data: {
        nome,
        icone: icone || null,
        comercioId,
      },
    });

    res.status(201).json(categoria);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro interno ao criar categoria.' });
  }
}

/**
 * PUT /api/categorias/:id
 * Atualiza a categoria pelo ID (validando que pertence ao comércio do usuário).
 */
export async function atualizarCategoria(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    const id = req.params.id as string;
    const { nome, icone } = req.body;

    // Verifica se a categoria pertence ao comércio do usuário
    const categoriaExistente = await prisma.category.findFirst({
      where: { id, comercioId: comercioId || '' },
    });

    if (!categoriaExistente) {
      res.status(404).json({ error: 'Categoria não encontrada ou não pertence ao seu comércio.' });
      return;
    }

    const categoriaAtualizada = await prisma.category.update({
      where: { id },
      data: { nome, icone },
    });

    res.json(categoriaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar categoria.' });
  }
}

/**
 * DELETE /api/categorias/:id
 * Remove a categoria pelo ID (validando que pertence ao comércio).
 */
export async function deletarCategoria(req: Request, res: Response): Promise<void> {
  try {
    const comercioId = req.user?.comercioId;
    const id = req.params.id as string;

    const categoriaExistente = await prisma.category.findFirst({
      where: { id, comercioId: comercioId || '' },
    });

    if (!categoriaExistente) {
      res.status(404).json({ error: 'Categoria não encontrada ou não pertence ao seu comércio.' });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Categoria removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ error: 'Erro interno ao deletar categoria.' });
  }
}
