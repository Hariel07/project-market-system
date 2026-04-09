import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './BottomNav.css';

const navItems = [
  { path: '/',         icon: '🏠', label: 'Início' },
  { path: '/mercados', icon: '🏪', label: 'Mercados' },
  { path: '/pedidos',  icon: '📋', label: 'Pedidos' },
  { path: '/carrinho', icon: '🛒', label: 'Carrinho' },
  { path: '/perfil',   icon: '👤', label: 'Perfil' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="bottom-nav" id="bottom-nav">
      {navItems.filter(item => {
        if (item.path !== '/perfil') return true;
        const userStr = localStorage.getItem('@MarketSystem:user');
        if (!userStr) return false;
        try {
          const user = JSON.parse(userStr);
          return user.role === 'CLIENTE';
        } catch {
          return false;
        }
      }).map(item => {
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        const isCart = item.path === '/carrinho';

        return (
          <button
            key={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            id={`nav-${item.label.toLowerCase()}`}
          >
            <span className="bottom-nav-icon">
              {item.icon}
              {isCart && totalItems > 0 && (
                <span className="bottom-nav-badge">{totalItems}</span>
              )}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
