import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { categoriasMock, comerciosMock, itensMock, pedidosMock, formatPrice, getStatusLabel, getStatusColor } from '../../data/mockData';
import './ClienteDashboard.css';

export default function ClienteDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const pedidoAtivo = pedidosMock.find(p => !['entregue', 'cancelado'].includes(p.status));
  const popularItems = itensMock.filter(i => i.avaliacao >= 4.7).slice(0, 6);
  const promoItems = itensMock.filter(i => i.emPromocao).slice(0, 6);

  return (
    <div className="cliente-dashboard">
      <TopBar showSearch showCart onSearch={setSearchTerm} />

      <main className="page-content">
        {/* Hero / Greeting */}
        <section className="hero-section animate-fade-in-up">
          <div className="container">
            <div className="hero-card">
              <div className="hero-content">
                <p className="hero-greeting">Olá! 👋</p>
                <h1 className="hero-title">O que você precisa hoje?</h1>
                <div className="hero-search-mobile hide-tablet-up">
                  <span className="search-icon-mobile">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar produtos, mercados..."
                    className="input hero-search-input"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    id="search-input-mobile"
                  />
                </div>
              </div>
              <div className="hero-illustration">🛍️</div>
            </div>
          </div>
        </section>

        {/* Pedido Ativo */}
        {pedidoAtivo && (
          <section className="container animate-fade-in-up delay-1">
            <div
              className="active-order-card"
              onClick={() => navigate(`/cliente/pedido/${pedidoAtivo.id}`)}
              id="active-order-card"
            >
              <div className="active-order-pulse" />
              <div className="active-order-info">
                <div className="active-order-top">
                  <span className="active-order-logo">{pedidoAtivo.comercioLogo}</span>
                  <div>
                    <p className="active-order-title">Pedido {pedidoAtivo.numero}</p>
                    <p className="active-order-subtitle">{pedidoAtivo.comercioNome}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(pedidoAtivo.status)}`}>
                  {getStatusLabel(pedidoAtivo.status)}
                </span>
              </div>
              <div className="active-order-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: pedidoAtivo.status === 'saiu_entrega' ? '75%' : '50%' }}
                  />
                </div>
                <p className="active-order-eta">Previsão: {pedidoAtivo.estimativaEntrega}</p>
              </div>
            </div>
          </section>
        )}

        {/* Categorias */}
        <section className="container animate-fade-in-up delay-2">
          <div className="section-header">
            <h2 className="section-title">Categorias</h2>
          </div>
          <div className="categories-scroll">
            {categoriasMock.map(cat => (
              <button
                key={cat.id}
                className="category-chip"
                onClick={() => navigate(`/cliente/mercados?categoria=${cat.nome}`)}
                id={`cat-${cat.id}`}
              >
                <span className="category-emoji">{cat.emoji}</span>
                <span className="category-name">{cat.nome}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Mercados Próximos */}
        <section className="container animate-fade-in-up delay-3">
          <div className="section-header">
            <h2 className="section-title">Perto de você</h2>
            <button className="section-link" onClick={() => navigate('/cliente/mercados')}>
              Ver todos →
            </button>
          </div>
          <div className="stores-scroll">
            {comerciosMock.filter(c => c.aberto).slice(0, 4).map(store => (
              <div
                key={store.id}
                className="store-card card"
                onClick={() => navigate(`/cliente/mercado/${store.id}`)}
                id={`store-${store.id}`}
              >
                <div className="store-card-logo">{store.logo}</div>
                <div className="store-card-body">
                  <h3 className="store-card-name">{store.nome}</h3>
                  <div className="store-card-meta">
                    <span className="store-rating">⭐ {store.avaliacao}</span>
                    <span className="store-dot">•</span>
                    <span>{store.distancia}</span>
                  </div>
                  <div className="store-card-delivery">
                    <span>🕐 {store.tempoEntrega}</span>
                    <span className="store-dot">•</span>
                    <span>{store.taxaEntrega === 0 ? '🟢 Grátis' : formatPrice(store.taxaEntrega)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Promoções */}
        {promoItems.length > 0 && (
          <section className="container animate-fade-in-up delay-4">
            <div className="section-header">
              <h2 className="section-title">🔥 Ofertas</h2>
              <button className="section-link" onClick={() => navigate('/cliente/mercados')}>
                Ver mais →
              </button>
            </div>
            <div className="promo-scroll">
              {promoItems.map(item => (
                <div
                  key={item.id}
                  className="promo-card"
                  onClick={() => navigate(`/cliente/produto/${item.id}`)}
                  id={`promo-${item.id}`}
                >
                  <div className="promo-card-image">
                    <span className="promo-card-emoji">
                      {item.categoriaNome === 'Alimentos' ? '🍚' :
                       item.categoriaNome === 'Laticínios' ? '🥛' :
                       item.categoriaNome === 'Hortifruti' ? '🍌' :
                       item.categoriaNome === 'Combos' ? '🍔' : '📦'}
                    </span>
                    {item.promocaoNome && (
                      <span className="promo-badge">{item.promocaoNome}</span>
                    )}
                  </div>
                  <div className="promo-card-info">
                    <p className="promo-card-name truncate">{item.nome}</p>
                    <div className="promo-card-prices">
                      {item.precoOriginal && (
                        <span className="promo-old-price">{formatPrice(item.precoOriginal)}</span>
                      )}
                      <span className="promo-new-price">{formatPrice(item.preco)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mais Populares */}
        <section className="container animate-fade-in-up delay-5">
          <div className="section-header">
            <h2 className="section-title">⭐ Mais populares</h2>
          </div>
          <div className="popular-grid">
            {popularItems.map(item => {
              const emoji = item.categoriaNome === 'Lanches' ? '🍔' :
                           item.categoriaNome === 'Pães' ? '🍞' :
                           item.categoriaNome === 'Bebidas' ? '🥤' :
                           item.categoriaNome === 'Alimentos' ? '🍚' :
                           item.categoriaNome === 'Acompanhamentos' ? '🍟' : '📦';
              return (
                <div
                  key={item.id}
                  className="popular-item card"
                  onClick={() => navigate(`/cliente/produto/${item.id}`)}
                  id={`popular-${item.id}`}
                >
                  <div className="popular-item-img">{emoji}</div>
                  <div className="card-body">
                    <p className="popular-item-name truncate">{item.nome}</p>
                    <p className="popular-item-store text-sm text-secondary">
                      {comerciosMock.find(c => c.id === item.comercioId)?.nome}
                    </p>
                    <div className="popular-item-bottom">
                      <span className="popular-item-price">{formatPrice(item.preco)}</span>
                      <span className="popular-item-rating">⭐ {item.avaliacao}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
