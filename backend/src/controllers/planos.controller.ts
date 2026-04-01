import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// ============================================================
// CRUD de Planos de Assinatura — Apenas Admin
// ============================================================

/**
 * GET /api/admin/planos
 * Lista TODOS os planos (ativos e inativos) — visão do Admin
 */
export async function listarPlanos(req: Request, res: Response): Promise<void> {
  try {
    const planos = await prisma.subscriptionPlan.findMany({
      orderBy: { ordem: 'asc' },
      include: { _count: { select: { comercios: true } } },
    });
    res.json(planos);
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar planos.' });
  }
}

/**
 * GET /api/public/planos
 * Lista apenas planos ATIVOS — visão pública (usado no CadastroPage)
 */
export async function listarPlanosPublicos(req: Request, res: Response): Promise<void> {
  try {
    const planos = await prisma.subscriptionPlan.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
      select: {
        id: true,
        nome: true,
        slug: true,
        preco: true,
        descricao: true,
        features: true,
        maxItens: true,
        maxPdvs: true,
        destaque: true,
        ordem: true,
      },
    });
    res.json(planos);
  } catch (error) {
    console.error('Erro ao listar planos públicos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar planos.' });
  }
}

/**
 * POST /api/admin/planos
 * Cria um novo plano
 */
export async function criarPlano(req: Request, res: Response): Promise<void> {
  const { nome, slug, preco, descricao, features, maxItens, maxPdvs, destaque, ordem } = req.body;

  try {
    const plano = await prisma.subscriptionPlan.create({
      data: {
        nome,
        slug: slug || nome.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        preco: preco || 0,
        descricao,
        features: features || [],
        maxItens: maxItens || null,
        maxPdvs: maxPdvs || null,
        destaque: destaque || false,
        ordem: ordem || 0,
      },
    });
    res.status(201).json(plano);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Já existe um plano com esse nome ou slug.' });
      return;
    }
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ error: 'Erro interno ao criar plano.' });
  }
}

/**
 * PUT /api/admin/planos/:id
 * Atualiza um plano existente
 */
export async function atualizarPlano(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { nome, slug, preco, descricao, features, maxItens, maxPdvs, destaque, ativo, ordem } = req.body;

  try {
    const plano = await prisma.subscriptionPlan.update({
      where: { id: id as string },
      data: {
        ...(nome !== undefined && { nome }),
        ...(slug !== undefined && { slug }),
        ...(preco !== undefined && { preco }),
        ...(descricao !== undefined && { descricao }),
        ...(features !== undefined && { features: features as string[] }),
        ...(maxItens !== undefined && { maxItens }),
        ...(maxPdvs !== undefined && { maxPdvs }),
        ...(destaque !== undefined && { destaque }),
        ...(ativo !== undefined && { ativo }),
        ...(ordem !== undefined && { ordem }),
      },
    });
    res.json(plano);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Plano não encontrado.' });
      return;
    }
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Já existe um plano com esse nome ou slug.' });
      return;
    }
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar plano.' });
  }
}

/**
 * DELETE /api/admin/planos/:id
 * Soft-delete — marca como ativo: false
 * Comerciantes existentes continuam nesse plano até migrar
 */
export async function deletarPlano(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const plano = await prisma.subscriptionPlan.update({
      where: { id: id as string },
      data: { ativo: false },
      include: { _count: { select: { comercios: true } } },
    });
    res.json({
      message: 'Plano desativado com sucesso.',
      plano,
      comerciosAfetados: (plano as any)._count.comercios,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Plano não encontrado.' });
      return;
    }
    console.error('Erro ao deletar plano:', error);
    res.status(500).json({ error: 'Erro interno ao desativar plano.' });
  }
}
