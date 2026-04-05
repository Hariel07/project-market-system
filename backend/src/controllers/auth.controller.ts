import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * Verifica apenas se o CPF existe para proteger a privacidade (LGPD)
 */
export const checkCpf = async (req: Request, res: Response) => {
  const { cpf } = req.params;
  if (typeof cpf !== 'string') {
    res.status(400).json({ error: 'CPF inválido.' });
    return;
  }
  try {
    const account = await prisma.account.findUnique({
      where: { cpf: cpf.replace(/\D/g, '') },
      select: { id: true } 
    });
    res.json({ exists: !!account });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar CPF.' });
  }
};

/**
 * Valida a senha do CPF e só então libera dados pessoais
 */
export const validateAccountPassword = async (req: Request, res: Response) => {
  const { cpf, senha } = req.body;
  try {
    const account = await prisma.account.findUnique({
      where: { cpf: cpf.replace(/\D/g, '') }
    });

    if (!account) {
      res.status(404).json({ error: 'Conta não encontrada.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(senha, account.senha);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Senha incorreta.' });
      return;
    }

    res.json({
      success: true,
      data: {
        nome: account.nomeCompleto,
        email: account.email,
        telefone: account.telefone,
        dataNascimento: account.dataNascimento
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao validar senha.' });
  }
};

/**
 * Fluxo de Registro Unificado
 */
export const register = async (req: Request, res: Response) => {
  const { role, nome, cpf, email, senha, telefone, dataNascimento, nomeComercio, tipoComercio, cnpj, plano, guestLocation } = req.body;

  try {
    // 0. BOOTSTRAP: Se não houver Admin, o sistema se auto-limpa para nova instalação
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
    const isFirstAdmin = adminCount === 0;

    if (isFirstAdmin) {
      const hasData = await prisma.account.count();
      if (hasData > 0) {
        console.log('🧹 Detectado primeiro acesso Owner. Limpando banco legado...');
        try {
          // Limpeza robusta (ignora tabelas que não existem)
          const tables = [
            'movimentoCaixa', 'aberturaCaixa', 'rating', 'chatMessage', 'chat',
            'notification', 'deliveryGPS', 'delivery', 'orderItem', 'order',
            'product', 'category', 'address', 'user', 'commerce', 'account'
          ];
          for (const t of tables) {
            if ((prisma as any)[t]) await (prisma as any)[t].deleteMany().catch(() => {});
          }
        } catch (e) {
          console.warn('Aviso: Purga incompleta, prosseguindo...');
        }
      }
    }

    // 1. Localiza ou Cria a Conta Master
    let account = await prisma.account.findUnique({ where: { cpf: cpf.replace(/\D/g, '') } });
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Tratamento de Data
    let birthDate = null;
    if (dataNascimento) {
      const d = new Date(dataNascimento);
      if (!isNaN(d.getTime())) birthDate = d;
    }

    if (!account) {
      // Cadastro Novo
      const existingEmail = await prisma.account.findUnique({ where: { email } });
      if (existingEmail) {
        res.status(400).json({ error: 'E-mail já cadastrado em outra conta.' });
        return;
      }

      account = await prisma.account.create({
        data: { 
          cpf: cpf.replace(/\D/g, ''), 
          email, 
          senha: hashedPassword, 
          telefone, 
          nomeCompleto: nome,
          dataNascimento: birthDate,
          ativo: true 
        }
      });
    } else {
      // Vinculando novo perfil à conta existente
      const isPasswordValid = await bcrypt.compare(senha, account.senha);
      if (!isPasswordValid) {
         res.status(401).json({ error: 'Senha incorreta para esta conta existente.' });
         return;
      }
    }

    // 2. Define Papel do Usuário
    let userRole: Role = Role.CLIENTE;
    if (isFirstAdmin) {
      userRole = Role.ADMIN;
    } else {
      if (role === 'comerciante') userRole = Role.DONO;
      if (role === 'entregador') userRole = Role.ENTREGADOR;
    }

    // Evita duplicidade de perfil no mesmo papel
    const existingProfile = await prisma.user.findFirst({
      where: { accountId: account.id, role: userRole }
    });
    if (existingProfile) {
      res.status(400).json({ error: `Você já possui um perfil de ${userRole} nesta conta.` });
      return;
    }

    // 3. Criação do Perfil e Relacionamentos
    let createdUser;
    let createdCommerce = null;

    if (userRole === Role.DONO) {
      const commerce = await prisma.commerce.create({
        data: {
          razaoSocial: nomeComercio || `Loja de ${nome}`,
          nomeFantasia: nomeComercio || `Loja de ${nome}`,
          cnpj: cnpj?.replace(/\D/g, '') || '00000000000000',
          segmento: tipoComercio || 'Geral',
          planoAtual: plano || 'gratis',
          ativo: true,
          usuarios: {
            create: {
              accountId: account.id,
              nome: nome,
              role: Role.DONO,
              ativo: true
            }
          }
        },
        include: { usuarios: true }
      });
      createdUser = commerce.usuarios[0];
      createdCommerce = commerce;
    } else {
      createdUser = await prisma.user.create({
        data: {
          accountId: account.id,
          nome: nome,
          role: userRole,
          ativo: true
        }
      });

      // Se for cliente e tiver localização, salva na CONTA (Account)
      if (userRole === Role.CLIENTE && guestLocation) {
        await prisma.address.create({
          data: {
            accountId: account.id,
            logradouro: guestLocation,
            bairro: 'Detectado',
            cidade: 'Detectado',
            isPrincipal: true,
            rotulo: 'ENTREGA'
          }
        }).catch(() => {});
      }
    }

    // 4. Resposta Final
    const token = jwt.sign(
      { 
        id: createdUser.id, 
        role: createdUser.role, 
        accountId: account.id,
        comercioId: createdUser.comercioId 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    const mergedUser = { 
      ...createdUser, 
      email: account.email, 
      telefone: account.telefone, 
      cpf: account.cpf,
      nomeCompleto: account.nomeCompleto 
    };

    res.status(201).json({ 
      status: 'SUCCESS', 
      user: mergedUser, 
      commerce: createdCommerce,
      token,
      isSetup: isFirstAdmin 
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Falha crítica no cadastro: ' + error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { cpf, senha } = req.body;
  try {
    const account = await prisma.account.findUnique({
      where: { cpf: cpf.replace(/\D/g, '') },
      include: { perfis: { include: { comercio: true } } }
    });

    if (!account) {
      res.status(401).json({ error: 'Conta não encontrada com este CPF.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(senha, account.senha);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Senha incorreta.' });
      return;
    }

    if (account.perfis.length === 0) {
      res.status(200).json({ status: 'NO_PROFILE', accountId: account.id });
      return;
    }

    if (account.perfis.length === 1) {
      const user = account.perfis[0];
      const token = jwt.sign(
        { id: user.id, role: user.role, comercioId: user.comercioId, accountId: account.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      const mergedUser = { 
        ...user, 
        email: account.email, 
        telefone: account.telefone, 
        cpf: account.cpf,
        nomeCompleto: account.nomeCompleto,
        nome: user.nome || account.nomeCompleto
      };
      res.json({ status: 'SUCCESS', user: mergedUser, token });
    } else {
      res.json({
        status: 'SELECT_PROFILE',
        tempToken: jwt.sign({ accountId: account.id }, JWT_SECRET, { expiresIn: '15m' }),
        perfis: account.perfis.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          role: p.role,
          comercio: p.comercio
        }))
      });
    }
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro no login: ' + err.message });
  }
};

export const selectProfile = async (req: Request, res: Response) => {
  const { tempToken, perfilId } = req.body;
  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET) as { accountId: string };
    const account = await prisma.account.findUnique({
      where: { id: decoded.accountId },
      include: { perfis: true }
    });

    if (!account) return res.status(401).json({ error: 'Conta inválida' });

    const user = account.perfis.find((p: any) => p.id === perfilId);
    if (!user) return res.status(404).json({ error: 'Perfil inválido' });

    const token = jwt.sign(
      { id: user.id, role: user.role, comercioId: user.comercioId, accountId: account.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const mergedUser = { 
      ...user, 
      email: account.email, 
      telefone: account.telefone, 
      cpf: account.cpf,
      nomeCompleto: account.nomeCompleto,
      nome: user.nome || account.nomeCompleto
    };
    res.json({ status: 'SUCCESS', user: mergedUser, token });
  } catch (err) {
    res.status(401).json({ error: 'Sessão expirada.' });
  }
};

/**
 * Lista todos os perfis vinculados à conta master atual
 */
export const listMyProfiles = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId;
  
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { 
        perfis: { 
          include: { comercio: true }
        } 
      }
    });

    if (!account) {
      res.status(404).json({ error: 'Conta não encontrada.' });
      return;
    }

    res.json(account.perfis.map(p => ({
      id: p.id,
      nome: p.nome,
      role: p.role,
      comercio: p.comercio
    })));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar perfis.' });
  }
};

/**
 * Troca para um perfil específico da mesma conta sem precisar de senha
 */
export const switchProfile = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId;
  const { perfilId } = req.body;

  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { perfis: true }
    });

    if (!account) return res.status(401).json({ error: 'Conta inválida' });

    const user = account.perfis.find((p: any) => p.id === perfilId);
    if (!user) return res.status(404).json({ error: 'Perfil não pertence a esta conta' });

    const token = jwt.sign(
      { id: user.id, role: user.role, comercioId: user.comercioId, accountId: account.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const mergedUser = { 
      ...user, 
      email: account.email, 
      telefone: account.telefone, 
      cpf: account.cpf,
      nomeCompleto: account.nomeCompleto,
      nome: user.nome || account.nomeCompleto
    };
    
    res.json({ status: 'SUCCESS', user: mergedUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao trocar de perfil.' });
  }
};
