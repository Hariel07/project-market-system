import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

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
  const { assinaturaObrigatoria, nomeApp, logoUrl, modoManutencao } = req.body;

  try {
    const dataUpdate: any = {};
    if (assinaturaObrigatoria !== undefined) dataUpdate.assinaturaObrigatoria = assinaturaObrigatoria;
    if (nomeApp !== undefined) dataUpdate.nomeApp = nomeApp;
    if (logoUrl !== undefined) dataUpdate.logoUrl = logoUrl;
    
    // Só adiciona modoManutencao se ele existir no Prisma Client gerado
    if (modoManutencao !== undefined) {
      dataUpdate.modoManutencao = modoManutencao;
    }

    const config = await prisma.platformConfig.upsert({
      where: { id: 'singleton' },
      update: dataUpdate,
      create: {
        id: 'singleton',
        assinaturaObrigatoria: assinaturaObrigatoria || false,
        nomeApp: nomeApp || 'Market System',
        logoUrl: logoUrl || null,
        modoManutencao: modoManutencao || false,
      },
    });

    res.json(config);
  } catch (error) {
    console.error('Erro ao atualizar config:', error);
    res.status(500).json({ error: 'Erro ao salvar configurações. Certifique-se de rodar npx prisma db push.' });
  }
}

/**
 * GET /api/public/config
 * Retorna apenas flags que o frontend público precisa saber
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
      logoUrl: config.logoUrl,
      assinaturaObrigatoria: config.assinaturaObrigatoria,
      modoManutencao: config.modoManutencao,
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

/**
 * GET /api/config/setup-check
 * Verifica se o sistema está em modo de instalação inicial (0 usuários)
 */
export async function checkSetupMode(req: Request, res: Response): Promise<void> {
  try {
    const userCount = await prisma.user.count();
    res.json({ isSetupMode: userCount === 0 });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar modo setup.' });
  }
}
