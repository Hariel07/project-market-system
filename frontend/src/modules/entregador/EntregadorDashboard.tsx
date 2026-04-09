import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EntregadorLayout from './EntregadorLayout';
import { oportunidadesMock } from '../../data/entregadorMock';
import { formatPrice } from '../../data/mockData';
import { api } from '../../lib/api';
import { useAuthProtected, useAuthUser } from '../../lib/useAuth';
import { Entrega, OportunidadeEntrega } from '../../types/entrega';
import './EntregadorDashboard.css';

export default function EntregadorDashboard() {
  const navigate = useNavigate();
  
  // ✅ PROTEÇÃO: Validar autenticação e role ENTREGADOR
  useAuthProtected(['ENTREGADOR']);
  const { userId: entregadorId } = useAuthUser();

  // Recupera dados do entregador logado
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('@MarketSystem:user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isOnline, setIsOnline] = useState(false);
  const [oportunidades, setOportunidades] = useState<OportunidadeEntrega[]>(oportunidadesMock);
  const [entregasAtivas, setEntregasAtivas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(false);
  const [erroOportunidades, setErroOportunidades] = useState<string | null>(null);

  const [stats, setStats] = useState({ ganhosHoje: 0, corridasHoje: 0, taxaAceitacao: 100, avaliacao: 5.0 });

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleAceitarCorrida = async (opp: OportunidadeEntrega) => {
    const entregaId = opp.id;
    try {
      await api.post(`/entregas/${entregaId}/aceitar`, { entregadorId });
      navigate(`/entregador/rota/${opp.pedidoId || entregaId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao aceitar corrida';
      alert(msg);
    }
  };

  // Carregar stats reais do financeiro
  useEffect(() => {
    if (!entregadorId) return;
    api.get('financeiro/saldo').then((res: any) => {
      if (res.data?.saldo !== undefined) {
        setStats(prev => ({ ...prev, ganhosHoje: res.data.saldo }));
      }
    }).catch(() => {});
    api.get(`entregas/entregador/${entregadorId}`).then((res: any) => {
      const lista = Array.isArray(res.data) ? res.data : [];
      const concluidas = lista.filter((e: any) => e.status === 'ENTREGUE').length;
      setStats(prev => ({ ...prev, corridasHoje: concluidas }));
    }).catch(() => {});
  }, [entregadorId]);

  // Carregar oportunidades quando entregador fica online
  useEffect(() => {
    if (!isOnline) return;

    setLoading(true);
    setErroOportunidades(null);
    
    api.get('entregas/oportunidades')
      .then((res: any) => {
        // Transformar entregas da API em oportunidades
        const data = Array.isArray(res.data) ? res.data : [];
        const oportunidadesAPI = data.map((pedido: any) => ({
          id: pedido.entrega?.id || pedido.id,
          pedidoId: pedido.id,
          restaurante: pedido.comercio.nomeFantasia,
          enderecoColeta: '(Ver no mapa)',
          distanciaColeta: 1.2,
          enderecoEntrega: pedido.enderecoEntrega || 'Endereço do cliente',
          distanciaEntrega: 3.5,
          valor: pedido.taxaEntrega || 12.50,
          tempoEstimado: 25,
          expiraEm: 45,
          latColeta: -23.5617,
          lngColeta: -46.6560,
          latEntrega: -23.5533,
          lngEntrega: -46.6573,
        }));
        
        if (oportunidadesAPI.length === 0) {
          // Se nenhuma entrega real, mostrar mock
          setOportunidades(oportunidadesMock);
          setErroOportunidades('Usando dados de demonstração');
        } else {
          setOportunidades(oportunidadesAPI);
        }
      })
      .catch((err: any) => {
        console.error('Erro ao carregar oportunidades:', err);
        // Fallback para mock
        setOportunidades(oportunidadesMock);
        setErroOportunidades('Usando dados de demonstração (API indisponível)');
      })
      .finally(() => setLoading(false));
  }, [isOnline]);

  // Carregar minhas entregas ativas
  useEffect(() => {
    if (!isOnline || !entregadorId) return;

    api.get(`/entregas/entregador/${entregadorId}`)
      .then((res: any) => {
        setEntregasAtivas(Array.isArray(res.data) ? res.data : []);
        console.log('✅ Entregas ativas carregadas:', Array.isArray(res.data) ? res.data.length : 0);
      })
      .catch((err: any) => {
        console.error('Erro ao carregar entregas ativas:', err);
        setEntregasAtivas([]); // Sem fallback aqui, entregas são críticas
      });
  }, [isOnline, entregadorId]);

  return (
    <EntregadorLayout title="Início">
      <div className="ent-dashboard animate-fade-in-up">
        
        {/* Perfil do Entregador (Conta vinculada ao CPF) */}
        <div className="gestor-profile-card">
          <div className="gestor-avatar">
            {user?.nomeCompleto?.charAt(0) || user?.nome?.charAt(0) || '🛵'}
          </div>
          <div className="gestor-info">
            <div className="gestor-main">
              <h3 className="gestor-name">{user?.nomeCompleto || user?.nome || 'Entregador'}</h3>
              <span className="gestor-badge">CPF: {formatCPF(user?.cpf)}</span>
            </div>
            <div className="gestor-details">
              <span className="gestor-detail-item">📧 {user?.email}</span>
              <span className="gestor-detail-item">📱 {user?.telefone || 'Não informado'}</span>
            </div>
          </div>
          <button className="gestor-edit-btn" onClick={() => navigate('/entregador/editar-perfil')}>
            ⚙️ Perfil
          </button>
        </div>

        {/* Toggle Online/Offline Header */}
        <div className={`ent-status-header ${isOnline ? 'online' : 'offline'}`}>
          <div className="ent-status-info">
            <h2>{isOnline ? 'Você está Online' : 'Você está Offline'}</h2>
            <p>{isOnline ? 'Procurando corridas perto de você...' : 'Fique online para receber pedidos'}</p>
          </div>
          <label className="ent-switcher">
            <input 
              type="checkbox" 
              checked={isOnline} 
              onChange={e => setIsOnline(e.target.checked)} 
              id="toggle-online" 
            />
            <span className="ent-slider round"></span>
          </label>
        </div>

        {/* Resumo do dia (só mostra offline pra não poluir, ou mostra sempre pequeno) */}
        {!isOnline && (
          <div className="ent-stats-card animate-fade-in-up delay-1">
            <h3 className="ent-section-title">Resumo de Hoje</h3>
            <div className="ent-stats-grid">
              <div className="ent-stat-item highlight">
                <span className="ent-stat-label">Ganhos</span>
                <span className="ent-stat-val">{formatPrice(stats.ganhosHoje)}</span>
              </div>
              <div className="ent-stat-item">
                <span className="ent-stat-label">Corridas</span>
                <span className="ent-stat-val">{stats.corridasHoje}</span>
              </div>
              <div className="ent-stat-item">
                <span className="ent-stat-label">Aceitação</span>
                <span className="ent-stat-val">{stats.taxaAceitacao}%</span>
              </div>
              <div className="ent-stat-item">
                <span className="ent-stat-label">Nota</span>
                <span className="ent-stat-val">⭐ {stats.avaliacao}</span>
              </div>
            </div>
            <button className="btn btn-outline btn-block mt-3" onClick={() => navigate('/entregador/ganhos')}>
              Ver detalhes dos ganhos →
            </button>
          </div>
        )}

        {/* Mapa Mockado do radar */}
        {isOnline && (
          <div className="ent-radar-map animate-fade-in-up">
            <div className="radar-circle"></div>
            <div className="radar-circle delay"></div>
            <span className="radar-icon">🛵</span>
            <div className="hotzone" style={{ top: '20%', left: '30%' }}>🔥 Alta demanda</div>
            <div className="hotzone" style={{ bottom: '30%', right: '20%' }}>🔥 Moderada</div>
          </div>
        )}

        {/* Aviso de Dados de Demonstração */}
        {erroOportunidades && (
          <div style={{
            backgroundColor: '#FEF3C7',
            borderLeft: '4px solid #FBBF24',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#92400E',
          }}>
            ⚠️ {erroOportunidades}
          </div>
        )}

        {/* Lista de Oportunidades Pendentes */}
        {isOnline && (
          <div className="ent-oportunidades animate-fade-in-up delay-1">
            <h3 className="ent-section-title flex-between">
              Corridas Disponíveis
              <span className="badge badge-primary bounce">{oportunidades.length}</span>
            </h3>

            {loading && <p className="text-center text-secondary" style={{padding: '20px'}}>⏳ Carregando oportunidades...</p>}

            {oportunidades.length === 0 && !loading && (
              <div className="ent-empty-state" style={{padding: '40px 20px', textAlign: 'center'}}>
                <p>😴 Nenhuma corrida disponível no momento</p>
                <p style={{fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '8px'}}>Tente novamente em alguns minutos</p>
              </div>
            )}

            <div className="ent-opp-list">
              {oportunidades.map(opp => (
                <div key={opp.id} className="ent-opp-card">
                  <div className="ent-opp-timer-bar">
                    <div className="ent-opp-timer-fill" style={{ animationDuration: `${opp.expiraEm}s` }}></div>
                  </div>

                  <div className="ent-opp-body">
                    <div className="ent-opp-top">
                      <span className="ent-opp-price">{formatPrice(opp.valor)}</span>
                      <span className="ent-opp-time">⌚ {opp.tempoEstimado} min</span>
                    </div>

                    <div className="ent-opp-route">
                      <div className="route-point start">
                        <span className="route-dot"></span>
                        <div className="route-texts">
                          <span className="route-title">Coleta · {opp.distanciaColeta}km</span>
                          <span className="route-desc">{opp.restaurante}</span>
                        </div>
                      </div>
                      <div className="route-line"></div>
                      <div className="route-point end">
                        <span className="route-dot pulse"></span>
                        <div className="route-texts">
                          <span className="route-title">Entrega · {opp.distanciaEntrega}km</span>
                          <span className="route-desc">{opp.enderecoEntrega}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ent-opp-actions">
                      <button
                        className="btn btn-ghost btn-sm text-danger"
                        onClick={() => api.post(`/entregas/${opp.id}/rejeitar`, {}).catch(() => null)}
                      >
                        Recusar
                      </button>
                      <button
                        className="btn btn-primary flex-1 btn-bump"
                        onClick={() => handleAceitarCorrida(opp)}
                      >
                        ACEITAR CORRIDA
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </EntregadorLayout>
  );
}
