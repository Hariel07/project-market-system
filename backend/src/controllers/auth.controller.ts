import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response) => {
  const { role, nome, cpf, email, senha, telefone, nomeComercio, tipoComercio, cnpj, plano, guestLocation } = req.body;

  try {
    // 1. Check if Account with this CPF already exists
    let account = await prisma.account.findUnique({ where: { cpf } });
    
    const hashedPassword = await bcrypt.hash(senha, 10);

    if (!account) {
      const existingEmail = await prisma.account.findUnique({ where: { email } });
      if (existingEmail) {
        res.status(400).json({ error: 'E-mail já está associado a outra conta.' });
        return;
      }
      account = await prisma.account.create({
        data: { cpf, email, senha: hashedPassword, telefone }
      });
    } else {
      const isMatch = await bcrypt.compare(senha, account.senha);
      if (!isMatch) {
         res.status(401).json({ error: 'Este CPF já existe, mas a senha está incorreta para adicionar perfil.' });
         return;
      }
    }

    // 2. Define Role Enum
    let userRole: Role = Role.CLIENTE;
    if (role === 'comerciante') userRole = Role.DONO;
    if (role === 'entregador') userRole = Role.ENTREGADOR;

    if (userRole === Role.CLIENTE || userRole === Role.ENTREGADOR) {
      const existingProfile = await prisma.user.findFirst({
        where: { accountId: account.id, role: userRole }
      });
      if (existingProfile) {
        res.status(400).json({ error: `Você já possui um perfil de ${userRole} nesta conta. Faça login.` });
        return;
      }
    }

    // 4. Create Transaction for Merchant
    if (userRole === Role.DONO) {
      const commercelessUser = await prisma.commerce.create({
        data: {
          razaoSocial: nomeComercio,
          nomeFantasia: nomeComercio,
          cnpj: cnpj || '00000000000000',
          segmento: tipoComercio,
          planoAtual: plano?.toUpperCase() || 'GRATIS',
          ativo: true,
          usuarios: {
            create: {
              accountId: account.id,
              nome,
              role: Role.DONO,
              ativo: true
            }
          }
        },
        include: { usuarios: true }
      });
      
      const createdUser = commercelessUser.usuarios[0];
      const token = jwt.sign({ id: createdUser.id, role: createdUser.role, comercioId: commercelessUser.id, accountId: account.id }, JWT_SECRET, { expiresIn: '7d' });
      
      const mergedUser = { ...createdUser, email: account.email, telefone: account.telefone, cpf: account.cpf };
      res.status(201).json({ status: 'SUCCESS', user: mergedUser, commerce: commercelessUser, token });
      return;
    }

    // 5. Create Standalone User (Client or Deliveryman)
    const createdUser = await prisma.user.create({
      data: {
        accountId: account.id,
        nome,
        role: userRole,
        ativo: true,
        ...(userRole === Role.CLIENTE && guestLocation ? {
          enderecos: {
            create: {
              logradouro: guestLocation,
              bairro: 'Pendente',
              cidade: 'Pendente',
              estado: 'XX',
              cep: '00000-000',
              pontoReferencia: '⚠️ Favor atualizar este endereço no seu Perfil',
              isPrincipal: true,
            }
          }
        } : {})
      }
    });

    const token = jwt.sign({ id: createdUser.id, role: createdUser.role, accountId: account.id }, JWT_SECRET, { expiresIn: '7d' });
    const mergedUser = { ...createdUser, email: account.email, telefone: account.telefone, cpf: account.cpf };
    
    res.status(201).json({ status: 'SUCCESS', user: mergedUser, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
}


export async function login(req: Request, res: Response): Promise<void> {
  const { cpf, senha } = req.body;

  try {
    // 1. Find Account
    const account = await prisma.account.findUnique({ 
      where: { cpf },
      include: {
        perfis: {
          include: { comercio: true }
        }
      }
    });

    if (!account) {
      res.status(401).json({ error: 'Conta não encontrada com este CPF.' });
      return;
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(senha, account.senha);
    if (!isMatch) {
      res.status(401).json({ error: 'Senha incorreta.' });
      return;
    }

    // 3. Evaluate Profiles
    if (account.perfis.length === 0) {
      res.status(400).json({ error: 'Conta não possui perfis ativos.' });
      return;
    }

    if (account.perfis.length === 1) {
      const user = account.perfis[0];
      const token = jwt.sign(
        { id: user.id, role: user.role, comercioId: user.comercioId, accountId: account.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      const mergedUser = { ...user, email: account.email, telefone: account.telefone, cpf: account.cpf };
      res.json({ status: 'SUCCESS', user: mergedUser, token });
      return;
    }

    const tempToken = jwt.sign({ accountId: account.id }, JWT_SECRET, { expiresIn: '15m' });
    
    res.json({
      status: 'SELECT_PROFILE',
      tempToken,
      perfis: account.perfis
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

export async function selectProfile(req: Request, res: Response): Promise<void> {
  const { tempToken, perfilId } = req.body;
  try {
    const decoded: any = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded.accountId) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    const account = await prisma.account.findUnique({
      where: { id: decoded.accountId },
      include: { perfis: true }
    });

    if (!account) {
      res.status(401).json({ error: 'Conta não encontrada' });
      return;
    }

    const user = account.perfis.find(p => p.id === perfilId);
    if (!user) {
      res.status(404).json({ error: 'Perfil não pertence a esta conta' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, comercioId: user.comercioId, accountId: account.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const mergedUser = { ...user, email: account.email, telefone: account.telefone, cpf: account.cpf };
    res.json({ status: 'SUCCESS', user: mergedUser, token });

  } catch (err) {
    res.status(401).json({ error: 'Sessão expirada ou inválida.' });
  }
}
