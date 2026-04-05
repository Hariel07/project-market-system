import { type ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppConfig } from '../../lib/useAppName';
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

  const navItems = [
    { icon: '🌐', label: 'Visão Global', path: '/admin' },
    { icon: '🏪', label: 'Comércios', path: '/admin/comercios' },
    { icon: '💳', label: 'Planos', path: '/admin/planos' },
    { icon: '👤', label: 'Usuários', path: '/admin/usuarios' },
    { icon: '⚙️', label: 'Sistema', path: '/admin/sistema' },
  ];

  return (
    <div className="admin-app">
      {/* Sidebar Desktop */}
      <aside className="admin-sidebar hidden-mobile">
        <div className="admin-sidebar-header">
          {config.logoUrl ? (
            <div className="admin-logo-img-wrapper" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={config.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
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
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" style={{ color: '#4f46e5', fontWeight: 700 }} onClick={() => setIsSwitcherOpen(true)}>
            <span className="admin-nav-icon">🔄</span>
            Trocar de Perfil
          </button>
          <button className="admin-nav-item text-danger" onClick={() => { localStorage.removeItem('@MarketSystem:token'); localStorage.removeItem('@MarketSystem:user'); navigate('/login'); }}>
            <span className="admin-nav-icon">🚪</span>
            Sair do Painel
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
            <div className="admin-alert-badge">
              🔔
              <span className="badge-dot"></span>
            </div>
            <div className="admin-profile">
              <span className="admin-profile-name">Super Admin</span>
              <div className="admin-avatar">SA</div>
            </div>
          </div>
        </header>

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
        {navItems.map(item => (
          <button
            key={item.path}
            className={`admin-bnav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="admin-bnav-icon">{item.icon}</span>
            <span className="admin-bnav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
