import { type ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppConfig } from '../../lib/useAppName';
import { useMultiProfile } from '../../lib/useMultiProfile';
import ProfileSwitcherModal from '../../shared/components/ProfileSwitcherModal';
import './AdminLayout.css';

interface Props {
  title: string;
  children: ReactNode;
}

export default function AdminLayout({ title, children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const config = useAppConfig();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasMultipleProfiles = useMultiProfile();

  // Close mobile menu on navigation
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const navItems = [
    { icon: '🌐', label: 'Visão Global', path: '/admin' },
    { icon: '🏪', label: 'Comércios', path: '/admin/comercios' },
    { icon: '💳', label: 'Planos', path: '/admin/planos' },
    { icon: '👤', label: 'Usuários', path: '/admin/usuarios' },
    { icon: '⚙️', label: 'Sistema', path: '/admin/sistema' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('@MarketSystem:token');
    localStorage.removeItem('@MarketSystem:user');
    sessionStorage.removeItem('@ms:profileCount');
    navigate('/login');
  };

  return (
    <div className="admin-app">
      {/* Sidebar Desktop */}
      <aside className="admin-sidebar hidden-mobile">
        <div className="admin-sidebar-header">
          {config.logoUrl ? (
            <div className="admin-logo-img-wrapper">
              <img src={config.logoUrl} alt="Logo" className="admin-logo-img" />
            </div>
          ) : (
            <div className="admin-logo-badge">👨‍💻</div>
          )}
          <div className="admin-logo-text">
            <h2>{config.nomeApp}</h2>
            <span className="admin-logo-sub">Platform Admin</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={item.label}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {hasMultipleProfiles && (
            <button className="admin-nav-item admin-nav-switch" onClick={() => setIsSwitcherOpen(true)} title="Trocar de Perfil">
              <span className="admin-nav-icon">🔄</span>
              <span className="admin-nav-label">Trocar de Perfil</span>
            </button>
          )}
          <button className="admin-nav-item admin-nav-logout" onClick={handleLogout} title="Sair">
            <span className="admin-nav-icon">🚪</span>
            <span className="admin-nav-label">Sair do Painel</span>
          </button>
        </div>
      </aside>

      <div className="admin-content-wrapper">
        {/* Header (Top Nav) */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1 className="admin-page-title">{title}</h1>
          </div>
          <div className="admin-topbar-right">
            {/* Mobile hamburger */}
            <button className="admin-mobile-menu-btn hidden-desktop" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="admin-mobile-menu hidden-desktop animate-fade-in">
            {navItems.map(item => (
              <button
                key={item.path}
                className={`admin-mobile-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
            <div className="admin-mobile-divider" />
            {hasMultipleProfiles && (
              <button className="admin-mobile-menu-item" onClick={() => { setMobileMenuOpen(false); setIsSwitcherOpen(true); }}>
                <span>🔄</span> Trocar de Perfil
              </button>
            )}
            <button className="admin-mobile-menu-item admin-mobile-logout" onClick={handleLogout}>
              <span>🚪</span> Sair
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="admin-main">
          {children}
        </main>
      </div>

      <ProfileSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      {/* Mobile Bottom Nav */}
      <nav className="admin-bottom-nav hidden-desktop">
        {navItems.slice(0, 4).map(item => (
          <button
            key={item.path}
            className={`admin-bnav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="admin-bnav-icon">{item.icon}</span>
            <span className="admin-bnav-label">{item.label}</span>
          </button>
        ))}
        <button
          className={`admin-bnav-item ${location.pathname === '/admin/sistema' ? 'active' : ''}`}
          onClick={() => navigate('/admin/sistema')}
        >
          <span className="admin-bnav-icon">⚙️</span>
          <span className="admin-bnav-label">Sistema</span>
        </button>
      </nav>
    </div>
  );
}
