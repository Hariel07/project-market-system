import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../lib/utils';
import type { Item } from '../../data/mockData';
import { api } from '../../lib/api';
import './MercadoDetalhePage.css';

const DAY_LABELS: Record<string, string> = {
  seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb', dom: 'Dom',
};
const DAY_ORDER = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

function HorarioInfo({ json }: { json: string }) {
  let schedule: Record<string, any> = {};
  try { schedule = JSON.parse(json); } catch { return null; }

  const today = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][new Date().getDay()];

  return (
    <div className="store-schedule">
      <h4 className="store-schedule-title">🕐 Horários de Atendimento</h4>
      <div className="store-schedule-grid">
        {DAY_ORDER.map(key => {
          const day = schedule[key];
          const isToday = key === today;
          return (
            <div key={key} className={`schedule-row ${isToday ? 'today' : ''} ${!day?.ativo ? 'closed-day' : ''}`}>
              <span className="schedule-day">{DAY_LABELS[key]}</span>
              <span className="schedule-hours">
                {day?.ativo ? `${day.abre} – ${day.fecha}` : 'Fechado'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MercadoDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  const [comercio, setComercio] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchTudo() {
      try {
        // Fetch full merchant detail (includes categorias + produtos)
        const [resComercio, resProdutos] = await Promise.all([
          api.get(`comercios/${id}`),
          api.get(`/comercios/${id}/produtos`),
        ]);

        const c = resComercio.data;
        setComercio({
          ...c,
          nome: c.nomeFantasia,
          tempoEntrega: c.tempoMedio || '?? min',
        });

        const produtosData = Array.isArray(resProdutos.data) ? resProdutos.data : [];
        const produtosAPI: Item[] = produtosData.map((p: any) => ({
          id: p.id,
          comercioId: p.comercioId,
          nome: p.nome,
          descricao: p.descricao ?? '',
          tipo: 'simples' as const,
          categoriaId: p.categoriaId ?? '',
          categoriaNome: p.categoria?.nome ?? 'Geral',
          preco: p.precoPromocional ?? p.precoVenda,
          precoOriginal: p.precoPromocional ? p.precoVenda : undefined,
          imagem: p.imagemUrl ?? '',
          unidadeMedida: p.unidade ?? 'UN',
          avaliacao: 4.8,
          avaliacoes: 0,
          emPromocao: !!p.precoPromocional,
          estoque: p.estoque ?? 0,
        }));

        setItems(produtosAPI);
      } catch (e) {
        console.error('Erro ao carregar dados do comércio:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchTudo();
  }, [id]);

  const categorias = useMemo(() => [...new Set(items.map(i => i.categoriaNome))], [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (search) result = result.filter(i => i.nome.toLowerCase().includes(search.toLowerCase()));
    if (selectedCat) result = result.filter(i => i.categoriaNome === selectedCat);
    return result;
  }, [items, search, selectedCat]);

  if (loading) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Carregando dados do mercado...</div>;

  if (!comercio) {
    return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Mercado não encontrado no sistema</div>;
  }

  return (
    <div className="mercado-detalhe">
      <TopBar showBack showCart title={comercio.nome} />

      <main className="page-content">
        {/* Capa / Banner */}
        <div className="store-capa-wrapper">
          <div
            className="store-capa"
            style={{
              background: comercio.capaUrl
                ? `url(${comercio.capaUrl}) center/cover no-repeat`
                : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            }}
          >
            <span style={{
              position: 'absolute', top: 12, right: 12,
              background: comercio.isOpen ? 'rgba(22,163,74,0.9)' : 'rgba(220,38,38,0.85)',
              color: '#fff', borderRadius: 20, padding: '3px 12px',
              fontSize: '0.78rem', fontWeight: 700,
            }}>
              {comercio.isOpen ? '🟢 Aberto' : '🔴 Fechado'}
            </span>
          </div>
        </div>

        {/* Store Header */}
        <section className="store-hero animate-fade-in-up">
          <div className="container">
            {/* Logo */}
            <div className="store-hero-logo" style={{
              marginTop: -16,
              border: 'none',
              background: comercio.logoUrl ? 'transparent' : 'var(--color-surface)',
              overflow: 'hidden',
              boxShadow: 'none',
            }}>
              {comercio.logoUrl
                ? <img src={comercio.logoUrl} alt={comercio.nome} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span style={{ fontSize: '3rem' }}>🏪</span>
              }
            </div>

            <div className="store-hero-info" style={{ marginTop: '0.75rem' }}>
              <h1 className="store-hero-name">{comercio.nome}</h1>
              <p className="store-hero-segment">{comercio.segmento}</p>

              <div className="store-hero-stats">
                <span>🕐 {comercio.tempoEntrega}</span>
                <span className="store-dot">•</span>
                <span>
                  {comercio.taxaEntrega === 0
                    ? <span style={{ color: '#16a34a', fontWeight: 700 }}>Entrega grátis</span>
                    : `Entrega: ${formatPrice(comercio.taxaEntrega)}`}
                </span>
                {comercio.cidade && (
                  <>
                    <span className="store-dot">•</span>
                    <span>📍 {comercio.cidade}</span>
                  </>
                )}
              </div>

              {/* Descrição */}
              {comercio.descricao && (
                <p style={{
                  marginTop: '0.6rem', fontSize: '0.88rem',
                  color: 'var(--color-text-secondary)', lineHeight: 1.5,
                }}>
                  {comercio.descricao}
                </p>
              )}
            </div>

            {/* Horários */}
            {comercio.horarioAtendimento && (
              <HorarioInfo json={comercio.horarioAtendimento} />
            )}
          </div>
        </section>

        <div className="container">
          {/* Search */}
          <div className="product-search animate-fade-in-up delay-1">
            <span className="search-bar-icon">🔍</span>
            <input
              type="text"
              placeholder={`Buscar em ${comercio.nome}...`}
              className="input search-bar-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="search-products"
            />
          </div>

          {/* Category Tabs */}
          <div className="cat-tabs animate-fade-in-up delay-2">
            <button
              className={`cat-tab ${!selectedCat ? 'active' : ''}`}
              onClick={() => setSelectedCat('')}
            >
              Todos
            </button>
            {categorias.map(cat => (
              <button
                key={cat}
                className={`cat-tab ${selectedCat === cat ? 'active' : ''}`}
                onClick={() => setSelectedCat(selectedCat === cat ? '' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="products-list animate-fade-in-up delay-3">
            {filteredItems.map(item => {
              const emoji = item.categoriaNome === 'Alimentos' ? '🍚' :
                           item.categoriaNome === 'Laticínios' ? '🥛' :
                           item.categoriaNome === 'Bebidas' ? '🥤' :
                           item.categoriaNome === 'Limpeza' ? '🧹' :
                           item.categoriaNome === 'Hortifruti' ? '🍌' :
                           item.categoriaNome === 'Lanches' ? '🍔' :
                           item.categoriaNome === 'Combos' ? '🍔🍟' :
                           item.categoriaNome === 'Acompanhamentos' ? '🍟' :
                           item.categoriaNome === 'Pães' ? '🍞' :
                           item.categoriaNome === 'Bolos' ? '🎂' : '📦';
              return (
                <div
                  key={item.id}
                  className="product-card"
                  id={`product-${item.id}`}
                >
                  <div
                    className="product-card-main"
                    onClick={() => navigate(`/produto/${item.id}`)}
                  >
                    <div className="product-card-img">
                      {item.imagem
                        ? <img src={item.imagem} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        : <span className="product-emoji">{emoji}</span>
                      }
                      {item.emPromocao && (
                        <span className="product-promo-badge">
                          {item.promocaoNome || 'Oferta'}
                        </span>
                      )}
                    </div>
                    <div className="product-card-info">
                      <h3 className="product-card-name">{item.nome}</h3>
                      <p className="product-card-desc truncate">{item.descricao}</p>
                    </div>
                  </div>
                  <div className="product-card-action">
                    <div className="product-card-prices">
                      {item.precoOriginal && (
                        <span className="product-old-price">{formatPrice(item.precoOriginal)}</span>
                      )}
                      <span className="product-price">{formatPrice(item.preco)}</span>
                      <span className="product-unit">/{item.unidadeMedida}</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm add-btn"
                      onClick={(e) => { e.stopPropagation(); addItem(item); }}
                      id={`add-${item.id}`}
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>Nenhum produto encontrado</h3>
              <p>Tente buscar por outro nome.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
