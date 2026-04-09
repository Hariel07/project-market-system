import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { useCart } from '../../contexts/CartContext';
import { itensMock, comerciosMock, formatPrice } from '../../data/mockData';
import './ProdutoPage.css';

export default function ProdutoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantidade, setQuantidade] = useState(1);
  const [added, setAdded] = useState(false);

  const item = itensMock.find(i => i.id === Number(id));
  const comercio = item ? comerciosMock.find(c => c.id === item.comercioId) : null;

  if (!item || !comercio) {
    return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Produto não encontrado</div>;
  }

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

  const handleAdd = () => {
    addItem(item, quantidade);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="produto-page">
      <TopBar showBack showCart />

      <main className="page-content">
        {/* Image */}
        <div className="produto-image-section animate-fade-in">
          <div className="produto-image-bg">
            <span className="produto-image-emoji">{emoji}</span>
          </div>
          {item.emPromocao && item.promocaoNome && (
            <span className="produto-promo-tag">🔥 {item.promocaoNome}</span>
          )}
        </div>

        <div className="container">
          <div className="produto-content animate-fade-in-up delay-1">
            {/* Header */}
            <div className="produto-header">
              <div className="produto-category-badge badge badge-primary">
                {item.categoriaNome}
              </div>
              {item.tipo !== 'simples' && (
                <span className="badge badge-info">{item.tipo}</span>
              )}
            </div>

            <h1 className="produto-name" id="produto-nome">{item.nome}</h1>

            <div className="produto-rating">
              <span className="produto-stars">
                {'⭐'.repeat(Math.round(item.avaliacao))}
              </span>
              <span className="produto-rating-text">
                {item.avaliacao} ({item.avaliacoes} avaliações)
              </span>
            </div>

            {/* Price */}
            <div className="produto-price-section">
              {item.precoOriginal && (
                <span className="produto-original-price">{formatPrice(item.precoOriginal)}</span>
              )}
              <span className="produto-current-price">{formatPrice(item.preco)}</span>
              <span className="produto-unit">/{item.unidadeMedida}</span>
              {item.precoOriginal && (
                <span className="produto-discount-badge">
                  -{Math.round(((item.precoOriginal - item.preco) / item.precoOriginal) * 100)}%
                </span>
              )}
            </div>

            {/* Store info */}
            <div
              className="produto-store-info"
              onClick={() => navigate(`/mercado/${comercio.id}`)}
            >
              <span className="produto-store-logo">{comercio.logo}</span>
              <div>
                <p className="produto-store-name">{comercio.nome}</p>
                <p className="produto-store-delivery">
                  🕐 {comercio.tempoEntrega} •{' '}
                  {comercio.taxaEntrega === 0 ? '🟢 Entrega grátis' : `Entrega ${formatPrice(comercio.taxaEntrega)}`}
                </p>
              </div>
              <span className="produto-store-arrow">→</span>
            </div>

            {/* Description */}
            <div className="produto-description">
              <h2 className="produto-section-title">Descrição</h2>
              <p className="produto-desc-text">{item.descricao}</p>
            </div>

            {/* Details */}
            <div className="produto-details">
              <h2 className="produto-section-title">Detalhes</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Unidade</span>
                  <span className="detail-value">{item.unidadeMedida}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipo</span>
                  <span className="detail-value" style={{ textTransform: 'capitalize' }}>{item.tipo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Categoria</span>
                  <span className="detail-value">{item.categoriaNome}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estoque</span>
                  <span className="detail-value" style={{ color: item.estoque > 10 ? 'var(--color-accent)' : 'var(--color-warning)' }}>
                    {item.estoque > 100 ? 'Disponível' : `${item.estoque} un`}
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
                id="btn-add-to-cart"
              >
                {added ? '✓ Adicionado!' : `Adicionar ${formatPrice(item.preco * quantidade)}`}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
