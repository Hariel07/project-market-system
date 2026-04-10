import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { formatPrice, haversineDistance, formatDistance, getHorarioHoje } from '../../lib/utils';
import { useGeolocation } from '../../lib/useGeolocation';
import { api } from '../../lib/api';
import './ClienteDashboard.css';

interface ComercioAPI {
  id: string;
  nomeFantasia: string;
  segmento: string;
  logoUrl?: string;
  capaUrl?: string;
  taxaEntrega: number;
  tempoMedio?: string;
  isOpen: boolean;
  lat?: number;
  lng?: number;
  descricao?: string;
  cidade?: string;
  horarioAtendimento?: string;
}

interface CategoriaAPI {
  id: string;
  nome: string;
  icone: string | null;
}

export default function ClienteDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [comercios, setComercios] = useState<ComercioAPI[]>([]);
  const [categorias, setCategorias] = useState<CategoriaAPI[]>([]);
  const [filtroCidade, setFiltroCidadeRaw] = useState(() =>
    localStorage.getItem('@MarketSystem:filtroCidade') || ''
  );
  const [editandoCidade, setEditandoCidade] = useState(false);
  const [cidadeInput, setCidadeInput] = useState(() =>
    localStorage.getItem('@MarketSystem:filtroCidade') || ''
  );
  const [detectando, setDetectando] = useState(false);
  const userPos = useGeolocation();

  // Wrapper: persist whenever city changes
  const setFiltroCidade = (cidade: string) => {
    setFiltroCidadeRaw(cidade);
    if (cidade) localStorage.setItem('@MarketSystem:filtroCidade', cidade);
  };

  // Auto-detect city from GPS via Nominatim (only if no city stored)
  useEffect(() => {
    if (!userPos || filtroCidade) return;
    setDetectando(true);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userPos.lat}&lon=${userPos.lng}&accept-language=pt`)
      .then(r => r.json())
      .then(data => {
        const cidade = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || '';
        if (cidade) {
          setFiltroCidade(cidade);
          setCidadeInput(cidade);
        }
      })
      .catch(() => {})
      .finally(() => setDetectando(false));
  }, [userPos]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filtroCidade.trim()) params.cidade = filtroCidade.trim();
    const query = new URLSearchParams(params).toString();
    api.get(`comercios/public${query ? '?' + query : ''}`)
      .then((res: any) => setComercios(Array.isArray(res.data) ? res.data : []))
      .catch(() => setComercios([]));
    api.get('categorias/public')
      .then((res: any) => setCategorias(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategorias([]));
  }, [filtroCidade]);

  // Enrich with distance and sort by proximity
  const comerciosComDistancia = useMemo(() => {
    let result = comercios.map(c => {
      const dist = (userPos && c.lat && c.lng)
        ? haversineDistance(userPos.lat, userPos.lng, c.lat, c.lng)
        : null;
      return { ...c, distancia: dist };
    }).sort((a, b) => {
      if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
      if (a.distancia !== null && b.distancia !== null) return a.distancia - b.distancia;
      return 0;
    });

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.nomeFantasia.toLowerCase().includes(q) || (c.segmento || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [comercios, userPos, searchTerm]);

  const abertos = comerciosComDistancia.filter(c => c.isOpen).slice(0, 6);
  const fechados = comerciosComDistancia.filter(c => !c.isOpen);

  const handleCidadeConfirm = () => {
    setFiltroCidade(cidadeInput.trim());
    setEditandoCidade(false);
  };

  function StoreCard({ store }: { store: typeof comerciosComDistancia[0] }) {
    const horarioHoje = store.horarioAtendimento ? getHorarioHoje(store.horarioAtendimento) : '';
    return (
      <div
        className={`store-card card ${!store.isOpen ? 'store-closed' : ''}`}
        onClick={() => navigate(`/mercado/${store.id}`)}
        style={{ padding: 0, overflow: 'hidden', cursor: store.isOpen ? 'pointer' : 'not-allowed' }}
      >
        {/* Banner / Capa */}
        <div className="store-card-banner" style={{
          height: 90,
          background: store.capaUrl
            ? `url(${store.capaUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          position: 'relative',
          flexShrink: 0,
        }}>
          {!store.isOpen && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.7rem', borderRadius: 20 }}>😴 Fechado</span>
            </div>
          )}
          {/* Logo badge sobre o banner */}
          <div style={{
            position: 'absolute', bottom: -20, left: 12,
            width: 44, height: 44, borderRadius: '50%',
            background: store.logoUrl ? `url(${store.logoUrl}) center/cover` : '#fff',
            border: '3px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem',
          }}>
            {!store.logoUrl && '🏪'}
          </div>
        </div>

        {/* Body */}
        <div className="store-card-body" style={{ paddingTop: '1.4rem' }}>
          <h3 className="store-card-name">{store.nomeFantasia}</h3>
          <div className="store-card-meta">
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>{store.segmento}</span>
            {store.distancia !== null && (
              <span className="store-card-dist">📍 {formatDistance(store.distancia)}</span>
            )}
          </div>
          {horarioHoje && (
            <p style={{ fontSize: '0.72rem', color: store.isOpen ? '#16a34a' : '#dc2626', margin: '0.1rem 0 0.2rem', fontWeight: 600 }}>
              🕐 {horarioHoje}
            </p>
          )}
          <div className="store-card-delivery">
            <span>⏱ {store.tempoMedio || '??-?? min'}</span>
            <span className="store-dot">•</span>
            <span style={{ fontWeight: 700, color: store.taxaEntrega === 0 ? '#16a34a' : 'inherit' }}>
              {store.taxaEntrega === 0 ? 'Grátis' : formatPrice(store.taxaEntrega)}
            </span>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Cidade Filter */}
        <section className="container animate-fade-in-up delay-1" style={{ marginBottom: '0.5rem' }}>
          {editandoCidade ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className="input"
                placeholder="Digite sua cidade..."
                value={cidadeInput}
                onChange={e => setCidadeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCidadeConfirm()}
                autoFocus
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleCidadeConfirm}>Ok</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditandoCidade(false); setCidadeInput(filtroCidade); }}>✕</button>
            </div>
          ) : filtroCidade ? (
            <button
              onClick={() => { setEditandoCidade(true); setCidadeInput(filtroCidade); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
            >
              📍 {detectando ? 'Detectando...' : filtroCidade}
              <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>✎</span>
            </button>
          ) : (
            <button
              onClick={() => { setEditandoCidade(true); setCidadeInput(''); }}
              style={{
                background: 'rgba(239,68,68,0.08)', border: '1.5px dashed #f87171',
                borderRadius: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.9rem', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              📍 {detectando ? 'Detectando localização...' : 'Definir sua cidade para ver lojas próximas'}
            </button>
          )}
        </section>

        {/* Categorias */}
        <section className="container animate-fade-in-up delay-2">
          <div className="section-header">
            <h2 className="section-title">Categorias</h2>
          </div>
          <div className="categories-scroll">
            {categorias.map(cat => (
              <button
                key={cat.id}
                className="category-chip"
                onClick={() => navigate(`/mercados?categoria=${cat.nome}`)}
              >
                <span className="category-emoji">{cat.icone || '📦'}</span>
                <span className="category-name">{cat.nome}</span>
              </button>
            ))}
            {categorias.length === 0 && (
              <p className="text-secondary" style={{ padding: '0.5rem 1rem' }}>Nenhuma categoria cadastrada.</p>
            )}
          </div>
        </section>

        {/* Mercados Abertos */}
        <section className="container animate-fade-in-up delay-3">
          <div className="section-header">
            <h2 className="section-title">{filtroCidade ? `Em ${filtroCidade}` : 'Perto de você'}</h2>
            <button className="section-link" onClick={() => navigate(filtroCidade ? `/mercados?cidade=${filtroCidade}` : '/mercados')}>
              Ver todos →
            </button>
          </div>
          <div className="stores-scroll">
            {abertos.map(store => <StoreCard key={store.id} store={store} />)}
            {abertos.length === 0 && (
              <p className="text-secondary" style={{ padding: '1rem' }}>
                {filtroCidade ? `Nenhum comércio aberto em ${filtroCidade}.` : 'Nenhum comércio aberto no momento.'}
              </p>
            )}
          </div>
        </section>

        {/* Fechados */}
        {fechados.length > 0 && (
          <section className="container animate-fade-in-up delay-4">
            <div className="section-header">
              <h2 className="section-title">Fechados agora</h2>
            </div>
            <div className="stores-scroll">
              {fechados.map(store => <StoreCard key={store.id} store={store} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
