import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { formatPrice, getHorarioHoje } from '../../lib/utils';
import { api } from '../../lib/api';
import './MercadosPage.css';

export default function MercadosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [realComercios, setRealComercios] = useState<any[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState(searchParams.get('categoria') || '');
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [ordenar, setOrdenar] = useState<'avaliacao' | 'distancia' | 'entrega'>('avaliacao');
  const [categorias, setCategorias] = useState<{ id: string; nome: string; icone: string | null }[]>([]);
  const [filtroCidade, setFiltroCidade] = useState(
    searchParams.get('cidade') || localStorage.getItem('@MarketSystem:filtroCidade') || ''
  );
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showGeoFilter, setShowGeoFilter] = useState(false);

  useEffect(() => {
    fetchComercios();
    api.get('categorias/public')
      .then((res: any) => setCategorias(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategorias([]));
  }, [filtroCidade, filtroEstado]);

  const fetchComercios = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filtroCidade.trim()) params.cidade = filtroCidade.trim();
      if (filtroEstado.trim()) params.estado = filtroEstado.trim();
      const query = new URLSearchParams(params).toString();
      const { data } = await api.get(`comercios/public${query ? '?' + query : ''}`);
      setRealComercios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
      setRealComercios([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = useMemo(() => {
    let result = realComercios.map(c => ({
      ...c,
      nome: c.nomeFantasia,
      logo: c.logoUrl ? <img src={c.logoUrl} alt={c.nomeFantasia} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏪',
      aberto: c.isOpen,
      tempoEntrega: c.tempoMedio || '?? min',
      categorias: c.categorias ? c.categorias.map((cat:any) => cat.nome) : [],
      distancia: '2.5 km', // Placeholder, future integration
      avaliacao: 4.8      // Placeholder, future integration
    }));

    if (search) {
      result = result.filter(s =>
        s.nome.toLowerCase().includes(search.toLowerCase()) ||
        s.segmento.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filtroCategoria) {
      result = result.filter(s => {
        const seg = s.segmento ? s.segmento.toLowerCase() : '';
        const searchCat = filtroCategoria.toLowerCase();
        
        return seg.includes(searchCat) || 
               (s.categorias && s.categorias.some((cat: string) => cat.toLowerCase().includes(searchCat)));
      });
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
      <TopBar showBack showCart />

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
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-chip ${filtroCategoria === cat.nome ? 'active' : ''}`}
                  onClick={() => setFiltroCategoria(filtroCategoria === cat.nome ? '' : cat.nome)}
                >
                  {cat.icone || '📦'} {cat.nome}
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

              <button
                className={`filter-toggle ${showGeoFilter ? 'active' : ''}`}
                onClick={() => setShowGeoFilter(v => !v)}
              >
                📍 Localização
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

            {showGeoFilter && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Cidade"
                  value={filtroCidade}
                  onChange={e => {
                    setFiltroCidade(e.target.value);
                    if (e.target.value) localStorage.setItem('@MarketSystem:filtroCidade', e.target.value);
                  }}
                  style={{ flex: 1, minWidth: 140 }}
                  id="filtro-cidade"
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Estado (ex: SP)"
                  value={filtroEstado}
                  onChange={e => setFiltroEstado(e.target.value)}
                  style={{ flex: 1, minWidth: 100 }}
                  id="filtro-estado"
                />
                {(filtroCidade || filtroEstado) && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setFiltroCidade(''); setFiltroEstado(''); }}
                  >
                    ✕ Limpar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          <p className="results-count animate-fade-in-up delay-2">
            {filteredStores.length} {filteredStores.length === 1 ? 'resultado' : 'resultados'}
          </p>

          <div className="stores-list animate-fade-in-up delay-2">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', width: '100%' }}>
                <span className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '3rem', height: '3rem', borderWidth: '4px' }} />
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Carregando lojas...</p>
              </div>
            ) : filteredStores.map(store => (
              <div
                key={store.id}
                className={`store-list-card ${!store.aberto ? 'closed' : ''}`}
                onClick={() => store.aberto && navigate(`/mercado/${store.id}`)}
                id={`mercado-${store.id}`}
                style={{
                  filter: store.aberto ? 'none' : 'grayscale(100%) opacity(0.7)',
                  cursor: store.aberto ? 'pointer' : 'not-allowed',
                  position: 'relative',
                  padding: 0,
                  overflow: 'hidden',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }}
              >
                {/* Capa (banner fino) */}
                {store.capaUrl && (
                  <div style={{
                    height: 60,
                    background: `url(${store.capaUrl}) center/cover no-repeat`,
                    flexShrink: 0,
                  }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', flex: 1 }}>
                {!store.aberto && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.4)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '0.8rem 1.5rem', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.2rem' }}>😴</span>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Loja Fechada</strong>
                      {store.horarioAtendimento && (
                         <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block', maxWidth: '200px' }}>
                           {getHorarioHoje(store.horarioAtendimento) || ''}
                         </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="store-list-logo" style={{
                  background: store.logoUrl
                    ? `url(${store.logoUrl}) center/cover no-repeat`
                    : 'var(--color-surface)',
                  fontSize: store.logoUrl ? 0 : '2.2rem',
                }}>
                  {!store.logoUrl && '🏪'}
                </div>
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
                    {store.categorias.map((cat: string) => (
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
                </div>{/* fim flex-row interno */}
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
