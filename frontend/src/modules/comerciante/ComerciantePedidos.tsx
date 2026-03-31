import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pedidosComercioMock } from '../../data/comercianteMock';
import { formatPrice, getStatusLabel, getStatusColor } from '../../data/mockData';
import ComercianteLayout from './ComercianteLayout';
import './ComerciantePedidos.css';

const statusOrder = ['novo', 'confirmado', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado'] as const;

export default function ComerciantePedidos() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<string>('todos');

  const pedidos = filtro === 'todos'
    ? pedidosComercioMock
    : pedidosComercioMock.filter(p => p.status === filtro);

  const contadores = statusOrder.reduce((acc, s) => {
    acc[s] = pedidosComercioMock.filter(p => p.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const handleAvancarStatus = (pedidoId: number) => {
    // Simulação — em produção seria uma chamada API
    alert(`Pedido ${pedidoId} avançou de status! (simulado)`);
  };

  const nextStatusLabel = (status: string) => {
    switch (status) {
      case 'novo': return '✓ Aceitar';
      case 'confirmado': return '👨‍🍳 Preparar';
      case 'preparando': return '📦 Pronto';
      case 'pronto': return '🛵 Enviar';
      default: return '';
    }
  };

  return (
    <ComercianteLayout title="Pedidos" subtitle="Gerencie os pedidos do seu comércio">
      {/* Filtros */}
      <div className="pedidos-filters animate-fade-in-up">
        <button
          className={`pedido-filter-btn ${filtro === 'todos' ? 'active' : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos ({pedidosComercioMock.length})
        </button>
        {statusOrder.filter(s => contadores[s] > 0).map(s => (
          <button
            key={s}
            className={`pedido-filter-btn ${filtro === s ? 'active' : ''} ${s === 'novo' ? 'filter-novo' : ''}`}
            onClick={() => setFiltro(s)}
          >
            {getStatusLabel(s)} ({contadores[s]})
          </button>
        ))}
      </div>

      {/* Kanban mobile / List */}
      <div className="pedidos-com-list animate-fade-in-up delay-1">
        {pedidos.map(pedido => (
          <div key={pedido.id} className={`pedido-com-card status-${pedido.status}`} id={`pedido-${pedido.id}`}>
            <div className="pedido-com-header">
              <div className="pedido-com-left">
                <span className="pedido-com-numero">{pedido.numero}</span>
                <span className="pedido-com-time">{pedido.criadoEm}</span>
                {pedido.tempoDecorrido && (
                  <span className={`pedido-com-elapsed ${pedido.status === 'novo' ? 'urgente' : ''}`}>
                    ⏱ {pedido.tempoDecorrido}
                  </span>
                )}
              </div>
              <span className={`badge ${getStatusColor(pedido.status)}`}>
                {getStatusLabel(pedido.status)}
              </span>
            </div>

            <div className="pedido-com-client">
              <span className="pedido-com-client-icon">👤</span>
              <span className="pedido-com-client-name">{pedido.clienteNome}</span>
              <span className="pedido-com-payment">{pedido.formaPagamento}</span>
            </div>

            <div className="pedido-com-items">
              {pedido.items.map((item, i) => (
                <div key={i} className="pedido-com-item-row">
                  <span className="pedido-com-item-qty">{item.quantidade}×</span>
                  <span className="pedido-com-item-name">{item.nome}</span>
                  <span className="pedido-com-item-price">{formatPrice(item.preco * item.quantidade)}</span>
                </div>
              ))}
            </div>

            <div className="pedido-com-footer">
              <span className="pedido-com-total">Total: <strong>{formatPrice(pedido.total)}</strong></span>
              <div className="pedido-com-actions">
                {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && pedido.status !== 'saiu_entrega' && (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAvancarStatus(pedido.id)}
                    >
                      {nextStatusLabel(pedido.status)}
                    </button>
                    {pedido.status === 'novo' && (
                      <button className="btn btn-ghost btn-sm text-danger">✕ Recusar</button>
                    )}
                  </>
                )}
                <button className="btn btn-ghost btn-sm">🖨️</button>
              </div>
            </div>
          </div>
        ))}

        {pedidos.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>Nenhum pedido com esse filtro</h3>
          </div>
        )}
      </div>
    </ComercianteLayout>
  );
}
