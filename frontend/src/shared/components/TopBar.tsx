import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './TopBar.css';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  transparent?: boolean;
  onSearch?: (term: string) => void;
}

export default function TopBar({
  title,
  showBack = false,
  showSearch = false,
  showCart = true,
  transparent = false,
  onSearch,
}: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <header className={`top-bar ${transparent ? 'top-bar-transparent' : ''}`} id="top-bar">
      <div className="top-bar-inner container">
        <div className="top-bar-left">
          {showBack ? (
            <button className="top-bar-back" onClick={() => navigate(-1)} id="btn-back">
              ←
            </button>
          ) : (
            <div className="top-bar-brand" onClick={() => navigate('/cliente')}>
              <span className="top-bar-logo">🛒</span>
              <span className="top-bar-name hide-mobile">Market System</span>
            </div>
          )}
          {title && <h1 className="top-bar-title">{title}</h1>}
        </div>

        {showSearch && (
          <div className="top-bar-search hide-mobile">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar produtos, mercados..."
              className="search-input"
              onChange={e => onSearch?.(e.target.value)}
              id="search-input-desktop"
            />
          </div>
        )}

        <div className="top-bar-right">
          {/* Desktop nav links */}
          <nav className="top-bar-nav hide-mobile">
            {[
              { path: '/cliente', label: 'Início' },
              { path: '/cliente/mercados', label: 'Mercados' },
              { path: '/cliente/pedidos', label: 'Pedidos' },
            ].map(item => (
              <button
                key={item.path}
                className={`top-bar-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {showCart && (
            <button
              className="top-bar-cart"
              onClick={() => navigate('/cliente/carrinho')}
              id="btn-cart"
            >
              🛒
              {totalItems > 0 && (
                <span className="top-bar-cart-badge">{totalItems}</span>
              )}
            </button>
          )}

          <button className="top-bar-avatar hide-mobile" onClick={() => navigate('/cliente/perfil')} id="btn-profile">
            👤
          </button>
        </div>
      </div>
    </header>
  );
}
