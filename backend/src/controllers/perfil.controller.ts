import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

/**
 * GET /api/perfil/me
 * Retorna os dados da CONTA e do PERFIL atual
 */
export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const accountId = req.user?.accountId;

  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        enderecos: true,
        perfis: true
      }
    });

    if (!account) {
      res.status(404).json({ error: 'Conta não encontrada.' });
      return;
    }

    // Perfil específico que está logado
    const currentProfile = account.perfis.find(p => p.id === userId);

    res.json({
      id: account.id,
      cpf: account.cpf,
      email: account.email,
      nomeCompleto: account.nomeCompleto,
      dataNascimento: account.dataNascimento,
      telefone: account.telefone,
      enderecos: account.enderecos,
      roleAtual: currentProfile?.role,
      perfisDisponiveis: account.perfis.map(p => p.role)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil.' });
  }
};

/**
 * PATCH /api/perfil/me
 * Atualiza dados mestres da CONTA (reflete em todos os perfis)
 */
export const updateMyProfile = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId;
  const { nomeCompleto, telefone, dataNascimento, senha, novaSenha } = req.body;

  try {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      res.status(404).json({ error: 'Conta não encontrada.' });
      return;
    }

    // Se quiser mudar a senha, precisa validar a antiga
    let hashedPassword = account.senha;
    if (novaSenha) {
      const isPasswordValid = await bcrypt.compare(senha, account.senha);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Senha atual incorreta.' });
        return;
      }
      hashedPassword = await bcrypt.hash(novaSenha, 10);
    }

    // Transação para atualizar a conta e todos os perfis vinculados
    const [updated] = await prisma.$transaction([
      prisma.account.update({
        where: { id: accountId },
        data: {
          nomeCompleto: nomeCompleto || account.nomeCompleto,
          telefone: telefone || account.telefone,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : account.dataNascimento,
          senha: hashedPassword
        }
      }),
      // Replica o nome para todos os perfis (Dono, Cliente, etc)
      prisma.user.updateMany({
        where: { accountId },
        data: { nome: nomeCompleto || account.nomeCompleto }
      })
    ]);

    res.json({ message: 'Perfil atualizado com sucesso!', user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
};

/**
 * DELETE /api/perfil/account
 * Marca a CONTA e TODOS os perfis para exclusão (Soft Delete)
 */
export const deleteMyAccount = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId;
  const { senha } = req.body;

  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { perfis: true }
    });

    if (!account) return res.status(404).json({ error: 'Conta não encontrada.' });

    // 1. Validar Senha
    const isPasswordValid = await bcrypt.compare(senha, account.senha);
    if (!isPasswordValid) return res.status(401).json({ error: 'Senha incorreta.' });

    // 2. Verificar Pendências em todos os perfis
    for (const perfil of account.perfis) {
      // Bloqueio se for Cliente com pedido ativo
      if (perfil.role === 'CLIENTE') {
        const activeOrders = await prisma.order.count({
          where: { clienteId: perfil.id, status: { in: ['PENDENTE', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA'] } }
        });
        if (activeOrders > 0) return res.status(400).json({ error: 'Você possui pedidos em andamento. Finalize-os antes de excluir a conta.' });
      }

      // Bloqueio se for Entregador com entrega ativa
      if (perfil.role === 'ENTREGADOR') {
        const activeDeliveries = await prisma.delivery.count({
          where: { entregadorId: perfil.id, status: { notIn: ['ENTREGUE', 'CANCELADO'] } }
        });
        if (activeDeliveries > 0) return res.status(400).json({ error: 'Você possui entregas em andamento.' });
      }

      // Bloqueio se for Dono/Comerciante com caixa aberto ou pedidos na loja
      if (perfil.role === 'DONO' && perfil.comercioId) {
        const activeStoreOrders = await prisma.order.count({
          where: { comercioId: perfil.comercioId, status: { in: ['PENDENTE', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA'] } }
        });
        if (activeStoreOrders > 0) return res.status(400).json({ error: 'Seu comércio possui pedidos ativos.' });
      }
    }

    // 3. Aplicar Soft Delete
    const now = new Date();
    await prisma.$transaction([
      prisma.account.update({
        where: { id: accountId },
        data: { isDeleted: true, deletedAt: now, ativo: false }
      }),
      prisma.user.updateMany({
        where: { accountId },
        data: { isDeleted: true, deletedAt: now, ativo: false }
      })
    ]);

    res.json({ message: 'Conta agendada para exclusão. Você tem 30 dias para restaurá-la.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar exclusão de conta.' });
  }
};

/**
 * GET /api/perfil/:id
 * Retorna dados do usuário autenticado (ignora o param, usa JWT)
 */
export const getProfileById = async (req: Request, res: Response) => {
  return getMyProfile(req, res);
};

// ============================================================
// Endereços do Perfil (associados à conta)
// ============================================================

/**
 * GET /api/perfil/enderecos
 */
export const getMyEnderecos = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId;
  try {
    const enderecos = await prisma.address.findMany({
      where: { accountId },
      orderBy: [{ isPrincipal: 'desc' }, { createdAt: 'asc' }],
    });
    res.json(enderecos);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar endereços.' });
  }
};

/**
 * POST /api/perfil/enderecos
 */
export const createEndereco = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId;
  const { logradouro, numero, complemento, bairro, cidade, estado, pais, cep, pontoReferencia, rotulo, icone, lat, lng, isPrincipal } = req.body;

  try {
    if (isPrincipal) {
      await prisma.address.updateMany({ where: { accountId }, data: { isPrincipal: false } });
    }
    const endereco = await prisma.address.create({
      data: {
        accountId,
        logradouro, numero, complemento, bairro, cidade, estado,
        pais: pais || 'BR', cep, pontoReferencia,
        rotulo: rotulo || 'CASA', icone: icone || '🏠',
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        isPrincipal: isPrincipal || false,
      },
    });
    res.status(201).json(endereco);
  } catch {
    res.status(500).json({ error: 'Erro ao criar endereço.' });
  }
};

/**
 * PUT /api/perfil/enderecos/:id
 */
export const updateEndereco = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId;
  const { id } = req.params;
  const { logradouro, numero, complemento, bairro, cidade, estado, pais, cep, pontoReferencia, rotulo, icone, lat, lng, isPrincipal } = req.body;

  try {
    const existing = await prisma.address.findFirst({ where: { id, accountId } });
    if (!existing) { res.status(404).json({ error: 'Endereço não encontrado.' }); return; }

    if (isPrincipal) {
      await prisma.address.updateMany({ where: { accountId }, data: { isPrincipal: false } });
    }
    const updated = await prisma.address.update({
      where: { id },
      data: {
        logradouro, numero, complemento, bairro, cidade, estado, pais, cep, pontoReferencia,
        rotulo, icone,
        lat: lat ? parseFloat(lat) : existing.lat,
        lng: lng ? parseFloat(lng) : existing.lng,
        isPrincipal: isPrincipal ?? existing.isPrincipal,
      },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar endereço.' });
  }
};

/**
 * PUT /api/perfil/enderecos/:id/principal
 */
export const setPrincipalEndereco = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId;
  const { id } = req.params;
  try {
    const existing = await prisma.address.findFirst({ where: { id, accountId } });
    if (!existing) { res.status(404).json({ error: 'Endereço não encontrado.' }); return; }

    await prisma.address.updateMany({ where: { accountId }, data: { isPrincipal: false } });
    const updated = await prisma.address.update({ where: { id }, data: { isPrincipal: true } });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro ao definir endereço principal.' });
  }
};

/**
 * DELETE /api/perfil/enderecos/:id
 */
export const deleteEndereco = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId;
  const { id } = req.params;
  try {
    const existing = await prisma.address.findFirst({ where: { id, accountId } });
    if (!existing) { res.status(404).json({ error: 'Endereço não encontrado.' }); return; }
    await prisma.address.delete({ where: { id } });
    res.json({ message: 'Endereço removido.' });
  } catch {
    res.status(500).json({ error: 'Erro ao remover endereço.' });
  }
};

/**
 * DELETE /api/perfil/me
 * Marca apenas o PERFIL ATUAL para exclusão (Soft Delete)
 */
export const deleteMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const accountId = req.user?.accountId;
  const { senha } = req.body;

  try {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!account || !user) return res.status(404).json({ error: 'Dados não encontrados.' });

    // 1. Validar Senha
    const isPasswordValid = await bcrypt.compare(senha, account.senha);
    if (!isPasswordValid) return res.status(401).json({ error: 'Senha incorreta.' });

    // 2. Verificar Pendências específicas do perfil
    if (user.role === 'CLIENTE') {
      const activeOrders = await prisma.order.count({
        where: { clienteId: userId, status: { in: ['PENDENTE', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA'] } }
      });
      if (activeOrders > 0) return res.status(400).json({ error: 'Você possui pedidos ativos neste perfil.' });
    }

    // 3. Aplicar Soft Delete no Perfil
    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true, deletedAt: new Date(), ativo: false }
    });

    res.json({ message: 'Perfil removido com sucesso. Você pode reativá-lo em até 30 dias.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover perfil.' });
  }
};
