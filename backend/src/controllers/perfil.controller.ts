import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthPayload } from '../middlewares/auth.middleware';

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, telefone, email } = req.body;
    const userId = req.user?.id;
    const accountId = req.user?.accountId;

    if (!userId || !accountId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    // Atualiza nome no perfil
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { nome }
    });

    // Atualiza e-mail/telefone na conta mãe
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { telefone, email }
    });

    res.json({
      status: 'SUCCESS',
      user: {
        ...updatedUser,
        email: updatedAccount.email,
        telefone: updatedAccount.telefone,
        cpf: updatedAccount.cpf
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
};

export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isPrincipal: 'desc' },
        { rotulo: 'asc' }
      ]
    });

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar endereços.' });
  }
};

export const createAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
       res.status(401).json({ error: 'Não autorizado' });
       return;
    }

    const {
      logradouro, numero, complemento, bairro, cidade, estado, cep,
      pontoReferencia, rotulo, icone, lat, lng, isPrincipal
    } = req.body;

    if (!pontoReferencia || pontoReferencia.trim() === '') {
      res.status(400).json({ error: 'Ponto de referência é OBRIGATÓRIO.' });
      return;
    }

    // Se for principal, desmarca os outros
    if (isPrincipal) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isPrincipal: false }
      });
    }

    const novoEndereco = await prisma.address.create({
      data: {
        userId,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        pontoReferencia,
        rotulo: rotulo || 'OUTRO',
        icone: icone || '📍',
        lat,
        lng,
        isPrincipal
      }
    });

    res.status(201).json(novoEndereco);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar endereço.' });
  }
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
       res.status(401).json({ error: 'Não autorizado' });
       return;
    }

    const {
      logradouro, numero, complemento, bairro, cidade, estado, cep,
      pontoReferencia, rotulo, icone, lat, lng, isPrincipal
    } = req.body;

    if (!pontoReferencia || pontoReferencia.trim() === '') {
      res.status(400).json({ error: 'Ponto de referência é OBRIGATÓRIO.' });
      return;
    }

    // Verifica dono
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Endereço não encontrado ou não pertence a você.' });
      return;
    }

    if (isPrincipal) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isPrincipal: false }
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        logradouro, numero, complemento, bairro, cidade, estado, cep,
        pontoReferencia, rotulo, icone, lat, lng, isPrincipal
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar endereço.' });
  }
};

export const setPrincipalAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Endereço não encontrado.' });
      return;
    }

    await prisma.address.updateMany({
      where: { userId },
      data: { isPrincipal: false }
    });

    const updated = await prisma.address.update({
      where: { id },
      data: { isPrincipal: true }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao definir principal.' });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Endereço não encontrado.' });
      return;
    }

    await prisma.address.delete({ where: { id } });
    res.json({ status: 'SUCCESS' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar endereço.' });
  }
};
