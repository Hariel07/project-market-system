import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Listar oportunidades de entrega para um entregador online
export async function listarOportunidades(req: Request, res: Response) {
  try {
    const { comercioId } = req.query;

    const pedidos = await prisma.order.findMany({
      where: {
        status: {
          in: ['PREPARANDO', 'PRONTO'],
        },
        entrega: {
          entregadorId: null,
        },
        ...(comercioId && { comercioId: comercioId as string }),
      },
      include: {
        cliente: {
          include: {
            account: true,
          },
        },
        comercio: true,
        itens: {
          include: {
            produto: true,
          },
        },
        entrega: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.json(pedidos);
  } catch (error) {
    console.error('Erro ao listar oportunidades:', error);
    return res.status(500).json({ error: 'Erro ao listar oportunidades' });
  }
}

// Buscar entrega completa pelo pedidoId (usado pela tela de rota)
export async function buscarEntregaPorPedido(req: Request, res: Response) {
  try {
    const pedidoId = String(req.params.pedidoId);

    const entrega = await prisma.delivery.findUnique({
      where: { pedidoId },
      include: {
        pedido: {
          include: {
            cliente: {
              include: {
                account: true,
              },
            },
            comercio: {
              include: {
                enderecos: true,
              },
            },
            itens: {
              include: {
                produto: true,
              },
            },
          },
        },
        entregador: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!entrega) {
      return res.status(404).json({ error: 'Entrega não encontrada para este pedido' });
    }

    return res.json(entrega);
  } catch (error) {
    console.error('Erro ao buscar entrega por pedido:', error);
    return res.status(500).json({ error: 'Erro ao buscar entrega' });
  }
}

// Aceitar uma entrega
export async function aceitarEntrega(req: Request, res: Response) {
  try {
    const entregaId = String(req.params.entregaId);
    const { entregadorId } = req.body;

    const entrega = await prisma.delivery.findUnique({
      where: { id: entregaId },
      include: { pedido: true },
    });

    if (!entrega) {
      return res.status(404).json({ error: 'Entrega não encontrada' });
    }

    if (entrega.entregadorId) {
      return res.status(400).json({ error: 'Entrega já foi aceita por outro entregador' });
    }

    const entregaAtualizada = await prisma.delivery.update({
      where: { id: entregaId },
      data: {
        entregadorId,
        status: 'A_CAMINHO_COLETA',
      },
      include: {
        pedido: {
          include: {
            cliente: true,
            comercio: true,
          },
        },
        entregador: true,
      },
    });

    return res.json(entregaAtualizada);
  } catch (error) {
    console.error('Erro ao aceitar entrega:', error);
    return res.status(500).json({ error: 'Erro ao aceitar entrega' });
  }
}

// Rejeitar uma entrega
export async function rejeitarEntrega(req: Request, res: Response) {
  try {
    const entregaId = String(req.params.entregaId);

    const entregaAtualizada = await prisma.delivery.update({
      where: { id: entregaId },
      data: {
        entregadorId: null,
        status: 'AGUARDANDO_COLETA',
      },
      include: { pedido: true },
    });

    return res.json(entregaAtualizada);
  } catch (error) {
    console.error('Erro ao rejeitar entrega:', error);
    return res.status(500).json({ error: 'Erro ao rejeitar entrega' });
  }
}

// Atualizar localização GPS — persiste no banco
export async function atualizarLocalizacao(req: Request, res: Response) {
  try {
    const entregaId = String(req.params.entregaId);
    const { latitude, longitude, velocidade, precisao } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
    }

    const gpsLog = await prisma.deliveryGPS.create({
      data: {
        deliveryId: entregaId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        velocidade: velocidade != null ? Number(velocidade) : null,
        precisao: precisao != null ? Number(precisao) : null,
      },
    });

    return res.json({ success: true, data: gpsLog });
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    return res.status(500).json({ error: 'Erro ao atualizar localização' });
  }
}

// Confirmar coleta — muda Delivery para A_CAMINHO_ENTREGA e Order para SAIU_ENTREGA
export async function confirmarColeta(req: Request, res: Response) {
  try {
    const entregaId = String(req.params.entregaId);

    const entregaAtualizada = await prisma.delivery.update({
      where: { id: entregaId },
      data: {
        status: 'A_CAMINHO_ENTREGA',
        coletadoEm: new Date(),
      },
      include: {
        pedido: true,
        entregador: true,
      },
    });

    await prisma.order.update({
      where: { id: entregaAtualizada.pedidoId },
      data: { status: 'SAIU_ENTREGA' },
    });

    return res.json(entregaAtualizada);
  } catch (error) {
    console.error('Erro ao confirmar coleta:', error);
    return res.status(500).json({ error: 'Erro ao confirmar coleta' });
  }
}

// Confirmar entrega completa — salva assinatura se fornecida
export async function confirmarEntrega(req: Request, res: Response) {
  try {
    const entregaId = String(req.params.entregaId);
    const { assinatura } = req.body;

    const entregaAtualizada = await prisma.delivery.update({
      where: { id: entregaId },
      data: {
        status: 'ENTREGUE',
        entregueEm: new Date(),
        ...(assinatura && { assinatura }),
      },
      include: {
        pedido: true,
        entregador: true,
      },
    });

    await prisma.order.update({
      where: { id: entregaAtualizada.pedidoId },
      data: { status: 'ENTREGUE' },
    });

    return res.json(entregaAtualizada);
  } catch (error) {
    console.error('Erro ao confirmar entrega:', error);
    return res.status(500).json({ error: 'Erro ao confirmar entrega' });
  }
}

// Listar entregas ativas do entregador
export async function minhasEntregas(req: Request, res: Response) {
  try {
    const entregadorId = String(req.params.entregadorId);

    const entregas = await prisma.delivery.findMany({
      where: {
        entregadorId,
        status: {
          in: ['A_CAMINHO_COLETA', 'A_CAMINHO_ENTREGA'],
        },
      },
      include: {
        pedido: {
          include: {
            cliente: {
              include: {
                account: true,
              },
            },
            comercio: true,
          },
        },
        entregador: {
          include: {
            account: true,
          },
        },
      },
    });

    return res.json(entregas);
  } catch (error) {
    console.error('Erro ao listar minhas entregas:', error);
    return res.status(500).json({ error: 'Erro ao listar entregas' });
  }
}
