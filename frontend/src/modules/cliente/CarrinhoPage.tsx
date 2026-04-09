import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../data/mockData';
import './CarrinhoPage.css';

export default function CarrinhoPage() {
  const navigate = useNavigate();
  const { items, updateQuantidade, removeItem, subtotal, clearCart } = useCart();

  const taxaEntrega = 5.99;
  const total = subtotal + taxaEntrega;

  if (items.length === 0) {
    return (
      <div className="carrinho-page">
        <TopBar title="Carrinho" showBack showCart={false} />
        <main className="page-content">
          <div className="container">
            <div className="empty-cart animate-fade-in-up">
              <span className="empty-cart-icon">🛒</span>
              <h2>Seu carrinho está vazio</h2>
              <p>Adicione itens de um mercado para começar</p>
              <button
                className="btn btn-primary btn-lg mt-6"
                onClick={() => navigate('/mercados')}
              >
                Explorar mercados
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="carrinho-page">
      <TopBar title="Carrinho" showBack showCart={false} />

      <main className="page-content">
        <div className="container">
          {/* Header */}
          <div className="cart-header animate-fade-in-up">
            <p className="cart-count">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
            <button className="btn btn-ghost text-danger text-sm" onClick={clearCart} id="btn-clear-cart">
              Limpar
            </button>
          </div>

          {/* Items */}
          <div className="cart-items animate-fade-in-up delay-1">
            {items.map(({ item, quantidade }) => {
              const emoji = item.categoriaNome === 'Alimentos' ? '🍚' :
                           item.categoriaNome === 'Laticínios' ? '🥛' :
                           item.categoriaNome === 'Bebidas' ? '🥤' :
                           item.categoriaNome === 'Lanches' ? '🍔' :
                           item.categoriaNome === 'Acompanhamentos' ? '🍟' :
                           item.categoriaNome === 'Pães' ? '🍞' :
                           item.categoriaNome === 'Bolos' ? '🎂' : '📦';
              return (
                <div key={item.id} className="cart-item" id={`cart-item-${item.id}`}>
                  <div className="cart-item-img">{emoji}</div>
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.nome}</h3>
                    <p className="cart-item-price">{formatPrice(item.preco)}/{item.unidadeMedida}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-qty">
                      <button className="cart-qty-btn" onClick={() => updateQuantidade(item.id, quantidade - 1)}>−</button>
                      <span className="cart-qty-val">{quantidade}</span>
                      <button className="cart-qty-btn" onClick={() => updateQuantidade(item.id, quantidade + 1)}>+</button>
                    </div>
                    <p className="cart-item-total">{formatPrice(item.preco * quantidade)}</p>
                    <button className="cart-remove-btn" onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon */}
          <div className="cart-coupon animate-fade-in-up delay-2">
            <input type="text" placeholder="Cupom de desconto" className="input coupon-input" id="coupon-input" />
            <button className="btn btn-outline btn-sm">Aplicar</button>
          </div>

          {/* Summary */}
          <div className="cart-summary animate-fade-in-up delay-3">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Taxa de entrega</span>
              <span>{formatPrice(taxaEntrega)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Checkout bar */}
        <div className="checkout-bar animate-fade-in-up delay-4">
          <div className="container">
            <div className="checkout-bar-inner">
              <div className="checkout-total">
                <span className="checkout-total-label">Total</span>
                <span className="checkout-total-value">{formatPrice(total)}</span>
              </div>
              <button
                className="btn btn-primary btn-lg flex-1"
                onClick={() => {
                  if (localStorage.getItem('@MarketSystem:token')) {
                    navigate('/checkout');
                  } else {
                    navigate('/login?redirect=/checkout');
                  }
                }}
                id="btn-checkout"
              >
                Finalizar pedido
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
