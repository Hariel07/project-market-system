import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../data/mockData';
import './CheckoutPage.css';

const formasPagamento = [
  { id: 'pix', icon: '💠', nome: 'PIX', desc: 'Aprovação instantânea' },
  { id: 'credito', icon: '💳', nome: 'Cartão de Crédito', desc: 'Até 12x sem juros' },
  { id: 'debito', icon: '💳', nome: 'Cartão de Débito', desc: 'Débito na hora' },
  { id: 'dinheiro', icon: '💵', nome: 'Dinheiro', desc: 'Pagar na entrega' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [endereco] = useState('Rua das Flores, 123 - Centro');
  const [processing, setProcessing] = useState(false);

  const taxaEntrega = 5.99;
  const total = subtotal + taxaEntrega;

  useEffect(() => {
    const userStr = localStorage.getItem('@MarketSystem:user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!localStorage.getItem('@MarketSystem:token') || !user) {
      navigate('/login?redirect=/cliente/checkout');
    } else if (user.role !== 'CLIENTE') {
      alert('Apenas clientes podem fazer compras na plataforma. Por favor, ative seu perfil de Cliente!');
      navigate('/cadastro?role=cliente&redirect=/cliente/checkout');
    }
  }, [navigate]);

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      clearCart();
      navigate('/cliente/pedido/1');
    }, 2000);
  };

  if (items.length === 0 && !processing) {
    navigate('/cliente/carrinho');
    return null;
  }

  return (
    <div className="checkout-page">
      <TopBar title="Finalizar Pedido" showBack showCart={false} />

      <main className="page-content">
        <div className="container">
          {/* Endereço */}
          <section className="checkout-section animate-fade-in-up">
            <h2 className="checkout-section-title">📍 Endereço de entrega</h2>
            <div className="address-card">
              <div className="address-info">
                <p className="address-main">{endereco}</p>
                <p className="address-complement">Bloco A, Apt 42</p>
              </div>
              <button className="btn btn-ghost text-primary text-sm">Alterar</button>
            </div>
          </section>

          {/* Resumo dos itens */}
          <section className="checkout-section animate-fade-in-up delay-1">
            <h2 className="checkout-section-title">🛒 Itens do pedido</h2>
            <div className="checkout-items-list">
              {items.map(({ item, quantidade }) => (
                <div key={item.id} className="checkout-item-row">
                  <span className="checkout-item-qty">{quantidade}×</span>
                  <span className="checkout-item-name">{item.nome}</span>
                  <span className="checkout-item-price">{formatPrice(item.preco * quantidade)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Forma de Pagamento */}
          <section className="checkout-section animate-fade-in-up delay-2">
            <h2 className="checkout-section-title">💳 Forma de pagamento</h2>
            <div className="payment-options">
              {formasPagamento.map(fp => (
                <button
                  key={fp.id}
                  className={`payment-option ${formaPagamento === fp.id ? 'active' : ''}`}
                  onClick={() => setFormaPagamento(fp.id)}
                  id={`pay-${fp.id}`}
                >
                  <span className="payment-icon">{fp.icon}</span>
                  <div className="payment-info">
                    <span className="payment-name">{fp.nome}</span>
                    <span className="payment-desc">{fp.desc}</span>
                  </div>
                  <span className="payment-check">{formaPagamento === fp.id ? '●' : '○'}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Summary */}
          <section className="checkout-section animate-fade-in-up delay-3">
            <div className="checkout-summary">
              <div className="summary-row">
                <span>Subtotal ({items.length} itens)</span>
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
          </section>
        </div>

        {/* Confirm bar */}
        <div className="confirm-bar">
          <div className="container">
            <button
              className={`btn btn-primary btn-lg btn-block ${processing ? 'processing' : ''}`}
              onClick={handleConfirm}
              disabled={processing}
              id="btn-confirm-order"
            >
              {processing ? (
                <span className="processing-text">
                  <span className="spinner" />
                  Processando...
                </span>
              ) : (
                `Confirmar pedido • ${formatPrice(total)}`
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
