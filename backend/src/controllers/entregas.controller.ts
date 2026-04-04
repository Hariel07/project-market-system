import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// ============================================================================
// CONSTANTES DE VALIDAÇÃO
// ============================================================================

// Rate limiting para GPS: máximo 1 atualização a cada 5 segundos por entrega
const GPS_RATE_LIMIT_MS = 5000;
const lastGpsUpdate = new Map<string, number>(); // deliveryId -> timestamp

// Transições de status válidas
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  AGUARDANDO_COLETA: ['A_CAMINHO_COLETA'],
  A_CAMINHO_COLETA: ['A_CAMINHO_ENTREGA', 'AGUARDANDO_COLETA'],
  A_CAMINHO_ENTREGA: ['ENTREGUE'],
  ENTREGUE: [],
};

// ============================================================================
// FUNÇÕES AUXILIARES DE SEGURANÇA
// ============================================================================

/**
 * Valida se o usuário autenticado é o entregador dono da entrega
 */
async function validarPermissaoEntregador(
  entregaId: string,
  userIdAutenticado: string
): Promise<{ valido: boolean; erro?: string; entrega?: any }> {
  const entrega = await prisma.delivery.findUnique({
    where: { id: entregaId },
  });

  if (!entrega) {
    return { valido: false, erro: 'Entrega não encontrada' };
  }

  if (!entrega.entregadorId) {
    return { valido: false, erro: 'Entrega ainda não foi aceita por nenhum entregador' };
  }

  if (entrega.entregadorId !== userIdAutenticado) {
    return { valido: false, erro: 'Você não possui permissão para atualizar esta entrega' };
  }

  return { valido: true, entrega };
}

/**
 * Valida transição de status
 */
function validarTransicaoStatus(
  statusAtual: string,
  novoStatus: string
): { valido: boolean; erro?: string } {
  const transicoes = VALID_STATUS_TRANSITIONS[statusAtual];
  if (!transicoes || !transicoes.includes(novoStatus)) {
    return {
      valido: false,
      erro: `Transição inválida: não é possível mudar de ${statusAtual} para ${novoStatus}`,
    };
  }
  return { valido: true };
}

/**
 * Verifica se a atualização de GPS está dentro do rate limit
 */
function verificarGpsRateLimit(deliveryId: string): { permitido: boolean; segundosAteProxima?: number } {
  const agora = Date.now();
  const ultimaAtualizacao = lastGpsUpdate.get(deliveryId) || 0;
  const tempo_decorrido = agora - ultimaAtualizacao;

  if (tempo_decorrido < GPS_RATE_LIMIT_MS) {
    return {
      permitido: false,
      segundosAteProxima: Math.ceil((GPS_RATE_LIMIT_MS - tempo_decorrido) / 1000),
    };
  }

  lastGpsUpdate.set(deliveryId, agora);
  return { permitido: true };
}

// ============================================================================
// CONTROLLERS COM SEGURANÇA APRIMORADA
// ============================================================================

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
    const userIdAutenticado = (req as any).user?.id;
    const { entregadorId } = req.body;

    if (!userIdAutenticado) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // VALIDAR: O entregadorId no body deve ser o usuário autenticado
    if (entregadorId !== userIdAutenticado) {
      return res.status(403).json({ error: 'Você só pode aceitar entregas para si mesmo' });
    }

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
    const userIdAutenticado = (req as any).user?.id; // Vem do auth middleware

    if (!userIdAutenticado) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // VALIDAR: Apenas o entregador dono pode rejeitar
    const validacao = await validarPermissaoEntregador(entregaId, userIdAutenticado);
    if (!validacao.valido) {
      return res.status(403).json({ error: validacao.erro });
    }

    const entrega = validacao.entrega;

    // VALIDAR: Transição de status
    const transicao = validarTransicaoStatus(entrega.status, 'AGUARDANDO_COLETA');
    if (!transicao.valido) {
      return res.status(400).json({ error: transicao.erro });
    }

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

// Atualizar localização GPS — persiste no banco com rate limiting
export async function atualizarLocalizacao(req: Request, res: Response) {
  try {
    const entregaId = String(req.params.entregaId);
    const userIdAutenticado = (req as any).user?.id;
    const { latitude, longitude, velocidade, precisao } = req.body;

    if (!userIdAutenticado) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // VALIDAR: Coordenadas obrigatórias
    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
    }

    // VALIDAR: Coordenadas válidas
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Coordenadas GPS inválidas' });
    }

    // VALIDAR: Apenas o entregador dono pode atualizar GPS
    const validacao = await validarPermissaoEntregador(entregaId, userIdAutenticado);
    if (!validacao.valido) {
      return res.status(403).json({ error: validacao.erro });
    }

    // VALIDAR: Rate limiting (máx 1 atualização a cada 5 segundos)
    const rateLimitCheck = verificarGpsRateLimit(entregaId);
    if (!rateLimitCheck.permitido) {
      return res.status(429).json({
        error: `Muitas atualizações de GPS. Tente novamente em ${rateLimitCheck.segundosAteProxima}s`,
      });
    }

    const gpsLog = await prisma.deliveryGPS.create({
      data: {
        deliveryId: entregaId,
        latitude: lat,
        longitude: lng,
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
    const userIdAutenticado = (req as any).user?.id;

    if (!userIdAutenticado) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // VALIDAR: Apenas o entregador dono pode confirmar coleta
    const validacao = await validarPermissaoEntregador(entregaId, userIdAutenticado);
    if (!validacao.valido) {
      return res.status(403).json({ error: validacao.erro });
    }

    const entrega = validacao.entrega;

    // VALIDAR: Transição de status
    const transicao = validarTransicaoStatus(entrega.status, 'A_CAMINHO_ENTREGA');
    if (!transicao.valido) {
      return res.status(400).json({ error: transicao.erro });
    }

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
    const userIdAutenticado = (req as any).user?.id;
    const { assinatura } = req.body;

    if (!userIdAutenticado) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // VALIDAR: Apenas o entregador dono pode confirmar entrega
    const validacao = await validarPermissaoEntregador(entregaId, userIdAutenticado);
    if (!validacao.valido) {
      return res.status(403).json({ error: validacao.erro });
    }

    const entrega = validacao.entrega;

    // VALIDAR: Transição de status
    const transicao = validarTransicaoStatus(entrega.status, 'ENTREGUE');
    if (!transicao.valido) {
      return res.status(400).json({ error: transicao.erro });
    }

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

// Obter histórico completo de entregas do entregador (concluídas + canceladas)
export async function obterHistoricoEntregas(req: Request, res: Response) {
  try {
    const userIdAutenticado = (req as any).user?.id;

    if (!userIdAutenticado) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Buscar todas as entregas concluídas ou rejeitadas
    const entregas = await prisma.delivery.findMany({
      where: {
        entregadorId: userIdAutenticado,
        status: {
          in: ['ENTREGUE'],  // Apenas entregas concluídas
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
      },
      orderBy: {
        entregueEm: 'desc',  // Mais recentes primeiro
      },
    });

    // Calcular estatísticas
    const stats = {
      totalEntregas: entregas.length,
      ganhoTotal: entregas.reduce((acc: number, curr: any) => acc + (curr.pedido?.valorTotal || 0), 0),
      kmTotal: entregas.length * 5,  // Aproximado por enquanto
      mediaAvaliacao: 4.8,  // Mock por enquanto
    };

    return res.json({ entregas, stats });
  } catch (error) {
    console.error('Erro ao obter histórico de entregas:', error);
    return res.status(500).json({ error: 'Erro ao obter histórico' });
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
