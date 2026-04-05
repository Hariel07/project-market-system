import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { categoriasMock, formatPrice } from '../../data/mockData';
import { api } from '../../lib/api';
import './ClienteDashboard.css';

interface ComercioAPI {
  id: string;
  nomeFantasia: string;
  segmento: string;
  logoUrl?: string;
  taxaEntrega: number;
  tempoMedio?: string;
  isOpen: boolean;
}

export default function ClienteDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [comercios, setComercios] = useState<ComercioAPI[]>([]);

  useEffect(() => {
    api.get('comercios/public')
      .then((res: any) => setComercios(Array.isArray(res.data) ? res.data : []))
      .catch(() => setComercios([]));
  }, []);

  const abertos = comercios.filter(c => c.isOpen).slice(0, 4);

  return (
    <div className="cliente-dashboard">
      <TopBar showSearch showCart onSearch={setSearchTerm} />

      <main className="page-content">
        {/* Hero */}
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

        {/* Mercados Abertos */}
        <section className="container animate-fade-in-up delay-3">
          <div className="section-header">
            <h2 className="section-title">Perto de você</h2>
            <button className="section-link" onClick={() => navigate('/cliente/mercados')}>
              Ver todos →
            </button>
          </div>
          <div className="stores-scroll">
            {abertos.map(store => (
              <div
                key={store.id}
                className="store-card card"
                onClick={() => navigate(`/cliente/mercado/${store.id}`)}
                id={`store-${store.id}`}
              >
                <div className="store-card-logo">
                  {store.logoUrl && store.logoUrl.length <= 4
                    ? store.logoUrl
                    : store.logoUrl
                      ? <img src={store.logoUrl} alt={store.nomeFantasia} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🏪'}
                </div>
                <div className="store-card-body">
                  <h3 className="store-card-name">{store.nomeFantasia}</h3>
                  <div className="store-card-meta">
                    <span>{store.segmento}</span>
                  </div>
                  <div className="store-card-delivery">
                    <span>🕐 {store.tempoMedio || '??-?? min'}</span>
                    <span className="store-dot">•</span>
                    <span>{store.taxaEntrega === 0 ? '🟢 Grátis' : formatPrice(store.taxaEntrega)}</span>
                  </div>
                </div>
              </div>
            ))}
            {abertos.length === 0 && (
              <p className="text-secondary" style={{ padding: '1rem' }}>Nenhum comércio aberto no momento.</p>
            )}
          </div>
        </section>

        {/* Todos os comércios (scroll) */}
        {comercios.length > 4 && (
          <section className="container animate-fade-in-up delay-4">
            <div className="section-header">
              <h2 className="section-title">Todos os comércios</h2>
              <button className="section-link" onClick={() => navigate('/cliente/mercados')}>
                Ver todos →
              </button>
            </div>
            <div className="stores-scroll">
              {comercios.slice(4).map(store => (
                <div
                  key={store.id}
                  className={`store-card card ${!store.isOpen ? 'store-closed' : ''}`}
                  onClick={() => navigate(`/cliente/mercado/${store.id}`)}
                  id={`store-extra-${store.id}`}
                >
                  <div className="store-card-logo">
                    {store.logoUrl && store.logoUrl.length <= 4 ? store.logoUrl : '🏪'}
                  </div>
                  <div className="store-card-body">
                    <h3 className="store-card-name">{store.nomeFantasia}</h3>
                    <div className="store-card-meta">
                      <span className={store.isOpen ? 'text-success' : 'text-danger'}>
                        {store.isOpen ? '● Aberto' : '● Fechado'}
                      </span>
                    </div>
                    <div className="store-card-delivery">
                      <span>🕐 {store.tempoMedio || '??-?? min'}</span>
                      <span className="store-dot">•</span>
                      <span>{store.taxaEntrega === 0 ? '🟢 Grátis' : formatPrice(store.taxaEntrega)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
