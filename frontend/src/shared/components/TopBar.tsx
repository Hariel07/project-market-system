import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAppConfig } from '../../lib/useAppName';
import ProfileSwitcherModal from './ProfileSwitcherModal';
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
  const config = useAppConfig();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!localStorage.getItem('@MarketSystem:token');
  const userStr = localStorage.getItem('@MarketSystem:user');
  const user = userStr ? (() => { try { return JSON.parse(userStr); } catch { return null; } })() : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@MarketSystem:token');
    localStorage.removeItem('@MarketSystem:user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <>
    <header className={`top-bar ${transparent ? 'top-bar-transparent' : ''}`} id="top-bar">
      <div className="top-bar-inner container">
        <div className="top-bar-left">
          {showBack ? (
            <button className="top-bar-back" onClick={() => navigate(-1)} id="btn-back">
              ←
            </button>
          ) : (
            <div className="top-bar-brand" onClick={() => navigate('/')}>
              {config.logoUrl ? (
                <div className="top-bar-logo-img">
                  <img src={config.logoUrl} alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                </div>
              ) : (
                <span className="top-bar-logo">🛒</span>
              )}
              <span className="top-bar-name hide-mobile">{config.nomeApp}</span>
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
              { path: '/', label: 'Início' },
              { path: '/mercados', label: 'Mercados' },
              { path: '/pedidos', label: 'Pedidos' },
            ].map(item => (
              <button
                key={item.path}
                className={`top-bar-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => {
                  if (item.path === '/pedidos' && !localStorage.getItem('@MarketSystem:token')) {
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
              onClick={() => navigate('/carrinho')}
              id="btn-cart"
            >
              🛒
              {totalItems > 0 && (
                <span className="top-bar-cart-badge">{totalItems}</span>
              )}
            </button>
          )}

          {isLoggedIn ? (
            <div ref={dropdownRef} style={{ position: 'relative' }} className="hide-mobile">
              <button
                className="top-bar-avatar"
                onClick={() => setDropdownOpen(v => !v)}
                id="btn-profile"
                title={user?.nome || 'Perfil'}
              >
                {user?.nome ? user.nome.charAt(0).toUpperCase() : '👤'}
              </button>
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--color-bg-card, #fff)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md, 8px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 180, zIndex: 200,
                  overflow: 'hidden',
                }}>
                  {user?.nome && (
                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {user.nome}
                    </div>
                  )}
                  {user?.role === 'CLIENTE' && (
                    <button
                      style={{ display: 'block', width: '100%', padding: '0.65rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                      onClick={() => { setDropdownOpen(false); navigate('/perfil'); }}
                    >
                      👤 Meu perfil
                    </button>
                  )}
                  {(user?.role === 'DONO' || user?.role === 'GERENTE' || user?.role === 'ESTOQUE' || user?.role === 'CAIXA' || user?.role === 'AJUDANTE_GERAL' || user?.role === 'GARCOM') && (
                    <button
                      style={{ display: 'block', width: '100%', padding: '0.65rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                      onClick={() => { setDropdownOpen(false); navigate('/comerciante'); }}
                    >
                      🏪 Painel do comércio
                    </button>
                  )}
                  <button
                    style={{ display: 'block', width: '100%', padding: '0.65rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                    onClick={() => { setDropdownOpen(false); setSwitcherOpen(true); }}
                  >
                    🔄 Trocar perfil
                  </button>
                  <button
                    style={{ display: 'block', width: '100%', padding: '0.65rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--color-danger)' }}
                    onClick={handleLogout}
                  >
                    🚪 Sair
                  </button>
                </div>
              )}
            </div>
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

    <ProfileSwitcherModal isOpen={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </>
  );
}
