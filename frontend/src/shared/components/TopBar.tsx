import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAppName } from '../../lib/useAppName';
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
  const nomeApp = useAppName();

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
              <span className="top-bar-name hide-mobile">{nomeApp}</span>
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
                onClick={() => {
                  if (item.path === '/cliente/pedidos' && !localStorage.getItem('@MarketSystem:token')) {
                    navigate(`/login?redirect=${encodeURIComponent(item.path)}`);
                  } else {
                    navigate(item.path);
                  }
                }}
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

          {localStorage.getItem('@MarketSystem:token') ? (
            <button className="top-bar-avatar hide-mobile" onClick={() => {
              const userStr = localStorage.getItem('@MarketSystem:user');
              if (userStr) {
                try {
                  const user = JSON.parse(userStr);
                  if (['DONO', 'GERENTE', 'ESTOQUE', 'CAIXA'].includes(user.role)) return navigate('/comerciante');
                  if (user.role === 'ENTREGADOR') return navigate('/entregador');
                  if (user.role === 'ADMIN') return navigate('/admin');
                } catch(e) {}
              }
              navigate('/cliente/perfil');
            }} id="btn-profile">
              👤
            </button>
          ) : (
            <button 
              className="btn btn-outline btn-sm hide-mobile" 
              onClick={() => navigate('/login')} 
              id="btn-login-header"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              Entrar / Cadastrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
