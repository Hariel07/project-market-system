import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

// Roles que um DONO pode atribuir
const ROLES_PERMITIDAS_DONO: Role[] = ['GERENTE', 'ESTOQUE', 'CAIXA', 'AJUDANTE_GERAL', 'GARCOM'];
// Roles que um GERENTE pode atribuir (exceto GERENTE e acima)
const ROLES_PERMITIDAS_GERENTE: Role[] = ['ESTOQUE', 'CAIXA', 'AJUDANTE_GERAL', 'GARCOM'];

function rolesPermitidas(roleDoSolicitante: Role): Role[] {
  if (roleDoSolicitante === 'ADMIN' || roleDoSolicitante === 'DONO') return ROLES_PERMITIDAS_DONO;
  if (roleDoSolicitante === 'GERENTE') return ROLES_PERMITIDAS_GERENTE;
  return [];
}

// GET /api/funcionarios — Lista equipe do comércio
export async function listarFuncionarios(req: Request, res: Response) {
  try {
    const comercioId = req.user?.comercioId;
    if (!comercioId) return res.status(403).json({ error: 'Sem comércio associado.' });

    const funcionarios = await prisma.user.findMany({
      where: {
        comercioId,
        isDeleted: false,
        role: { in: ROLES_PERMITIDAS_DONO },
      },
      include: { account: { select: { nomeCompleto: true, email: true, telefone: true, cpf: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return res.json(funcionarios);
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// POST /api/funcionarios — Cadastra funcionário (cria Account se CPF novo, vincula ao comércio)
export async function cadastrarFuncionario(req: Request, res: Response) {
  try {
    const solicitante = req.user!;
    const comercioId = solicitante.comercioId;
    if (!comercioId) return res.status(403).json({ error: 'Sem comércio associado.' });

    const { cpf, nomeCompleto, email, telefone, senha, role } = req.body;

    if (!cpf || !nomeCompleto || !senha || !role) {
      return res.status(400).json({ error: 'Campos obrigatórios: cpf, nomeCompleto, senha, role.' });
    }

    const permitidas = rolesPermitidas(solicitante.role as Role);
    if (!permitidas.includes(role as Role)) {
      return res.status(403).json({ error: `Você não pode atribuir a role "${role}". Permitidas: ${permitidas.join(', ')}` });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');

    // Verifica se já existe conta com esse CPF
    let account = await prisma.account.findUnique({ where: { cpf: cpfLimpo } });

    if (!account) {
      // Cria nova conta
      if (!email) return res.status(400).json({ error: 'E-mail obrigatório para novo funcionário.' });
      const emailExistente = await prisma.account.findUnique({ where: { email } });
      if (emailExistente) return res.status(409).json({ error: 'E-mail já cadastrado.' });

      const hash = await bcrypt.hash(senha, 10);
      account = await prisma.account.create({
        data: { cpf: cpfLimpo, nomeCompleto, email, telefone, senha: hash },
      });
    }

    // Verifica se já tem perfil neste comércio com essa role
    const perfilExistente = await prisma.user.findFirst({
      where: { accountId: account.id, comercioId, role: role as Role, isDeleted: false },
    });
    if (perfilExistente) {
      return res.status(409).json({ error: 'Este funcionário já possui este perfil neste comércio.' });
    }

    const usuario = await prisma.user.create({
      data: {
        accountId: account.id,
        comercioId,
        role: role as Role,
        nome: nomeCompleto,
        ativo: true,
      },
      include: { account: { select: { nomeCompleto: true, email: true, telefone: true, cpf: true } } },
    });

    return res.status(201).json(usuario);
  } catch (error) {
    console.error('Erro ao cadastrar funcionário:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// PATCH /api/funcionarios/:id — Altera role ou ativa/desativa
export async function atualizarFuncionario(req: Request, res: Response) {
  try {
    const solicitante = req.user!;
    const comercioId = solicitante.comercioId;
    const id = req.params.id as string;
    const { role, ativo } = req.body;

    const funcionario = await prisma.user.findFirst({
      where: { id, comercioId: comercioId ?? undefined, isDeleted: false },
    });
    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado.' });

    if (role) {
      const permitidas = rolesPermitidas(solicitante.role as Role);
      if (!permitidas.includes(role as Role)) {
        return res.status(403).json({ error: `Role "${role}" não permitida.` });
      }
    }

    const atualizado = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role: role as Role }),
        ...(ativo !== undefined && { ativo: Boolean(ativo) }),
      },
      include: { account: { select: { nomeCompleto: true, email: true, cpf: true } } },
    });

    return res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// DELETE /api/funcionarios/:id — Soft delete do perfil no comércio
export async function removerFuncionario(req: Request, res: Response) {
  try {
    const solicitante = req.user!;
    const comercioId = solicitante.comercioId;
    const id = req.params.id as string;

    const funcionario = await prisma.user.findFirst({
      where: { id, comercioId: comercioId ?? undefined, isDeleted: false },
    });
    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado.' });

    // Não pode remover a si mesmo
    if (funcionario.id === solicitante.id) {
      return res.status(400).json({ error: 'Você não pode remover seu próprio perfil.' });
    }

    const permitidas = rolesPermitidas(solicitante.role as Role);
    if (!permitidas.includes(funcionario.role as Role)) {
      return res.status(403).json({ error: 'Sem permissão para remover este funcionário.' });
    }

    await prisma.user.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), ativo: false },
    });

    return res.json({ message: 'Funcionário removido do comércio.' });
  } catch (error) {
    console.error('Erro ao remover funcionário:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}
