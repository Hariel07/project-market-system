import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

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
    const sortedComercios = comercios.sort((a: any, b: any) => {
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
    const commerce = await prisma.commerce.findUnique({
      where: { id: user.comercioId },
      include: {
        plano: true,
        enderecos: true,
      }
    });

    if (!commerce) {
      res.status(404).json({ error: 'Comércio não encontrado.' });
      return;
    }

    res.json(commerce);
  } catch (error) {
    console.error('Erro ao buscar meu comércio:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

export async function updateMyCommerce(req: Request, res: Response): Promise<void> {
  const user = req.user;
  const { nomeFantasia, segmento, logoUrl, taxaEntrega, tempoMedio, horarioAtendimento, isOpen } = req.body;

  if (!user || !user.comercioId) {
    res.status(403).json({ error: 'Não autorizado.' });
    return;
  }

  try {
    const updated = await prisma.commerce.update({
      where: { id: user.comercioId },
      data: {
        nomeFantasia,
        segmento,
        logoUrl,
        taxaEntrega: parseFloat(taxaEntrega),
        tempoMedio,
        horarioAtendimento,
        isOpen
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar comércio:', error);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
}

export async function getProdutosPublicos(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const produtos = await prisma.product.findMany({
      where: { 
        comercioId: id as string,
        ativo: true 
      },
      include: {
        categoria: true
      },
      orderBy: {
        nome: 'asc'
      }
    });

    res.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos públicos:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

export async function getComercioById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const commerce = await prisma.commerce.findUnique({
      where: { id: id as string },
      include: {
        categorias: {
          include: {
            produtos: {
              where: { ativo: true }
            }
          }
        },
        enderecos: true
      }
    });

    if (!commerce) {
      res.status(404).json({ error: 'Comércio não encontrado' });
      return;
    }

    res.json(commerce);
  } catch (error) {
    console.error('Erro ao buscar comércio por ID:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}
