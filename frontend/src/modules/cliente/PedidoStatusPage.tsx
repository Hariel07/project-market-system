import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { formatPrice } from '../../data/mockData';
import { api } from '../../lib/api';
import './PedidoStatusPage.css';

interface PedidoDetalhe {
  id: string;
  status: string;
  valorTotal: number;
  taxaEntrega: number;
  metodoPagto: string;
  enderecoEntrega?: string;
  observacoes?: string;
  createdAt: string;
  comercio: { id: string; nomeFantasia: string; logoUrl?: string };
  cliente: { nome: string; account: { telefone?: string } };
  itens: {
    id: string;
    quantidade: number;
    precoUnitario: number;
    produto: { nome: string; imagemUrl?: string };
  }[];
  entrega?: {
    id: string;
    status: string;
    entregador?: {
      nome: string;
      account: { telefone?: string };
    };
  };
}

const statusSteps = [
  { key: 'PENDENTE',     icon: '✓',   label: 'Confirmado' },
  { key: 'PREPARANDO',   icon: '👨‍🍳', label: 'Preparando' },
  { key: 'PRONTO',       icon: '📦',  label: 'Pronto' },
  { key: 'SAIU_ENTREGA', icon: '🛵',  label: 'A caminho' },
  { key: 'ENTREGUE',     icon: '🏠',  label: 'Entregue' },
];

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pedido Confirmado',
  PREPARANDO: 'Preparando',
  PRONTO: 'Pronto para coleta',
  SAIU_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

function formatData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function PedidoStatusPage() {
  const { id } = useParams();
  const [pedido, setPedido] = useState<PedidoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/pedidos/${id}`)
      .then((res: any) => setPedido(res.data))
      .catch(() => setPedido(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        Carregando pedido...
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        Pedido não encontrado.
      </div>
    );
  }

  const statusIdx = statusSteps.findIndex(s => s.key === pedido.status);
  const subtotal = pedido.valorTotal - pedido.taxaEntrega;
  const entregador = pedido.entrega?.entregador;

  return (
    <div className="pedido-status-page">
      <TopBar title={`Pedido #${pedido.id.slice(-6).toUpperCase()}`} showBack showCart={false} />

      <main className="page-content">
        <div className="container">
          {/* Status Header */}
          <div className="status-hero animate-fade-in-up">
            <div className="status-hero-icon">
              {pedido.status === 'ENTREGUE' ? '✅' :
               pedido.status === 'SAIU_ENTREGA' ? '🛵' :
               pedido.status === 'PREPARANDO' ? '👨‍🍳' :
               pedido.status === 'CANCELADO' ? '❌' : '📦'}
            </div>
            <h1 className="status-hero-title">{STATUS_LABEL[pedido.status] ?? pedido.status}</h1>
            {!['ENTREGUE', 'CANCELADO'].includes(pedido.status) && (
              <p className="status-hero-eta">Pedido em: <strong>{formatData(pedido.createdAt)}</strong></p>
            )}
          </div>

          {/* Timeline */}
          <div className="status-timeline animate-fade-in-up delay-1">
            {statusSteps.map((step, i) => {
              const isDone = i <= statusIdx;
              const isCurrent = i === statusIdx;
              return (
                <div key={step.key} className={`timeline-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="timeline-indicator">
                    <div className="timeline-dot">{isDone ? step.icon : ''}</div>
                    {i < statusSteps.length - 1 && <div className="timeline-line" />}
                  </div>
                  <div className="timeline-content">
                    <span className="timeline-label">{step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Entregador (quando saiu para entrega) */}
          {pedido.status === 'SAIU_ENTREGA' && (
            <div className="tracking-section animate-fade-in-up delay-2">
              <h2 className="section-title">📍 Rastreamento</h2>
              <div className="tracking-map">
                <div className="map-placeholder">
                  <div className="map-route">
                    <span className="route-dot start">🏪</span>
                    <div className="route-line" />
                    <span className="route-dot rider">🛵</span>
                    <div className="route-line dashed" />
                    <span className="route-dot end">🏠</span>
                  </div>
                </div>
              </div>

              {entregador && (
                <div className="driver-card">
                  <div className="driver-avatar">🧑</div>
                  <div className="driver-info">
                    <p className="driver-name">{entregador.nome}</p>
                    {entregador.account.telefone && (
                      <p className="driver-phone">{entregador.account.telefone}</p>
                    )}
                  </div>
                  {entregador.account.telefone && (
                    <a href={`tel:${entregador.account.telefone}`} className="btn btn-outline btn-sm">
                      📞 Ligar
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Detalhes */}
          <div className="order-details animate-fade-in-up delay-3">
            <h2 className="section-title">Detalhes do pedido</h2>

            <div className="detail-card">
              <div className="detail-card-header">
                <span className="detail-store-logo">
                  {pedido.comercio.logoUrl && pedido.comercio.logoUrl.length <= 4
                    ? pedido.comercio.logoUrl : '🏪'}
                </span>
                <div>
                  <p className="detail-store-name">{pedido.comercio.nomeFantasia}</p>
                  <p className="detail-date">{formatData(pedido.createdAt)}</p>
                </div>
              </div>

              <div className="detail-items">
                {pedido.itens.map((item) => (
                  <div key={item.id} className="detail-item-row">
                    <span className="detail-qty">{item.quantidade}×</span>
                    <span className="detail-name">{item.produto.nome}</span>
                    <span className="detail-price">{formatPrice(item.precoUnitario * item.quantidade)}</span>
                  </div>
                ))}
              </div>

              <div className="detail-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Entrega</span>
                  <span>{pedido.taxaEntrega === 0 ? 'Grátis' : formatPrice(pedido.taxaEntrega)}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>{formatPrice(pedido.valorTotal)}</span>
                </div>
              </div>

              <div className="detail-footer">
                <div className="detail-footer-item">
                  <span className="detail-footer-label">Pagamento</span>
                  <span className="detail-footer-value">{pedido.metodoPagto}</span>
                </div>
                {pedido.enderecoEntrega && (
                  <div className="detail-footer-item">
                    <span className="detail-footer-label">Endereço</span>
                    <span className="detail-footer-value">{pedido.enderecoEntrega}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="status-actions animate-fade-in-up delay-4">
            {pedido.status === 'ENTREGUE' && (
              <button className="btn btn-primary btn-block">Pedir novamente</button>
            )}
            <button className="btn btn-outline btn-block">Preciso de ajuda</button>
          </div>
        </div>
      </main>
    </div>
  );
}
