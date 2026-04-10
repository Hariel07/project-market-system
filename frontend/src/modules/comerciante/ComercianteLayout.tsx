import { type ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { useMultiProfile } from '../../lib/useMultiProfile';
import ProfileSwitcherModal from '../../shared/components/ProfileSwitcherModal';
import './ComercianteDashboard.css';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

// Mapeamento de roles → itens de menu permitidos
const ROLE_NAV: Record<string, string[]> = {
  DONO:           ['dashboard', 'pedidos', 'catalogo', 'estoque', 'caixa', 'equipe', 'config'],
  GERENTE:        ['dashboard', 'pedidos', 'catalogo', 'estoque', 'caixa', 'equipe', 'config'],
  CAIXA:          ['dashboard', 'pedidos', 'caixa'],
  ESTOQUE:        ['dashboard', 'catalogo', 'estoque'],
  AJUDANTE_GERAL: ['dashboard', 'pedidos', 'caixa'],
  GARCOM:         ['dashboard', 'pedidos'],
};

const ALL_NAV_ITEMS = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard', path: '/comerciante' },
  { key: 'pedidos',   icon: '📋', label: 'Pedidos', path: '/comerciante/pedidos' },
  { key: 'catalogo',  icon: '📦', label: 'Catálogo', path: '/comerciante/catalogo' },
  { key: 'estoque',   icon: '🏷️', label: 'Estoque', path: '/comerciante/estoque' },
  { key: 'caixa',     icon: '🖥️', label: 'Caixa / PDV', path: '/comerciante/caixa' },
  { key: 'equipe',    icon: '👥', label: 'Equipe', path: '/comerciante/equipe' },
  { key: 'config',    icon: '⚙️', label: 'Configurações', path: '/comerciante/config' },
];

export default function ComercianteLayout({ title, subtitle, actions, children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [comercio, setComercio] = useState<any>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasMultipleProfiles = useMultiProfile();

  // Role do usuário logado
  const userRole = (() => {
    try { return JSON.parse(localStorage.getItem('@MarketSystem:user') || '{}').role || 'DONO'; }
    catch { return 'DONO'; }
  })();

  useEffect(() => {
    api.get('/comercios/me')
      .then(({ data }) => setComercio(data))
      .catch(() => {});
  }, []);

  // Atualiza dados na sidebar imediatamente após salvar (logo ou info)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setComercio((prev: any) => prev ? { ...prev, ...detail } : prev);
    };
    window.addEventListener('comercio:logoUpdated', handler);
    window.addEventListener('comercio:updated', handler);
    return () => {
      window.removeEventListener('comercio:logoUpdated', handler);
      window.removeEventListener('comercio:updated', handler);
    };
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  // Filtra itens de navegação pelo role do funcionário
  const allowedKeys = ROLE_NAV[userRole] || ROLE_NAV.DONO;
  const navItems = ALL_NAV_ITEMS.filter(item => allowedKeys.includes(item.key));

  const handleLogout = () => {
    localStorage.removeItem('@MarketSystem:token');
    localStorage.removeItem('@MarketSystem:user');
    sessionStorage.removeItem('@ms:profileCount');
    navigate('/login');
  };

  return (
    <div className="com-dashboard">
      {/* Sidebar desktop */}
      <aside className="com-sidebar hide-mobile">
        <div className="sidebar-brand">
          <div className="sidebar-logo-wrapper">
            {comercio?.logoUrl
              ? <img src={comercio.logoUrl} alt="Logo" className="sidebar-img-logo" />
              : <span className="sidebar-logo">🏪</span>}
          </div>
          <span className="sidebar-name">
            {comercio ? comercio.nomeFantasia : 'Carregando...'}
          </span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {hasMultipleProfiles && (
          <button className="sidebar-link sidebar-switch" onClick={() => setIsSwitcherOpen(true)} title="Trocar Perfil">
            <span className="sidebar-icon">🔄</span>
            <span className="sidebar-label">Trocar Perfil</span>
          </button>
        )}

        <button className="sidebar-link sidebar-logout" onClick={handleLogout} title="Sair">
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Sair</span>
        </button>
      </aside>

      {/* Mobile top bar */}
      <header className="com-topbar hide-tablet-up">
        <div className="com-topbar-inner">
          <div className="com-topbar-brand">
            <span>🏪</span>
            <span className="com-topbar-name">{comercio ? comercio.nomeFantasia : title}</span>
          </div>
          <button className="com-topbar-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="com-mobile-menu animate-fade-in">
            {navItems.map(item => (
              <button
                key={item.path}
                className={`com-mobile-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
            <div className="com-mobile-menu-divider" />
            {hasMultipleProfiles && (
              <button className="com-mobile-menu-item" onClick={() => { setMobileMenuOpen(false); setIsSwitcherOpen(true); }}>
                <span>🔄</span> Trocar Perfil
              </button>
            )}
            <button className="com-mobile-menu-item com-mobile-logout" onClick={handleLogout}>
              <span>🚪</span> Sair
            </button>
          </div>
        )}
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
            { icon: '🖥️', label: 'Caixa', path: '/comerciante/caixa' },
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

      <ProfileSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </div>
  );
}
