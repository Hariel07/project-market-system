import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// Busca pública com filtros de geo e segmento
export async function getPublicComercios(req: Request, res: Response): Promise<void> {
  try {
    const { cidade, estado, pais, segmento, busca, aberto } = req.query;

    const where: any = { ativo: true };

    if (cidade)    where.cidade    = { contains: cidade as string, mode: 'insensitive' };
    if (estado)    where.estado    = { contains: estado as string, mode: 'insensitive' };
    if (pais)      where.pais      = { contains: pais as string,   mode: 'insensitive' };
    if (segmento)  where.segmento  = { contains: segmento as string, mode: 'insensitive' };
    if (busca)     where.nomeFantasia = { contains: busca as string, mode: 'insensitive' };
    if (aberto === 'true') where.isOpen = true;

    const comercios = await prisma.commerce.findMany({
      where,
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
        cidade: true,
        estado: true,
        pais: true,
        lat: true,
        lng: true,
        categorias: { select: { nome: true } },
      },
    });

    // Abertas primeiro, depois alfabético
    const sorted = comercios.sort((a, b) => {
      if (a.isOpen && !b.isOpen) return -1;
      if (!a.isOpen && b.isOpen) return 1;
      return a.nomeFantasia.localeCompare(b.nomeFantasia);
    });

    res.json(sorted);
  } catch (error) {
    console.error('Erro ao buscar comércios:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

// Detalhe público de um comércio (cardápio)
export async function getComercioById(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const commerce = await prisma.commerce.findUnique({
      where: { id },
      include: {
        categorias: {
          orderBy: [{ ordem: 'asc' } as any],
          include: {
            produtos: {
              where: { ativo: true },
              orderBy: { nome: 'asc' },
            },
          },
        },
        enderecos: true,
      },
    });

    if (!commerce) { res.status(404).json({ error: 'Comércio não encontrado' }); return; }
    res.json(commerce);
  } catch (error) {
    console.error('Erro ao buscar comércio por ID:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

// Produtos públicos de um comércio
export async function getProdutosPublicos(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const produtos = await prisma.product.findMany({
      where: { comercioId: id, ativo: true },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });
    res.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos públicos:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

// Dados do comércio do usuário logado
export async function getMyCommerce(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user?.comercioId) { res.status(403).json({ error: 'Sem comércio associado.' }); return; }
  try {
    const commerce = await prisma.commerce.findUnique({
      where: { id: user.comercioId },
      include: { plano: true, enderecos: true, contaFinanceira: true },
    });
    if (!commerce) { res.status(404).json({ error: 'Comércio não encontrado.' }); return; }
    res.json(commerce);
  } catch (error) {
    console.error('Erro ao buscar meu comércio:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

// Atualiza dados do comércio do usuário logado
export async function updateMyCommerce(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user?.comercioId) { res.status(403).json({ error: 'Não autorizado.' }); return; }

  const {
    nomeFantasia, segmento, logoUrl, taxaEntrega, tempoMedio,
    horarioAtendimento, isOpen, cidade, estado, pais, lat, lng,
    alertaValidadeDias, estoqueMinimoPadrao,
  } = req.body;

  try {
    const updated = await prisma.commerce.update({
      where: { id: user.comercioId },
      data: {
        ...(nomeFantasia !== undefined && { nomeFantasia }),
        ...(segmento !== undefined && { segmento }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(taxaEntrega !== undefined && { taxaEntrega: parseFloat(taxaEntrega) }),
        ...(tempoMedio !== undefined && { tempoMedio }),
        ...(horarioAtendimento !== undefined && { horarioAtendimento }),
        ...(isOpen !== undefined && { isOpen }),
        ...(cidade !== undefined && { cidade }),
        ...(estado !== undefined && { estado }),
        ...(pais !== undefined && { pais }),
        ...(lat !== undefined && { lat: parseFloat(lat) }),
        ...(lng !== undefined && { lng: parseFloat(lng) }),
        ...(alertaValidadeDias !== undefined && { alertaValidadeDias: parseInt(alertaValidadeDias) }),
        ...(estoqueMinimoPadrao !== undefined && { estoqueMinimoPadrao: parseInt(estoqueMinimoPadrao) }),
      },
    });
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar comércio:', error);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
}
