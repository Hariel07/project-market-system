import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../lib/api';
import { playNotificationSound } from '../../lib/sounds';
import ComercianteLayout from './ComercianteLayout';
import './ComerciantePedidos.css';

interface ItemPedido {
  id: string;
  quantidade: number;
  precoUnitario: number;
  produto: { nome: string; imagemUrl: string | null };
}

interface Pedido {
  id: string;
  status: string;
  valorTotal: number;
  metodoPagto: string;
  observacoes: string | null;
  createdAt: string;
  cliente: { nome: string; account: { telefone: string } };
  itens: ItemPedido[];
  entrega: { id: string; status: string } | null;
}

const STATUS_ORDER = ['PENDENTE', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA', 'ENTREGUE', 'CANCELADO'] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Novo',
  PREPARANDO: 'Preparando',
  PRONTO: 'Pronto',
  SAIU_ENTREGA: 'Saiu p/ entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: 'badge-warning',
  PREPARANDO: 'badge-info',
  PRONTO: 'badge-accent',
  SAIU_ENTREGA: 'badge-primary',
  ENTREGUE: 'badge-success',
  CANCELADO: 'badge-danger',
};

const NEXT_ACTION: Record<string, string> = {
  PENDENTE: '✓ Aceitar',
  PREPARANDO: '👨‍🍳 Pronto',
  PRONTO: '📦 Aguardando entregador',
};

const NEXT_STATUS: Record<string, string> = {
  PENDENTE: 'PREPARANDO',
  PREPARANDO: 'PRONTO',
};

const PAYMENT_LABEL: Record<string, string> = {
  PIX: '💳 Pix',
  CREDITO: '💳 Crédito',
  DEBITO: '💳 Débito',
  DINHEIRO: '💵 Dinheiro',
};

function formatPrice(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff}min atrás`;
  return `${Math.floor(diff / 60)}h atrás`;
}

export default function ComerciantePedidos() {
  const [filtro, setFiltro] = useState<string>('todos');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState<string | null>(null);

  // Rastrear IDs de pedidos PENDENTE para detectar novos
  const prevPendenteIdsRef = useRef<Set<string> | null>(null);
  const isFirstLoadRef = useRef(true);

  const fetchPedidos = useCallback(async () => {
    try {
      const res = await api.get('/pedidos/comercio');
      const lista: Pedido[] = Array.isArray(res.data) ? res.data : [];
      setPedidos(lista);

      // Detectar novos pedidos PENDENTE e tocar som
      const currentPendenteIds = new Set(lista.filter(p => p.status === 'PENDENTE').map(p => p.id));

      if (isFirstLoadRef.current) {
        // Primeira carga — apenas gravar, sem tocar som
        isFirstLoadRef.current = false;
      } else if (prevPendenteIdsRef.current) {
        // Verificar se há IDs novos que não estavam no set anterior
        const hasNew = [...currentPendenteIds].some(id => !prevPendenteIdsRef.current!.has(id));
        if (hasNew) {
          playNotificationSound();
          // Vibrar se dispositivo móvel suportar
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
      }

      prevPendenteIdsRef.current = currentPendenteIds;
    } catch {
      // silently retry on next poll
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
    // Polling a cada 15s para novos pedidos (era 30s, reduzido para melhor resposta)
    const interval = setInterval(fetchPedidos, 15000);
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  const handleAvancar = async (pedidoId: string, novoStatus: string) => {
    setAdvancing(pedidoId);
    try {
      const res = await api.patch(`/pedidos/${pedidoId}/status`, { status: novoStatus });
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: res.data.status } : p));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao atualizar pedido.');
    } finally {
      setAdvancing(null);
    }
  };

  const handleCancelar = async (pedidoId: string) => {
    if (!confirm('Cancelar este pedido?')) return;
    setAdvancing(pedidoId);
    try {
      const res = await api.patch(`/pedidos/${pedidoId}/status`, { status: 'CANCELADO' });
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: res.data.status } : p));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cancelar pedido.');
    } finally {
      setAdvancing(null);
    }
  };

  const pedidosFiltrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.status === filtro);

  const contadores = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = pedidos.filter(p => p.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const novos = contadores['PENDENTE'] || 0;

  return (
    <ComercianteLayout
      title="Pedidos"
      subtitle="Gerencie os pedidos do seu comércio"
      actions={
        <button className="btn btn-ghost btn-sm" onClick={fetchPedidos}>
          🔄 Atualizar
        </button>
      }
    >
      {/* Filtros */}
      <div className="pedidos-filters animate-fade-in-up">
        <button
          className={`pedido-filter-btn ${filtro === 'todos' ? 'active' : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos ({pedidos.length})
        </button>
        {STATUS_ORDER.filter(s => contadores[s] > 0 || s === 'PENDENTE').map(s => (
          <button
            key={s}
            className={`pedido-filter-btn ${filtro === s ? 'active' : ''} ${s === 'PENDENTE' ? 'filter-novo' : ''}`}
            onClick={() => setFiltro(s)}
          >
            {STATUS_LABEL[s]} {contadores[s] > 0 ? `(${contadores[s]})` : ''}
          </button>
        ))}
      </div>

      {/* Banner de novos pedidos */}
      {novos > 0 && filtro !== 'PENDENTE' && (
        <div
          className="pedidos-new-banner animate-fade-in-up"
          onClick={() => setFiltro('PENDENTE')}
        >
          🔔 {novos} novo{novos > 1 ? 's pedidos precisam' : ' pedido precisa'} de atenção!
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <span className="empty-icon"><span className="spinner" /></span>
          <h3>Carregando pedidos...</h3>
        </div>
      ) : (
        <div className="pedidos-com-list animate-fade-in-up delay-1">
          {pedidosFiltrados.map(pedido => (
            <div
              key={pedido.id}
              className={`pedido-com-card status-${pedido.status.toLowerCase()}`}
              id={`pedido-${pedido.id}`}
            >
              <div className="pedido-com-header">
                <div className="pedido-com-left">
                  <span className="pedido-com-numero">#{pedido.id.slice(-6).toUpperCase()}</span>
                  <span className="pedido-com-time">{timeAgo(pedido.createdAt)}</span>
                </div>
                <span className={`badge ${STATUS_COLOR[pedido.status] || 'badge-secondary'}`}>
                  {STATUS_LABEL[pedido.status] || pedido.status}
                </span>
              </div>

              <div className="pedido-com-client">
                <span className="pedido-com-client-icon">👤</span>
                <span className="pedido-com-client-name">{pedido.cliente?.nome}</span>
                <span className="pedido-com-payment">{PAYMENT_LABEL[pedido.metodoPagto] || pedido.metodoPagto}</span>
              </div>

              {pedido.observacoes && (
                <div className="pedido-com-obs">
                  📝 {pedido.observacoes}
                </div>
              )}

              <div className="pedido-com-items">
                {pedido.itens.map(item => (
                  <div key={item.id} className="pedido-com-item-row">
                    <span className="pedido-com-item-qty">{item.quantidade}×</span>
                    <span className="pedido-com-item-name">{item.produto.nome}</span>
                    <span className="pedido-com-item-price">{formatPrice(item.precoUnitario * item.quantidade)}</span>
                  </div>
                ))}
              </div>

              <div className="pedido-com-footer">
                <span className="pedido-com-total">Total: <strong>{formatPrice(pedido.valorTotal)}</strong></span>
                <div className="pedido-com-actions">
                  {NEXT_STATUS[pedido.status] && (
                    <button
                      className={`btn btn-primary btn-sm ${advancing === pedido.id ? 'loading' : ''}`}
                      disabled={advancing === pedido.id}
                      onClick={() => handleAvancar(pedido.id, NEXT_STATUS[pedido.status])}
                    >
                      {advancing === pedido.id ? <span className="spinner" /> : NEXT_ACTION[pedido.status]}
                    </button>
                  )}
                  {pedido.status === 'PENDENTE' && (
                    <button
                      className="btn btn-ghost btn-sm text-danger"
                      disabled={advancing === pedido.id}
                      onClick={() => handleCancelar(pedido.id)}
                    >
                      ✕ Recusar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {pedidosFiltrados.length === 0 && !loading && (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <h3>{filtro === 'todos' ? 'Nenhum pedido ainda' : 'Nenhum pedido com esse status'}</h3>
            </div>
          )}
        </div>
      )}
    </ComercianteLayout>
  );
}
