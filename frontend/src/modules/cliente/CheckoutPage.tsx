import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../data/mockData';
import { api } from '../../lib/api';
import './CheckoutPage.css';

const formasPagamento = [
  { id: 'pix',      icon: '💠', nome: 'PIX',               desc: 'Aprovação instantânea' },
  { id: 'credito',  icon: '💳', nome: 'Cartão de Crédito', desc: 'Até 12x sem juros' },
  { id: 'debito',   icon: '💳', nome: 'Cartão de Débito',  desc: 'Débito na hora' },
  { id: 'dinheiro', icon: '💵', nome: 'Dinheiro',          desc: 'Pagar na entrega' },
];

interface Endereco {
  id: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  rotulo: string;
  icone: string;
  isPrincipal: boolean;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, comercioId } = useCart();
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<Endereco | null>(null);
  const [processing, setProcessing] = useState(false);
  const [troco, setTroco] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const [comercio, setComercio] = useState<{ taxaEntrega: number } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('@MarketSystem:user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!localStorage.getItem('@MarketSystem:token') || !user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (user.role !== 'CLIENTE') {
      alert('Apenas clientes podem fazer compras.');
      navigate('/cadastro?role=cliente&redirect=/checkout');
      return;
    }

    // Buscar endereços do usuário
    api.get('perfil/enderecos').then((res: any) => {
      const lista: Endereco[] = Array.isArray(res.data) ? res.data : [];
      setEnderecos(lista);
      const principal = lista.find(e => e.isPrincipal) ?? lista[0] ?? null;
      setEnderecoSelecionado(principal);
    }).catch(() => setEnderecos([]));

    // Buscar taxa de entrega do comércio
    if (comercioId) {
      api.get('comercios/public').then((res: any) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const c = data.find((x: any) => String(x.id) === String(comercioId));
        if (c) setComercio({ taxaEntrega: c.taxaEntrega ?? 0 });
      }).catch(() => {});
    }
  }, [navigate, comercioId]);

  const taxaEntrega = comercio?.taxaEntrega ?? 0;
  const total = subtotal + taxaEntrega;

  const handleConfirm = async () => {
    if (!enderecoSelecionado) {
      setErro('Selecione um endereço de entrega.');
      return;
    }
    if (!comercioId) {
      setErro('Carrinho sem comércio associado. Volte e adicione produtos.');
      return;
    }

    setProcessing(true);
    setErro(null);

    const enderecoStr = [
      enderecoSelecionado.logradouro,
      enderecoSelecionado.numero,
      enderecoSelecionado.complemento,
      enderecoSelecionado.bairro,
      enderecoSelecionado.cidade,
      enderecoSelecionado.estado,
    ].filter(Boolean).join(', ');

    const payload = {
      comercioId: String(comercioId),
      formaPagamento,
      enderecoEntrega: enderecoStr,
      itens: items.map(({ item, quantidade }) => ({
        produtoId: String(item.id),
        quantidade,
        precoUnitario: item.preco,
      })),
    };

    try {
      const res: any = await api.post('pedidos', payload);
      clearCart();
      navigate(`/pedido/${res.data.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao criar pedido. Tente novamente.';
      setErro(msg);
      setProcessing(false);
    }
  };

  if (items.length === 0 && !processing) {
    navigate('/carrinho');
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
            {enderecos.length === 0 ? (
              <div className="address-card">
                <p className="text-secondary">Nenhum endereço cadastrado.</p>
                <button
                  className="btn btn-outline btn-sm mt-2"
                  onClick={() => navigate('/enderecos/novo')}
                >
                  + Adicionar endereço
                </button>
              </div>
            ) : (
              <div className="checkout-addresses">
                {enderecos.map(end => (
                  <div
                    key={end.id}
                    className={`address-card clickable ${enderecoSelecionado?.id === end.id ? 'selected' : ''}`}
                    onClick={() => setEnderecoSelecionado(end)}
                  >
                    <div className="address-info">
                      <p className="address-label">{end.icone} {end.rotulo}</p>
                      <p className="address-main">
                        {end.logradouro}{end.numero ? `, ${end.numero}` : ''}
                        {end.complemento ? ` — ${end.complemento}` : ''}
                      </p>
                      <p className="address-secondary text-secondary text-sm">
                        {[end.bairro, end.cidade, end.estado].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <span className="address-radio">{enderecoSelecionado?.id === end.id ? '●' : '○'}</span>
                  </div>
                ))}
                <button
                  className="btn btn-ghost btn-sm text-primary mt-1"
                  onClick={() => navigate('/enderecos/novo')}
                >
                  + Novo endereço
                </button>
              </div>
            )}
          </section>

          {/* Itens */}
          <section className="checkout-section animate-fade-in-up delay-1">
            <h2 className="checkout-section-title">🛒 Itens do pedido</h2>
            <div className="checkout-items-list">
              {items.map(({ item, quantidade }) => (
                <div key={String(item.id)} className="checkout-item-row">
                  <span className="checkout-item-qty">{quantidade}×</span>
                  <span className="checkout-item-name">{item.nome}</span>
                  <span className="checkout-item-price">{formatPrice(item.preco * quantidade)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pagamento */}
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

            {/* Campo de troco — só aparece quando DINHEIRO está selecionado */}
            {formaPagamento === 'dinheiro' && (
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="troco-input" style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  💵 Precisa de troco para quanto?
                </label>
                <input
                  id="troco-input"
                  type="number"
                  className="input"
                  placeholder={`Ex: 50,00 (total: ${(subtotal + (comercio?.taxaEntrega ?? 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`}
                  min={0}
                  step="0.01"
                  value={troco}
                  onChange={e => setTroco(e.target.value)}
                />
                {troco && parseFloat(troco) > 0 && (
                  <small style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                    Troco: {(parseFloat(troco) - (subtotal + (comercio?.taxaEntrega ?? 0))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </small>
                )}
              </div>
            )}
          </section>

          {/* Resumo */}
          <section className="checkout-section animate-fade-in-up delay-3">
            <div className="checkout-summary">
              <div className="summary-row">
                <span>Subtotal ({items.length} itens)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Taxa de entrega</span>
                <span>{taxaEntrega === 0 ? 'Grátis' : formatPrice(taxaEntrega)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </section>

          {erro && (
            <div className="checkout-section" style={{ color: 'var(--color-danger)', textAlign: 'center', padding: '0.5rem' }}>
              {erro}
            </div>
          )}
        </div>

        {/* Botão confirmar */}
        <div className="confirm-bar">
          <div className="container">
            <button
              className={`btn btn-primary btn-lg btn-block ${processing ? 'processing' : ''}`}
              onClick={handleConfirm}
              disabled={processing || enderecos.length === 0}
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
