import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { formatPrice } from '../../data/mockData';
import { api } from '../../lib/api';
import './PedidosPage.css';

interface PedidoAPI {
  id: string;
  status: string;
  valorTotal: number;
  taxaEntrega: number;
  metodoPagto: string;
  enderecoEntrega?: string;
  createdAt: string;
  comercio: { id: string; nomeFantasia: string; logoUrl?: string };
  itens: { id: string; quantidade: number; precoUnitario: number; produto: { nome: string } }[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Confirmado',
  PREPARANDO: 'Preparando',
  PRONTO: 'Pronto',
  SAIU_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: 'badge-info',
  PREPARANDO: 'badge-warning',
  PRONTO: 'badge-accent',
  SAIU_ENTREGA: 'badge-primary',
  ENTREGUE: 'badge-success',
  CANCELADO: 'badge-danger',
};

const STATUS_PROGRESS: Record<string, string> = {
  PENDENTE: '25%',
  PREPARANDO: '50%',
  PRONTO: '65%',
  SAIU_ENTREGA: '80%',
  ENTREGUE: '100%',
  CANCELADO: '0%',
};

function formatData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PedidosPage() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<PedidoAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('@MarketSystem:token')) {
      navigate('/login?redirect=/cliente/pedidos');
      return;
    }

    api.get('pedidos/meus')
      .then((res: any) => setPedidos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  const ativos = pedidos.filter(p => !['ENTREGUE', 'CANCELADO'].includes(p.status));
  const historico = pedidos.filter(p => ['ENTREGUE', 'CANCELADO'].includes(p.status));

  if (loading) {
    return (
      <div className="pedidos-page">
        <TopBar title="Meus Pedidos" showBack showCart />
        <main className="page-content">
          <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            Carregando seus pedidos...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pedidos-page">
      <TopBar title="Meus Pedidos" showBack showCart />

      <main className="page-content">
        <div className="container">
          {ativos.length > 0 && (
            <section className="animate-fade-in-up">
              <h2 className="pedidos-section-title">Em andamento</h2>
              <div className="pedidos-list">
                {ativos.map(pedido => (
                  <div
                    key={pedido.id}
                    className="pedido-card pedido-card-active"
                    onClick={() => navigate(`/cliente/pedido/${pedido.id}`)}
                    id={`pedido-${pedido.id}`}
                  >
                    <div className="pedido-card-top">
                      <div className="pedido-card-store">
                        <span className="pedido-store-logo">
                          {pedido.comercio.logoUrl && pedido.comercio.logoUrl.length <= 4
                            ? pedido.comercio.logoUrl : '🏪'}
                        </span>
                        <div>
                          <h3 className="pedido-store-name">{pedido.comercio.nomeFantasia}</h3>
                          <p className="pedido-number">
                            #{pedido.id.slice(-6).toUpperCase()} • {formatData(pedido.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`badge ${STATUS_COLOR[pedido.status] ?? 'badge-info'}`}>
                        {STATUS_LABEL[pedido.status] ?? pedido.status}
                      </span>
                    </div>

                    <div className="pedido-card-items">
                      {pedido.itens.map((item, i) => (
                        <span key={i} className="pedido-item-tag">
                          {item.quantidade}× {item.produto.nome}
                        </span>
                      ))}
                    </div>

                    <div className="pedido-card-bottom">
                      <span className="pedido-total">{formatPrice(pedido.valorTotal)}</span>
                    </div>

                    <div className="pedido-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: STATUS_PROGRESS[pedido.status] ?? '0%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="animate-fade-in-up delay-1">
            <h2 className="pedidos-section-title">Histórico</h2>
            <div className="pedidos-list">
              {historico.map(pedido => (
                <div
                  key={pedido.id}
                  className="pedido-card"
                  onClick={() => navigate(`/cliente/pedido/${pedido.id}`)}
                  id={`pedido-historico-${pedido.id}`}
                >
                  <div className="pedido-card-top">
                    <div className="pedido-card-store">
                      <span className="pedido-store-logo">
                        {pedido.comercio.logoUrl && pedido.comercio.logoUrl.length <= 4
                          ? pedido.comercio.logoUrl : '🏪'}
                      </span>
                      <div>
                        <h3 className="pedido-store-name">{pedido.comercio.nomeFantasia}</h3>
                        <p className="pedido-number">
                          #{pedido.id.slice(-6).toUpperCase()} • {formatData(pedido.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${STATUS_COLOR[pedido.status] ?? 'badge-info'}`}>
                      {STATUS_LABEL[pedido.status] ?? pedido.status}
                    </span>
                  </div>

                  <div className="pedido-card-items">
                    {pedido.itens.map((item, i) => (
                      <span key={i} className="pedido-item-tag">
                        {item.quantidade}× {item.produto.nome}
                      </span>
                    ))}
                  </div>

                  <div className="pedido-card-bottom">
                    <span className="pedido-total">{formatPrice(pedido.valorTotal)}</span>
                    <span className="pedido-payment">{pedido.metodoPagto}</span>
                  </div>

                  <div className="pedido-card-actions">
                    <button className="btn btn-outline btn-sm" onClick={e => e.stopPropagation()}>
                      Pedir novamente
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>
                      Ajuda
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {pedidos.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <h3>Nenhum pedido ainda</h3>
              <p>Seus pedidos aparecerão aqui</p>
              <button className="btn btn-primary mt-6" onClick={() => navigate('/cliente/mercados')}>
                Explorar mercados
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
