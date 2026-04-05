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
