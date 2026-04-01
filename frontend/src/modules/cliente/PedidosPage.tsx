import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { pedidosMock, formatPrice, getStatusLabel, getStatusColor } from '../../data/mockData';
import './PedidosPage.css';

export default function PedidosPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('@MarketSystem:token')) {
      navigate('/login?redirect=/cliente/pedidos');
    }
  }, [navigate]);

  const pedidosAtivos = pedidosMock.filter(p => !['entregue', 'cancelado'].includes(p.status));
  const pedidosHistorico = pedidosMock.filter(p => ['entregue', 'cancelado'].includes(p.status));

  return (
    <div className="pedidos-page">
      <TopBar title="Meus Pedidos" showBack showCart />

      <main className="page-content">
        <div className="container">
          {/* Ativos */}
          {pedidosAtivos.length > 0 && (
            <section className="animate-fade-in-up">
              <h2 className="pedidos-section-title">Em andamento</h2>
              <div className="pedidos-list">
                {pedidosAtivos.map(pedido => (
                  <div
                    key={pedido.id}
                    className="pedido-card pedido-card-active"
                    onClick={() => navigate(`/cliente/pedido/${pedido.id}`)}
                    id={`pedido-${pedido.id}`}
                  >
                    <div className="pedido-card-top">
                      <div className="pedido-card-store">
                        <span className="pedido-store-logo">{pedido.comercioLogo}</span>
                        <div>
                          <h3 className="pedido-store-name">{pedido.comercioNome}</h3>
                          <p className="pedido-number">{pedido.numero} • {pedido.criadoEm}</p>
                        </div>
                      </div>
                      <span className={`badge ${getStatusColor(pedido.status)}`}>
                        {getStatusLabel(pedido.status)}
                      </span>
                    </div>

                    <div className="pedido-card-items">
                      {pedido.items.map((item, i) => (
                        <span key={i} className="pedido-item-tag">
                          {item.quantidade}× {item.nome}
                        </span>
                      ))}
                    </div>

                    <div className="pedido-card-bottom">
                      <span className="pedido-total">{formatPrice(pedido.total)}</span>
                      <span className="pedido-eta">Previsão: {pedido.estimativaEntrega}</span>
                    </div>

                    <div className="pedido-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: pedido.status === 'confirmado' ? '25%' :
                                   pedido.status === 'preparando' ? '50%' :
                                   pedido.status === 'pronto' ? '65%' :
                                   pedido.status === 'saiu_entrega' ? '80%' : '100%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Histórico */}
          <section className="animate-fade-in-up delay-1">
            <h2 className="pedidos-section-title">Histórico</h2>
            <div className="pedidos-list">
              {pedidosHistorico.map(pedido => (
                <div
                  key={pedido.id}
                  className="pedido-card"
                  onClick={() => navigate(`/cliente/pedido/${pedido.id}`)}
                  id={`pedido-historico-${pedido.id}`}
                >
                  <div className="pedido-card-top">
                    <div className="pedido-card-store">
                      <span className="pedido-store-logo">{pedido.comercioLogo}</span>
                      <div>
                        <h3 className="pedido-store-name">{pedido.comercioNome}</h3>
                        <p className="pedido-number">{pedido.numero} • {pedido.criadoEm}</p>
                      </div>
                    </div>
                    <span className={`badge ${getStatusColor(pedido.status)}`}>
                      {getStatusLabel(pedido.status)}
                    </span>
                  </div>

                  <div className="pedido-card-items">
                    {pedido.items.map((item, i) => (
                      <span key={i} className="pedido-item-tag">
                        {item.quantidade}× {item.nome}
                      </span>
                    ))}
                  </div>

                  <div className="pedido-card-bottom">
                    <span className="pedido-total">{formatPrice(pedido.total)}</span>
                    <span className="pedido-payment">{pedido.formaPagamento}</span>
                  </div>

                  <div className="pedido-card-actions">
                    <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); }}>
                      Pedir novamente
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); }}>
                      Ajuda
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {pedidosMock.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <h3>Nenhum pedido ainda</h3>
              <p>Seus pedidos aparecerão aqui</p>
              <button
                className="btn btn-primary mt-6"
                onClick={() => navigate('/cliente/mercados')}
              >
                Explorar mercados
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
