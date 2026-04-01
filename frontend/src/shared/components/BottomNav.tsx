import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './BottomNav.css';

const navItems = [
  { path: '/cliente', icon: '🏠', label: 'Início' },
  { path: '/cliente/mercados', icon: '🏪', label: 'Mercados' },
  { path: '/cliente/pedidos', icon: '📋', label: 'Pedidos' },
  { path: '/cliente/carrinho', icon: '🛒', label: 'Carrinho' },
  { path: '/cliente/perfil', icon: '👤', label: 'Perfil' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="bottom-nav" id="bottom-nav">
      {navItems.filter(item => {
        if (item.path !== '/cliente/perfil') return true;
        const userStr = localStorage.getItem('@MarketSystem:user');
        if (!userStr) return false;
        try {
          const user = JSON.parse(userStr);
          return user.role === 'CLIENTE';
        } catch {
          return false;
        }
      }).map(item => {
        const isActive = location.pathname === item.path ||
          (item.path !== '/cliente' && location.pathname.startsWith(item.path));
        const isCart = item.path === '/cliente/carrinho';

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
