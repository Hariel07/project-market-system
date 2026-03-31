import { useParams } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { pedidosMock, formatPrice, getStatusLabel } from '../../data/mockData';
import './PedidoStatusPage.css';

const statusSteps = [
  { key: 'confirmado', icon: '✓', label: 'Confirmado' },
  { key: 'preparando', icon: '👨‍🍳', label: 'Preparando' },
  { key: 'pronto', icon: '📦', label: 'Pronto' },
  { key: 'saiu_entrega', icon: '🛵', label: 'A caminho' },
  { key: 'entregue', icon: '🏠', label: 'Entregue' },
];

export default function PedidoStatusPage() {
  const { id } = useParams();
  const pedido = pedidosMock.find(p => p.id === Number(id));

  if (!pedido) {
    return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Pedido não encontrado</div>;
  }

  const statusIdx = statusSteps.findIndex(s => s.key === pedido.status);

  return (
    <div className="pedido-status-page">
      <TopBar title={`Pedido ${pedido.numero}`} showBack showCart={false} />

      <main className="page-content">
        <div className="container">
          {/* Status Header */}
          <div className="status-hero animate-fade-in-up">
            <div className="status-hero-icon">
              {pedido.status === 'entregue' ? '✅' :
               pedido.status === 'saiu_entrega' ? '🛵' :
               pedido.status === 'preparando' ? '👨‍🍳' : '📦'}
            </div>
            <h1 className="status-hero-title">{getStatusLabel(pedido.status)}</h1>
            {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
              <p className="status-hero-eta">Previsão de entrega: <strong>{pedido.estimativaEntrega}</strong></p>
            )}
          </div>

          {/* Progress Steps */}
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

          {/* Map placeholder */}
          {(pedido.status === 'saiu_entrega') && pedido.entregador && (
            <div className="tracking-section animate-fade-in-up delay-2">
              <h2 className="section-title">📍 Rastreamento</h2>
              <div className="tracking-map">
                <div className="map-placeholder">
                  <span className="map-pin">📍</span>
                  <div className="map-route">
                    <span className="route-dot start">🏪</span>
                    <div className="route-line" />
                    <span className="route-dot rider">🛵</span>
                    <div className="route-line dashed" />
                    <span className="route-dot end">🏠</span>
                  </div>
                  <p className="map-text">Rastreamento em tempo real via gRPC</p>
                </div>
              </div>

              <div className="driver-card">
                <div className="driver-avatar">🧑</div>
                <div className="driver-info">
                  <p className="driver-name">{pedido.entregador.nome}</p>
                  <p className="driver-phone">{pedido.entregador.telefone}</p>
                </div>
                <button className="btn btn-outline btn-sm">📞 Ligar</button>
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="order-details animate-fade-in-up delay-3">
            <h2 className="section-title">Detalhes do pedido</h2>

            <div className="detail-card">
              <div className="detail-card-header">
                <span className="detail-store-logo">{pedido.comercioLogo}</span>
                <div>
                  <p className="detail-store-name">{pedido.comercioNome}</p>
                  <p className="detail-date">{pedido.criadoEm}</p>
                </div>
              </div>

              <div className="detail-items">
                {pedido.items.map((item, i) => (
                  <div key={i} className="detail-item-row">
                    <span className="detail-qty">{item.quantidade}×</span>
                    <span className="detail-name">{item.nome}</span>
                    <span className="detail-price">{formatPrice(item.preco * item.quantidade)}</span>
                  </div>
                ))}
              </div>

              <div className="detail-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(pedido.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Entrega</span>
                  <span>{formatPrice(pedido.taxaEntrega)}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>{formatPrice(pedido.total)}</span>
                </div>
              </div>

              <div className="detail-footer">
                <div className="detail-footer-item">
                  <span className="detail-footer-label">Pagamento</span>
                  <span className="detail-footer-value">{pedido.formaPagamento}</span>
                </div>
                <div className="detail-footer-item">
                  <span className="detail-footer-label">Endereço</span>
                  <span className="detail-footer-value">{pedido.enderecoEntrega}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="status-actions animate-fade-in-up delay-4">
            {pedido.status === 'entregue' && (
              <button className="btn btn-primary btn-block">Pedir novamente</button>
            )}
            <button className="btn btn-outline btn-block">Preciso de ajuda</button>
          </div>
        </div>
      </main>
    </div>
  );
}
