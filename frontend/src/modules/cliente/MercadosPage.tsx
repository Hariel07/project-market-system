import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { comerciosMock, categoriasMock, formatPrice } from '../../data/mockData';
import './MercadosPage.css';

export default function MercadosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState(searchParams.get('categoria') || '');
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [ordenar, setOrdenar] = useState<'avaliacao' | 'distancia' | 'entrega'>('avaliacao');

  const filteredStores = useMemo(() => {
    let result = comerciosMock;

    if (search) {
      result = result.filter(s =>
        s.nome.toLowerCase().includes(search.toLowerCase()) ||
        s.segmento.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filtroCategoria) {
      result = result.filter(s =>
        s.segmento.toLowerCase().includes(filtroCategoria.toLowerCase()) ||
        s.tipo.toLowerCase().includes(filtroCategoria.toLowerCase())
      );
    }

    if (filtroAberto) {
      result = result.filter(s => s.aberto);
    }

    result = [...result].sort((a, b) => {
      if (ordenar === 'avaliacao') return b.avaliacao - a.avaliacao;
      if (ordenar === 'distancia') return parseFloat(a.distancia) - parseFloat(b.distancia);
      return a.taxaEntrega - b.taxaEntrega;
    });

    return result;
  }, [search, filtroCategoria, filtroAberto, ordenar]);

  return (
    <div className="mercados-page">
      <TopBar title="Mercados" showBack showCart />

      <main className="page-content">
        <div className="container">
          {/* Search mobile */}
          <div className="search-bar-mobile animate-fade-in-up">
            <span className="search-bar-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar mercados..."
              className="input search-bar-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="search-mercados"
            />
          </div>

          {/* Filtros */}
          <div className="filters-section animate-fade-in-up delay-1">
            <div className="filters-scroll">
              <button
                className={`filter-chip ${!filtroCategoria ? 'active' : ''}`}
                onClick={() => setFiltroCategoria('')}
              >
                Todos
              </button>
              {categoriasMock.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-chip ${filtroCategoria === cat.nome ? 'active' : ''}`}
                  onClick={() => setFiltroCategoria(filtroCategoria === cat.nome ? '' : cat.nome)}
                >
                  {cat.emoji} {cat.nome}
                </button>
              ))}
            </div>

            <div className="filters-row">
              <button
                className={`filter-toggle ${filtroAberto ? 'active' : ''}`}
                onClick={() => setFiltroAberto(!filtroAberto)}
              >
                🟢 Abertos agora
              </button>

              <select
                className="filter-select"
                value={ordenar}
                onChange={e => setOrdenar(e.target.value as typeof ordenar)}
                id="sort-select"
              >
                <option value="avaliacao">⭐ Melhor avaliação</option>
                <option value="distancia">📍 Mais perto</option>
                <option value="entrega">🚚 Menor taxa</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <p className="results-count animate-fade-in-up delay-2">
            {filteredStores.length} {filteredStores.length === 1 ? 'resultado' : 'resultados'}
          </p>

          <div className="stores-list animate-fade-in-up delay-2">
            {filteredStores.map(store => (
              <div
                key={store.id}
                className={`store-list-card ${!store.aberto ? 'closed' : ''}`}
                onClick={() => store.aberto && navigate(`/cliente/mercado/${store.id}`)}
                id={`mercado-${store.id}`}
              >
                <div className="store-list-logo">{store.logo}</div>
                <div className="store-list-info">
                  <div className="store-list-top">
                    <h3 className="store-list-name">{store.nome}</h3>
                    {!store.aberto && <span className="badge badge-danger">Fechado</span>}
                  </div>
                  <p className="store-list-segment">{store.segmento}</p>
                  <div className="store-list-meta">
                    <span className="store-list-rating">⭐ {store.avaliacao}</span>
                    <span className="store-dot">•</span>
                    <span>📍 {store.distancia}</span>
                    <span className="store-dot">•</span>
                    <span>🕐 {store.tempoEntrega}</span>
                  </div>
                  <div className="store-list-tags">
                    {store.categorias.map(cat => (
                      <span key={cat} className="store-tag">{cat}</span>
                    ))}
                  </div>
                </div>
                <div className="store-list-delivery">
                  <span className={`delivery-price ${store.taxaEntrega === 0 ? 'free' : ''}`}>
                    {store.taxaEntrega === 0 ? 'Grátis' : formatPrice(store.taxaEntrega)}
                  </span>
                  <span className="delivery-label">entrega</span>
                </div>
              </div>
            ))}
          </div>

          {filteredStores.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <h3>Nenhum mercado encontrado</h3>
              <p>Tente ajustar os filtros ou buscar por outro termo.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
