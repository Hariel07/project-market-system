import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { useCart } from '../../contexts/CartContext';
import { api } from '../../lib/api';
import './ProdutoPage.css';

interface Produto {
  id: string;
  comercioId: string;
  nome: string;
  descricao: string | null;
  precoVenda: number;
  precoPromocional: number | null;
  unidade: string;
  imagemUrl: string | null;
  imagens: string[];
  estoque: number;
  isCombo: boolean;
  categoria: { id: string; nome: string; icone: string | null } | null;
  comercio: {
    id: string;
    nomeFantasia: string;
    logoUrl: string | null;
    taxaEntrega: number;
    tempoMedio: string | null;
  };
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function categoryEmoji(nome: string | undefined): string {
  if (!nome) return '📦';
  const n = nome.toLowerCase();
  if (n.includes('alimento') || n.includes('mercearia')) return '🍚';
  if (n.includes('latic') || n.includes('leite')) return '🥛';
  if (n.includes('bebida')) return '🥤';
  if (n.includes('limpeza') || n.includes('higiene')) return '🧹';
  if (n.includes('hortifruti') || n.includes('fruta') || n.includes('verdura')) return '🍌';
  if (n.includes('lanche') || n.includes('snack')) return '🍔';
  if (n.includes('combo')) return '🍔🍟';
  if (n.includes('acompanhamento')) return '🍟';
  if (n.includes('pão') || n.includes('padaria')) return '🍞';
  if (n.includes('bolo') || n.includes('confeit')) return '🎂';
  if (n.includes('carnes') || n.includes('açougue')) return '🥩';
  if (n.includes('congelado')) return '🧊';
  return '📦';
}

export default function ProdutoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantidade, setQuantidade] = useState(1);
  const [added, setAdded] = useState(false);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`produtos/public/${id}`)
      .then(r => { setProduto(r.data); setError(null); })
      .catch(() => setError('Produto não encontrado ou indisponível.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!produto) return;
    const precoAtual = produto.precoPromocional ?? produto.precoVenda;
    addItem({
      id: produto.id,
      comercioId: produto.comercioId,
      nome: produto.nome,
      descricao: produto.descricao || '',
      tipo: produto.isCombo ? 'combo' : 'simples',
      categoriaId: produto.categoria?.id || '',
      categoriaNome: produto.categoria?.nome || '',
      preco: precoAtual,
      precoOriginal: produto.precoPromocional ? produto.precoVenda : undefined,
      imagem: produto.imagemUrl || '',
      unidadeMedida: produto.unidade,
      avaliacao: 0,
      avaliacoes: 0,
      emPromocao: !!produto.precoPromocional,
      estoque: produto.estoque,
    }, quantidade);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="produto-page">
        <TopBar showBack showCart />
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="produto-page">
        <TopBar showBack showCart />
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '3rem' }}>😕</p>
          <p style={{ color: 'var(--color-text-muted)' }}>{error || 'Produto não encontrado.'}</p>
        </div>
      </div>
    );
  }

  const precoAtual = produto.precoPromocional ?? produto.precoVenda;
  const emPromocao = !!produto.precoPromocional && produto.precoPromocional < produto.precoVenda;
  const emoji = categoryEmoji(produto.categoria?.nome);

  // Consolidar todas as imagens disponíveis
  const allImages = [
    ...(produto.imagemUrl ? [produto.imagemUrl] : []),
    ...(produto.imagens || []).filter(u => u !== produto.imagemUrl),
  ];

  return (
    <div className="produto-page">
      <TopBar showBack showCart />

      <main className="page-content">
        {/* Image / Carousel */}
        <div className="produto-image-section animate-fade-in">
          <div className="produto-image-bg">
            {allImages.length > 0
              ? <img src={allImages[imgIndex]} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span className="produto-image-emoji">{emoji}</span>
            }
            {allImages.length > 1 && (
              <>
                <button className="produto-img-nav prev" onClick={() => setImgIndex(i => (i - 1 + allImages.length) % allImages.length)}>‹</button>
                <button className="produto-img-nav next" onClick={() => setImgIndex(i => (i + 1) % allImages.length)}>›</button>
                <div className="produto-img-dots">
                  {allImages.map((_, i) => (
                    <span key={i} className={`produto-img-dot ${i === imgIndex ? 'active' : ''}`} onClick={() => setImgIndex(i)} />
                  ))}
                </div>
              </>
            )}
          </div>
          {emPromocao && (
            <span className="produto-promo-tag">🔥 Promoção</span>
          )}
        </div>

        <div className="container">
          <div className="produto-content animate-fade-in-up delay-1">
            {/* Header */}
            <div className="produto-header">
              {produto.categoria && (
                <div className="produto-category-badge badge badge-primary">
                  {produto.categoria.nome}
                </div>
              )}
              {produto.isCombo && (
                <span className="badge badge-info">combo</span>
              )}
            </div>

            <h1 className="produto-name" id="produto-nome">{produto.nome}</h1>

            {/* Price */}
            <div className="produto-price-section">
              {emPromocao && (
                <span className="produto-original-price">{formatPrice(produto.precoVenda)}</span>
              )}
              <span className="produto-current-price">{formatPrice(precoAtual)}</span>
              <span className="produto-unit">/{produto.unidade}</span>
              {emPromocao && (
                <span className="produto-discount-badge">
                  -{Math.round(((produto.precoVenda - precoAtual) / produto.precoVenda) * 100)}%
                </span>
              )}
            </div>

            {/* Store info */}
            <div
              className="produto-store-info"
              onClick={() => navigate(`/mercado/${produto.comercio.id}`)}
            >
              <span className="produto-store-logo">
                {produto.comercio.logoUrl
                  ? <img src={produto.comercio.logoUrl} alt={produto.comercio.nomeFantasia} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  : '🏪'
                }
              </span>
              <div>
                <p className="produto-store-name">{produto.comercio.nomeFantasia}</p>
                <p className="produto-store-delivery">
                  {produto.comercio.tempoMedio && `🕐 ${produto.comercio.tempoMedio} • `}
                  {produto.comercio.taxaEntrega === 0 ? '🟢 Entrega grátis' : `Entrega ${formatPrice(produto.comercio.taxaEntrega)}`}
                </p>
              </div>
              <span className="produto-store-arrow">→</span>
            </div>

            {/* Description */}
            {produto.descricao && (
              <div className="produto-description">
                <h2 className="produto-section-title">Descrição</h2>
                <p className="produto-desc-text">{produto.descricao}</p>
              </div>
            )}

            {/* Details */}
            <div className="produto-details">
              <h2 className="produto-section-title">Detalhes</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Unidade</span>
                  <span className="detail-value">{produto.unidade}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipo</span>
                  <span className="detail-value">{produto.isCombo ? 'Combo' : 'Simples'}</span>
                </div>
                {produto.categoria && (
                  <div className="detail-item">
                    <span className="detail-label">Categoria</span>
                    <span className="detail-value">{produto.categoria.nome}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Estoque</span>
                  <span className="detail-value" style={{ color: produto.estoque > 10 ? 'var(--color-accent)' : 'var(--color-warning)' }}>
                    {produto.estoque > 100 ? 'Disponível' : `${produto.estoque} un`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add to Cart Bar */}
        <div className="produto-action-bar animate-fade-in-up delay-3">
          <div className="container">
            <div className="action-bar-inner">
              <div className="quantity-control">
                <button
                  className="qty-btn"
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  id="qty-minus"
                >
                  −
                </button>
                <span className="qty-value">{quantidade}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantidade(quantidade + 1)}
                  id="qty-plus"
                >
                  +
                </button>
              </div>

              <button
                className={`btn btn-lg flex-1 ${added ? 'btn-accent' : 'btn-primary'}`}
                onClick={handleAdd}
                disabled={produto.estoque <= 0}
                id="btn-add-to-cart"
              >
                {produto.estoque <= 0
                  ? 'Sem estoque'
                  : added
                    ? '✓ Adicionado!'
                    : `Adicionar ${formatPrice(precoAtual * quantidade)}`}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
