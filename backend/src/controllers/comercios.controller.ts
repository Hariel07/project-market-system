import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

export async function getPublicComercios(req: Request, res: Response): Promise<void> {
  try {
    const comercios = await prisma.commerce.findMany({
      where: {
        ativo: true,
      },
      select: {
        id: true,
        nomeFantasia: true,
        razaoSocial: true,
        segmento: true,
        logoUrl: true,
        taxaEntrega: true,
        tempoMedio: true,
        isOpen: true,
        horarioAtendimento: true,
        categorias: {
          select: {
            nome: true
          }
        }
      },
      // Ordena de forma que lojas abertas venham antes, mas o Prisma precisa fazer isso via JS
    });

    // Ordenar no JS: Open = true (1), false (0)
    const sortedComercios = comercios.sort((a, b) => {
      if (a.isOpen && !b.isOpen) return -1;
      if (!a.isOpen && b.isOpen) return 1;
      return a.nomeFantasia.localeCompare(b.nomeFantasia);
    });

    res.json(sortedComercios);
  } catch (error) {
    console.error('Erro ao buscar comércios públicos:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

export async function getMyCommerce(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user || !user.comercioId) {
    res.status(403).json({ error: 'Você não possui um comércio associado.' });
    return;
  }

  try {
    const comercio = await prisma.commerce.findUnique({
      where: { id: user.comercioId }
    });
    res.json(comercio);
  } catch (error) {
    console.error('Erro ao buscar o comércio:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

export async function updateMyCommerce(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user || !user.comercioId) {
    res.status(403).json({ error: 'Você não possui um comércio associado.' });
    return;
  }

  const { nomeFantasia, segmento, taxaEntrega, tempoMedio, logoUrl, isOpen, horarioAtendimento } = req.body;

  try {
    const comercioAtualizado = await prisma.commerce.update({
      where: { id: user.comercioId },
      data: {
        nomeFantasia,
        segmento,
        taxaEntrega: typeof taxaEntrega === 'number' ? taxaEntrega : undefined,
        tempoMedio,
        logoUrl,
        isOpen: typeof isOpen === 'boolean' ? isOpen : undefined,
        horarioAtendimento
      }
    });
    res.json(comercioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar o comércio:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações do comércio.' });
  }
}
