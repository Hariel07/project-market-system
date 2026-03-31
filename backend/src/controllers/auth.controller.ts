import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function register(req: Request, res: Response): Promise<void> {
  const { role, nome, email, senha, telefone, nomeComercio, tipoComercio, cnpj, plano } = req.body;

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'E-mail já está em uso.' });
      return;
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(senha, 10);

    // 3. Define Role Enum
    let userRole: Role = Role.CLIENTE;
    if (role === 'comerciante') userRole = Role.DONO;
    if (role === 'entregador') userRole = Role.ENTREGADOR;

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
              nome,
              email,
              senha: hashedPassword,
              telefone,
              role: Role.DONO,
              ativo: true
            }
          }
        },
        include: { usuarios: true }
      });
      
      const createdUser = commercelessUser.usuarios[0];
      const token = jwt.sign({ id: createdUser.id, role: createdUser.role, comercioId: commercelessUser.id }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ user: createdUser, commerce: commercelessUser, token });
      return;
    }

    // 5. Create Standalone User (Client or Deliveryman)
    const createdUser = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        telefone,
        role: userRole,
        ativo: true
      }
    });

    const token = jwt.sign({ id: createdUser.id, role: createdUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: createdUser, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
}


export async function login(req: Request, res: Response): Promise<void> {
  const { email, senha } = req.body;

  try {
    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    // 3. Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role, comercioId: user.comercioId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Don't send password back
    const { senha: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
