import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ComercianteDashboard.css';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function ComercianteLayout({ title, subtitle, actions, children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: '📊', label: 'Dashboard', path: '/comerciante' },
    { icon: '📋', label: 'Pedidos', path: '/comerciante/pedidos' },
    { icon: '📦', label: 'Catálogo', path: '/comerciante/catalogo' },
    { icon: '🏷️', label: 'Estoque', path: '/comerciante/estoque' },
    { icon: '➕', label: 'Novo Item', path: '/comerciante/item/novo' },
    { icon: '⚙️', label: 'Configurações', path: '/comerciante/config' },
  ];

  return (
    <div className="com-dashboard">
      {/* Sidebar desktop */}
      <aside className="com-sidebar hide-mobile">
        <div className="sidebar-brand">
          <span className="sidebar-logo">🏪</span>
          <span className="sidebar-name">Mercado<br/>Bom Preço</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button className="sidebar-link sidebar-logout" onClick={() => navigate('/login')}>
          <span className="sidebar-icon">🚪</span>
          Sair
        </button>
      </aside>

      {/* Mobile top bar */}
      <header className="com-topbar hide-tablet-up">
        <div className="com-topbar-inner">
          <div className="com-topbar-brand">
            <span>🏪</span>
            <span className="com-topbar-name">{title}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="com-main">
        <div className="com-content">
          <div className="com-header animate-fade-in-up">
            <div>
              <h1 className="com-page-title">{title}</h1>
              {subtitle && <p className="com-page-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="com-header-actions hide-mobile">{actions}</div>}
          </div>
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="com-bottom-nav hide-tablet-up">
          {[
            { icon: '📊', label: 'Início', path: '/comerciante' },
            { icon: '📋', label: 'Pedidos', path: '/comerciante/pedidos' },
            { icon: '📦', label: 'Catálogo', path: '/comerciante/catalogo' },
            { icon: '🏷️', label: 'Estoque', path: '/comerciante/estoque' },
            { icon: '⚙️', label: 'Mais', path: '/comerciante/config' },
          ].map(item => (
            <button
              key={item.path}
              className={`com-bnav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="com-bnav-icon">{item.icon}</span>
              <span className="com-bnav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
