import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { Role, OrderStatus } from '@prisma/client';

/**
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalCommerces, totalOrders, totalFake] = await Promise.all([
      prisma.user.count(),
      prisma.commerce.count(),
      prisma.order.count(),
      prisma.account.count({ where: { isFake: true } })
    ]);

    res.json({ totalUsers, totalCommerces, totalOrders, totalFake });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
};

/**
 * GET /api/admin/users
 */
export const listAllUsers = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Buscando lista de usuários para o Admin...');
    const users = await prisma.user.findMany({
      include: {
        account: {
          select: { 
            cpf: true, 
            email: true, 
            telefone: true,
            ativo: true 
            // Removido temporariamente isFake do select para evitar quebra imediata
          }
        },
        comercio: { 
          select: { 
            nomeFantasia: true,
            razaoSocial: true 
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Foram encontrados ${users.length} usuários.`);
    res.json(users);
  } catch (error) {
    console.error('❌ Erro crítico ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno no servidor ao processar lista.' });
  }
};

/**
 * GET /api/admin/comercios
 */
export const listAllComercios = async (req: Request, res: Response) => {
  try {
    const comercios = await prisma.commerce.findMany({
      select: {
        id: true,
        nomeFantasia: true,
        razaoSocial: true,
        segmento: true,
        cidade: true,
        estado: true,
        ativo: true,
        taxaEntrega: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comercios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar comércios.' });
  }
};

/**
 * GET /api/admin/users/:id/details
 */
export const getUserDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'ID inválido.' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        account: true,
        comercio: true,
        enderecos: true,
        pedidosCliente: { take: 5, orderBy: { createdAt: 'desc' } },
        entregas: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar detalhes do usuário.' });
  }
};

/**
 * POST /api/admin/fake-data/create
 */
export const createFakeData = async (req: Request, res: Response) => {
  const hashedPassword = await bcrypt.hash('fake123', 10);
  const suffix = Math.floor(Math.random() * 10000);

  try {
    await prisma.$transaction(async (tx) => {
      const clientAccount = await tx.account.create({
        data: {
          cpf: `fake_cli_${suffix}`,
          email: `cliente_fake_${suffix}@teste.com`,
          nomeCompleto: `Cliente Fake ${suffix}`,
          senha: hashedPassword,
          isFake: true,
          perfis: { create: { nome: `Cliente Fake ${suffix}`, role: Role.CLIENTE } }
        }
      });

      const delivererAccount = await tx.account.create({
        data: {
          cpf: `fake_ent_${suffix}`,
          email: `entregador_fake_${suffix}@teste.com`,
          nomeCompleto: `Entregador Fake ${suffix}`,
          senha: hashedPassword,
          isFake: true,
          perfis: { create: { nome: `Entregador Fake ${suffix}`, role: Role.ENTREGADOR } }
        }
      });

      const merchantAccount = await tx.account.create({
        data: {
          cpf: `fake_mer_${suffix}`,
          email: `loja_fake_${suffix}@teste.com`,
          nomeCompleto: `Dono Fake ${suffix}`,
          senha: hashedPassword,
          isFake: true
        }
      });

      await tx.commerce.create({
        data: {
          razaoSocial: `Loja Fake ${suffix} LTDA`,
          nomeFantasia: `Mercado do ${suffix}`,
          cnpj: `cnpj_${suffix}`,
          segmento: 'Mercado',
          ativo: true,
          usuarios: {
            create: { accountId: merchantAccount.id, nome: `Dono Fake ${suffix}`, role: Role.DONO }
          }
        }
      });
    });

    res.json({ message: 'Dados fake gerados com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar dados fake.' });
  }
};

/**
 * DELETE /api/admin/fake-data/cleanup
 */
export const deleteFakeData = async (req: Request, res: Response) => {
  try {
    const fakeAccounts = await prisma.account.findMany({
      where: { isFake: true },
      include: { perfis: true }
    });

    for (const acc of fakeAccounts) {
      for (const perfil of acc.perfis) {
        if (perfil.comercioId) {
          await prisma.commerce.delete({ where: { id: perfil.comercioId } }).catch(() => {});
        }
      }
      await prisma.account.delete({ where: { id: acc.id } });
    }

    res.json({ message: 'Dados fake removidos.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao limpar dados fake.' });
  }
};

/**
 * POST /api/admin/system/factory-reset
 * ZERA O SISTEMA COMPLETAMENTE (Modo Fábrica)
 */
export const factoryReset = async (req: Request, res: Response) => {
  const { senha } = req.body;
  const accountId = req.user?.accountId;

  try {
    // 1. Valida se a senha foi enviada
    if (!senha) {
      res.status(400).json({ error: 'Senha é obrigatória para esta ação.' });
      return;
    }

    // 2. Busca a conta do Admin atual para validar a senha
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      res.status(404).json({ error: 'Conta não encontrada.' });
      return;
    }

    // 3. Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(senha, account.senha);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Senha incorreta. Ação cancelada.' });
      return;
    }

    console.log('🔥 NUCLEAR RESET INICIADO...');

    // 4. Deleta TUDO na ordem correta e reseta Configurações
    await prisma.$transaction([
      prisma.movimentoCaixa.deleteMany(),
      prisma.aberturaCaixa.deleteMany(),
      prisma.rating.deleteMany(),
      prisma.chatMessage.deleteMany(),
      prisma.chat.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.deliveryGPS.deleteMany(),
      prisma.delivery.deleteMany(),
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.product.deleteMany(),
      prisma.category.deleteMany(),
      prisma.address.deleteMany(),
      prisma.user.deleteMany(),
      prisma.commerce.deleteMany(),
      prisma.account.deleteMany(),
      
      // Reseta a Identidade Visual para o padrão de fábrica
      prisma.platformConfig.update({
        where: { id: 'singleton' },
        data: {
          nomeApp: 'Market System',
          logoUrl: null,
          assinaturaObrigatoria: false
        }
      })
    ]);

    res.json({ message: 'Sistema reinicializado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao realizar reset de fábrica.' });
  }
};
