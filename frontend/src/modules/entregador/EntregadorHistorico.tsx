import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EntregadorLayout from './EntregadorLayout';
import { historicoMock } from '../../data/entregadorMock';
import { formatPrice } from '../../data/mockData';
import { api } from '../../lib/api';
import { useAuthProtected, useAuthUser } from '../../lib/useAuth';
import './EntregadorHistorico.css';

interface EntregaHistorico {
  id: string;
  status: string;
  entregueEm?: Date;
  coletadoEm?: Date;
  pedido: {
    id: string;
    valorTotal: number;
    nomeCliente?: string;
    contato?: string;
    comercio?: {
      nomeFantasia: string;
      enderecoColeta?: string;
      enderecoEntrega?: string;
    };
    itens?: Array<{
      codigo: string;
      nome: string;
      quantidade: number;
      valor: number;
    }>;
  };
  pedidoId?: string;
  coordenadas?: {
    origem: { lat: number; lng: number };
    destino: { lat: number; lng: number };
  };
}

type PeriodoFiltro = 'hoje' | 'semana' | 'mes' | 'ano';

interface EntregaAgrupada {
  periodo: string;
  data: Date;
  entregas: EntregaHistorico[];
  totalGanho: number;
  totalEntregas: number;
  distanciaTotal: number;
}

export default function EntregadorHistorico() {
  const navigate = useNavigate();
  useAuthProtected(['ENTREGADOR']);
  const { userId } = useAuthUser();

  const [entregas, setEntregas] = useState<EntregaHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [filtro, setFiltro] = useState<PeriodoFiltro>('mes');
  const [entregasAgrupadas, setEntregasAgrupadas] = useState<EntregaAgrupada[]>([]);

  // Agrupar entregas por período
  const agruparEntregas = (entregasList: EntregaHistorico[], periodo: PeriodoFiltro) => {
    const agora = new Date();
    const grupos: Map<string, EntregaHistorico[]> = new Map();

    // Filtrar por período e agrupar
    entregasList.forEach((entrega) => {
      const dataEntrega = entrega.entregueEm ? new Date(entrega.entregueEm) : new Date();
      const mesmoAno = dataEntrega.getFullYear() === agora.getFullYear();
      const mesmoMes = mesmoAno && dataEntrega.getMonth() === agora.getMonth();
      const mesmaWeek = mesmoMes && Math.floor((agora.getDate() - dataEntrega.getDate()) / 7) === 0;
      const mesmodia = dataEntrega.toDateString() === agora.toDateString();

      let incluir = false;
      let chave = '';

      if (periodo === 'hoje' && mesmodia) {
        incluir = true;
        chave = 'Hoje';
      } else if (periodo === 'semana' && mesmaWeek && mesmoMes) {
        incluir = true;
        chave = `Semana de ${new Date(dataEntrega.getFullYear(), dataEntrega.getMonth(), dataEntrega.getDate() - dataEntrega.getDay()).toLocaleDateString('pt-BR')}`;
      } else if (periodo === 'mes' && mesmoMes) {
        incluir = true;
        chave = new Date(dataEntrega.getFullYear(), dataEntrega.getMonth(), 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      } else if (periodo === 'ano' && mesmoAno) {
        incluir = true;
        chave = dataEntrega.getFullYear().toString();
      }

      if (incluir) {
        if (!grupos.has(chave)) {
          grupos.set(chave, []);
        }
        grupos.get(chave)!.push(entrega);
      }
    });

    // Converter para array de objetos agrupados
    const agrupados: EntregaAgrupada[] = Array.from(grupos.entries()).map(([periodo, entregasGrupo]) => ({
      periodo,
      data: entregasGrupo[0]?.entregueEm ? new Date(entregasGrupo[0].entregueEm) : new Date(),
      entregas: entregasGrupo.sort((a, b) =>
        new Date(b.entregueEm || 0).getTime() - new Date(a.entregueEm || 0).getTime()
      ),
      totalGanho: entregasGrupo.reduce((acc, e) => acc + (e.pedido?.valorTotal || 0), 0),
      totalEntregas: entregasGrupo.length,
      distanciaTotal: entregasGrupo.length * 5, // Aproximado
    }));

    return agrupados.sort((a, b) => b.data.getTime() - a.data.getTime());
  };

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        if (!userId) {
          setEntregas([]);
          return;
        }

        const response = await api.get('/api/entregas/historico');
        setEntregas(response.data.entregas);
        setUsingMockData(false);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        // Fallback para dados mock
        const mapeadas = historicoMock.map((h, idx) => ({
          id: `mock-${idx}`,
          status: h.status === 'concluida' ? 'ENTREGUE' : 'CANCELADA',
          entregueEm: new Date(h.data),
          coletadoEm: new Date(new Date(h.data).getTime() - Math.random() * 60 * 60 * 1000),
          pedido: {
            id: `order-${idx}`,
            valorTotal: h.valorDaCorrida + h.caixinha,
            nomeCliente: 'Cliente Teste',
            contato: '(11) 99999-9999',
            comercio: {
              nomeFantasia: h.restaurante,
              enderecoColeta: 'Av. Paulista, 1000 - São Paulo - SP',
              enderecoEntrega: 'Rua Augusta, 400 - Consolação - São Paulo - SP',
            },
            itens: [
              {
                codigo: `PROD-${idx}-001`,
                nome: 'Hamburger Duplo',
                quantidade: 1,
                valor: 25.50,
              },
              {
                codigo: `PROD-${idx}-002`,
                nome: 'Refrigerante 2L',
                quantidade: 1,
                valor: 8.90,
              },
              {
                codigo: `PROD-${idx}-003`,
                nome: 'Batata Frita G',
                quantidade: 1,
                valor: 12.50,
              },
            ],
          },
        }));
        setEntregas(mapeadas);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    carregarHistorico();
  }, [userId]);

  // Atualizar agrupamento quando mudam entregas ou filtro
  useEffect(() => {
    const agrupados = agruparEntregas(entregas, filtro);
    setEntregasAgrupadas(agrupados);
  }, [entregas, filtro]);

  if (loading) {
    return (
      <EntregadorLayout title="Histórico de Corridas">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>⏳ Carregando histórico...</p>
        </div>
      </EntregadorLayout>
    );
  }

  return (
    <EntregadorLayout title="Histórico de Corridas">
      <div className="ent-historico">
        {/* Aviso se usando dados de demonstração */}
        {usingMockData && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#856404',
            fontSize: '14px'
          }}>
            ⚠️ Usando dados de demonstração (API indisponível)
          </div>
        )}

        {/* Filtros por Período */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {(['hoje', 'semana', 'mes', 'ano'] as const).map((periodo) => (
            <button
              key={periodo}
              onClick={() => setFiltro(periodo)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: filtro === periodo ? '#ff6b35' : '#f0f0f0',
                color: filtro === periodo ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: filtro === periodo ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s'
              }}
            >
              {periodo === 'hoje' && '📅 Hoje'}
              {periodo === 'semana' && '📊 Esta Semana'}
              {periodo === 'mes' && '📈 Este Mês'}
              {periodo === 'ano' && '📉 Este Ano'}
            </button>
          ))}
        </div>

        {/* Timeline de Corridas */}
        {entregasAgrupadas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>📭 Nenhuma corrida neste período</p>
            <p style={{ fontSize: '14px' }}>Comece a aceitar entregas para ver seu histórico aqui</p>
          </div>
        ) : (
          entregasAgrupadas.map((grupo, groupIdx) => (
            <div key={groupIdx} style={{ marginBottom: '24px' }} className="animate-fade-in-up">
              {/* Header do Período */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '2px solid #e0e0e0',
                marginBottom: '12px'
              }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  {grupo.periodo}
                </h3>
                <span style={{
                  background: '#fff3cd',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#856404'
                }}>
                  {grupo.totalEntregas} corrida{grupo.totalEntregas > 1 ? 's' : ''} • {formatPrice(grupo.totalGanho)}
                </span>
              </div>

              {/* Lista de Corridas do Período */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {grupo.entregas.map((entrega, idx) => {
                  const dataEntrega = entrega.entregueEm ? new Date(entrega.entregueEm) : new Date();
                  const dataColeta = entrega.coletadoEm ? new Date(entrega.coletadoEm) : new Date();
                  const horaColeta = dataColeta.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const horaEntrega = dataEntrega.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const duracao = Math.round((dataEntrega.getTime() - dataColeta.getTime()) / (1000 * 60));

                  return (
                    <div
                      key={entrega.id}
                      style={{
                        background: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '12px',
                        overflow: 'hidden',
                        transition: 'all 0.2s'
                      }}
                    >
                      {/* Header com Status */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '20px' }}>
                            {entrega.status === 'ENTREGUE' ? '✅' : '❌'}
                          </span>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                              {entrega.pedido.comercio?.nomeFantasia || 'Comércio'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#999' }}>
                              {dataEntrega.toLocaleDateString('pt-BR')} • {entrega.pedido.id}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#ff6b35' }}>
                            {formatPrice(entrega.pedido.valorTotal)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#999' }}>
                            {entrega.status === 'ENTREGUE' ? 'Entregue' : 'Cancelada'}
                          </div>
                        </div>
                      </div>

                      {/* Rota: Origem → Destino */}
                      <div style={{
                        background: '#f9f9f9',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '12px',
                        fontSize: '12px'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ color: '#ff6b35', fontWeight: 'bold' }}>📍</span>
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>COLETA</div>
                            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                              {entrega.pedido.comercio?.enderecoColeta || 'Endereço de coleta'}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', color: '#ff6b35', margin: '8px 0', fontWeight: 'bold' }}>
                          ⬇️ {duracao} min (aprox. 5 km)
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ color: '#4caf50', fontWeight: 'bold' }}>📍</span>
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>ENTREGA</div>
                            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                              {entrega.pedido.comercio?.enderecoEntrega || 'Endereço de entrega'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline de Horários */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        padding: '12px 0',
                        borderBottom: '1px solid #f0f0f0',
                        marginBottom: '12px',
                        fontSize: '12px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#999', marginBottom: '4px' }}>Saída</div>
                          <div style={{ fontWeight: 'bold' }}>{horaColeta}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#ddd' }}>━━━</div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#999', marginBottom: '4px' }}>Chegada</div>
                          <div style={{ fontWeight: 'bold' }}>{horaEntrega}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#ddd' }}>━━━</div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#999', marginBottom: '4px' }}>Duração</div>
                          <div style={{ fontWeight: 'bold' }}>{duracao}min</div>
                        </div>
                      </div>

                      {/* Produtos */}
                      {entrega.pedido.itens && entrega.pedido.itens.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                            📦 Produtos ({entrega.pedido.itens.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {entrega.pedido.itens.map((item, itemIdx) => (
                              <div key={itemIdx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px',
                                background: '#f5f5f5',
                                borderRadius: '4px',
                                fontSize: '11px'
                              }}>
                                <div>
                                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                                    {item.nome}
                                  </div>
                                  <div style={{ color: '#999' }}>
                                    Cod: {item.codigo} • Qty: {item.quantidade}
                                  </div>
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#ff6b35' }}>
                                  {formatPrice(item.valor)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cliente */}
                      <div style={{
                        background: '#e3f2fd',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>👤 Cliente</div>
                        <div>{entrega.pedido.nomeCliente || 'Cliente'}</div>
                        <div style={{ color: '#666', fontSize: '11px' }}>{entrega.pedido.contato || 'Sem contato'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </EntregadorLayout>
  );
}
