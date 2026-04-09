import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { useCart } from '../../contexts/CartContext';
import { formatPrice, type Item } from '../../data/mockData';
import { api } from '../../lib/api';
import './MercadoDetalhePage.css';

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
        const [resComercio, resProdutos] = await Promise.all([
          api.get('comercios/public'),
          api.get(`/comercios/${id}/produtos`),
        ]);

        const comerciosData = Array.isArray(resComercio.data) ? resComercio.data : [];
        const found = comerciosData.find((c: any) => c.id === id);
        if (found) {
          setComercio({
            ...found,
            nome: found.nomeFantasia,
            tempoEntrega: found.tempoMedio || '?? min',
          });
        }

        // Mapear produtos da API para o formato Item do carrinho
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
        {/* Store Header */}
        <section className="store-hero animate-fade-in-up">
          <div className="container">
            <div className="store-hero-card">
              <div className="store-hero-logo">
                {comercio.logoUrl && comercio.logoUrl.length <= 4
                  ? comercio.logoUrl
                  : comercio.logoUrl
                    ? <img src={comercio.logoUrl} alt={comercio.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🏪'}
              </div>
              <div className="store-hero-info">
                <h1 className="store-hero-name">{comercio.nome}</h1>
                <p className="store-hero-segment">{comercio.segmento}</p>
                <div className="store-hero-stats">
                  <span>⭐ {comercio.avaliacao}</span>
                  <span className="store-dot">•</span>
                  <span>📍 {comercio.distancia}</span>
                  <span className="store-dot">•</span>
                  <span>🕐 {comercio.tempoEntrega}</span>
                </div>
                <div className="store-hero-delivery">
                  {comercio.taxaEntrega === 0 ? (
                    <span className="free-delivery">🟢 Entrega grátis</span>
                  ) : (
                    <span>Entrega: {formatPrice(comercio.taxaEntrega)}</span>
                  )}
                </div>
              </div>
            </div>
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
                      <span className="product-emoji">{emoji}</span>
                      {item.emPromocao && (
                        <span className="product-promo-badge">
                          {item.promocaoNome || 'Oferta'}
                        </span>
                      )}
                    </div>
                    <div className="product-card-info">
                      <h3 className="product-card-name">{item.nome}</h3>
                      <p className="product-card-desc truncate">{item.descricao}</p>
                      <div className="product-card-rating">
                        ⭐ {item.avaliacao} <span className="text-secondary">({item.avaliacoes})</span>
                      </div>
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
