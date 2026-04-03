import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// ============================================================
// Configurações Globais da Plataforma — Admin
// ============================================================

/**
 * GET /api/admin/config
 * Retorna TODAS as configurações (visão admin)
 */
export async function getConfig(req: Request, res: Response): Promise<void> {
  try {
    let config = await prisma.platformConfig.findUnique({
      where: { id: 'singleton' },
    });

    // Auto-cria o singleton se não existir
    if (!config) {
      config = await prisma.platformConfig.create({
        data: { id: 'singleton' },
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Erro ao buscar config:', error);
    res.status(500).json({ error: 'Erro interno ao buscar configurações.' });
  }
}

/**
 * PUT /api/admin/config
 * Atualiza configurações globais
 */
export async function updateConfig(req: Request, res: Response): Promise<void> {
  const { assinaturaObrigatoria, nomeApp } = req.body;

  try {
    const config = await prisma.platformConfig.upsert({
      where: { id: 'singleton' },
      update: {
        ...(assinaturaObrigatoria !== undefined && { assinaturaObrigatoria }),
        ...(nomeApp !== undefined && { nomeApp }),
      },
      create: {
        id: 'singleton',
        assinaturaObrigatoria: assinaturaObrigatoria || false,
        nomeApp: nomeApp || 'Market System',
      },
    });

    res.json(config);
  } catch (error) {
    console.error('Erro ao atualizar config:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar configurações.' });
  }
}

/**
 * GET /api/public/config
 * Retorna apenas flags que o frontend público precisa saber
 * (ex: se assinatura é obrigatória no cadastro, nome do app)
 */
export async function getPublicConfig(req: Request, res: Response): Promise<void> {
  try {
    let config = await prisma.platformConfig.findUnique({
      where: { id: 'singleton' },
    });

    if (!config) {
      config = await prisma.platformConfig.create({
        data: { id: 'singleton' },
      });
    }

    res.json({
      nomeApp: config.nomeApp,
      assinaturaObrigatoria: config.assinaturaObrigatoria,
    });
  } catch (error) {
    console.error('Erro ao buscar config pública:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
}

/**
 * GET /api/config/sistema
 * Alias para getPublicConfig (usado pelo AdminSistema)
 */
export async function getConfigSistema(req: Request, res: Response): Promise<void> {
  return getPublicConfig(req, res);
}

/**
 * POST /api/config/sistema
 * Alias para updateConfig (usado pelo AdminSistema)
 */
export async function updateConfigSistema(req: Request, res: Response): Promise<void> {
  return updateConfig(req, res);
}
