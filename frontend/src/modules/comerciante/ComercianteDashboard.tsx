import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { playNotificationSound } from '../../lib/sounds';
import ComercianteLayout from './ComercianteLayout';
import './ComercianteDashboard.css';

interface Pedido {
  id: string;
  status: string;
  valorTotal: number;
  createdAt: string;
  cliente: { nome: string };
  itens: { quantidade: number; produto: { nome: string } }[];
}

interface Produto {
  id: string;
  nome: string;
  estoque: number;
  ativo: boolean;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff}min`;
  return `${Math.floor(diff / 60)}h`;
}

export default function ComercianteDashboard() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const prevPendenteCountRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [pedRes, prodRes] = await Promise.all([
        api.get('/pedidos/comercio').catch(() => ({ data: [] })),
        api.get('/produtos').catch(() => ({ data: [] })),
      ]);
      const lista: Pedido[] = Array.isArray(pedRes.data) ? pedRes.data : [];
      setPedidos(lista);
      setProdutos(Array.isArray(prodRes.data) ? prodRes.data : []);

      // Som de novo pedido no dashboard também
      const pendentes = lista.filter(p => p.status === 'PENDENTE').length;
      if (prevPendenteCountRef.current !== null && pendentes > prevPendenteCountRef.current) {
        playNotificationSound();
      }
      prevPendenteCountRef.current = pendentes;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Stats derivadas dos dados reais
  const pedidosHoje = pedidos.filter(p => isToday(p.createdAt));
  const vendasHoje = pedidosHoje
    .filter(p => p.status !== 'CANCELADO')
    .reduce((sum, p) => sum + p.valorTotal, 0);
  const pedidosPendentes = pedidos.filter(p => p.status === 'PENDENTE').length;
  const ticketMedio = pedidosHoje.length > 0 ? vendasHoje / pedidosHoje.length : 0;
  const itensEstoqueBaixo = produtos.filter(p => p.estoque < 20 && p.ativo).length;

  // Últimos 7 dias para o gráfico
  const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const vendasPorDia = ultimos7Dias.map(dia => {
    const valor = pedidos
      .filter(p => {
        const pd = new Date(p.createdAt);
        return pd.getDate() === dia.getDate() && pd.getMonth() === dia.getMonth() && p.status !== 'CANCELADO';
      })
      .reduce((sum, p) => sum + p.valorTotal, 0);
    return {
      dia: dia.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      valor,
    };
  });

  const maxVenda = Math.max(...vendasPorDia.map(v => v.valor), 1);
  const totalSemana = vendasPorDia.reduce((s, d) => s + d.valor, 0);
  const pedidosNovos = pedidos.filter(p => p.status === 'PENDENTE').slice(0, 4);

  return (
    <ComercianteLayout
      title="Dashboard"
      subtitle="Visão geral do seu comércio hoje"
      actions={
        <>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/comerciante/pedidos')}>
            📋 Ver pedidos
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/comerciante/catalogo/novo')}>
            ➕ Novo item
          </button>
        </>
      }
    >
      {loading ? (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <span className="empty-icon"><span className="spinner" /></span>
          <h3>Carregando dados...</h3>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="stats-grid animate-fade-in-up">
            <div className="stat-card-com stat-vendas">
              <div className="stat-card-icon">💰</div>
              <span className="stat-card-label">Vendas hoje</span>
              <span className="stat-card-value">{formatPrice(vendasHoje)}</span>
              <span className="stat-card-trend positive">{pedidosHoje.filter(p => p.status !== 'CANCELADO').length} pedidos</span>
            </div>
            <div className="stat-card-com stat-pedidos" style={{ cursor: 'pointer' }} onClick={() => navigate('/comerciante/pedidos')}>
              <div className="stat-card-icon">📋</div>
              <span className="stat-card-label">Pendentes</span>
              <span className="stat-card-value">{pedidosPendentes}</span>
              {pedidosPendentes > 0 && <span className="stat-card-badge">Atenção!</span>}
            </div>
            <div className="stat-card-com stat-ticket">
              <div className="stat-card-icon">🎫</div>
              <span className="stat-card-label">Ticket médio</span>
              <span className="stat-card-value">{formatPrice(ticketMedio)}</span>
            </div>
            <div className="stat-card-com stat-estoque" style={{ cursor: 'pointer' }} onClick={() => navigate('/comerciante/estoque')}>
              <div className="stat-card-icon">⚠️</div>
              <span className="stat-card-label">Estoque baixo</span>
              <span className="stat-card-value">{itensEstoqueBaixo}</span>
              <span className="stat-card-link">Ver estoque →</span>
            </div>
          </div>

          {/* Chart + Orders row */}
          <div className="dashboard-grid animate-fade-in-up delay-1">
            {/* Mini chart */}
            <div className="chart-card">
              <div className="section-header">
                <h2 className="section-title">📈 Vendas (7 dias)</h2>
                <span className="chart-total">{formatPrice(totalSemana)}</span>
              </div>
              <div className="chart-bars">
                {vendasPorDia.map((d, i) => (
                  <div key={i} className="chart-bar-group">
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: `${(d.valor / maxVenda) * 100}%` }} />
                    </div>
                    <span className="chart-bar-label">{d.dia}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pedidos novos */}
            <div className="orders-card">
              <div className="section-header">
                <h2 className="section-title">🔔 Pedidos pendentes</h2>
                <button className="section-link" onClick={() => navigate('/comerciante/pedidos')}>
                  Ver todos →
                </button>
              </div>
              {pedidosNovos.length === 0 ? (
                <p className="no-orders">Nenhum pedido pendente 🎉</p>
              ) : (
                <div className="new-orders-list">
                  {pedidosNovos.map(pedido => (
                    <div key={pedido.id} className="new-order-item" onClick={() => navigate('/comerciante/pedidos')}>
                      <div className="new-order-info">
                        <span className="new-order-number">#{pedido.id.slice(-6).toUpperCase()}</span>
                        <span className="new-order-client">{pedido.cliente?.nome}</span>
                      </div>
                      <div className="new-order-right">
                        <span className="new-order-total">{formatPrice(pedido.valorTotal)}</span>
                        <span className="new-order-time">{timeAgo(pedido.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Alertas de estoque */}
          {itensEstoqueBaixo > 0 && (
            <div className="alerts-section animate-fade-in-up delay-2">
              <div className="section-header">
                <h2 className="section-title">⚡ Alertas de estoque</h2>
                <button className="section-link" onClick={() => navigate('/comerciante/estoque')}>
                  Ver estoque →
                </button>
              </div>
              <div className="alerts-list">
                {produtos
                  .filter(p => p.estoque < 20 && p.ativo)
                  .slice(0, 4)
                  .map(p => (
                    <div key={p.id} className="alert-item">
                      <span className="alert-icon">📦</span>
                      <span className="alert-msg">{p.nome} — {p.estoque} un. restantes</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </ComercianteLayout>
  );
}
