import { type ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppName } from '../../lib/useAppName';
import { useLogout } from '../../lib/useAuth';
import ProfileSwitcherModal from '../../shared/components/ProfileSwitcherModal';
import './EntregadorLayout.css';

interface Props {
  title?: string;
  hideHeader?: boolean;
  children: ReactNode;
}

export default function EntregadorLayout({ title, hideHeader = false, children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const nomeApp = useAppName();
  const logout = useLogout();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const isRotaDetail = location.pathname.includes('/entregador/rota/');

  const navItems = [
    { icon: '🛵', label: 'Início', path: '/entregador' },
    { icon: '💰', label: 'Ganhos', path: '/entregador/ganhos' },
    { icon: '📜', label: 'Histórico', path: '/entregador/historico' },
    { icon: '⚙️', label: 'Ajustes', path: '/entregador/config' },
  ];

  return (
    <div className="entregador-app">
      {/* Top Header - Oculto em algumas telas como o mapa full screen */}
      {!hideHeader && !isRotaDetail && (
        <header className="entregador-header">
          <div className="entregador-header-inner">
            <h1 className="entregador-title">{title || `${nomeApp} Entregador`}</h1>
            <div className="entregador-actions">
              <button className="entregador-btn-icon" onClick={() => setIsSwitcherOpen(true)} title="Trocar Perfil">🔄</button>
              <button className="entregador-btn-icon" onClick={logout} title="Sair">🚪</button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`entregador-main ${isRotaDetail ? 'no-padding' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!isRotaDetail && (
        <nav className="entregador-bottom-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`entregador-bnav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="entregador-bnav-icon">{item.icon}</span>
              <span className="entregador-bnav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      <ProfileSwitcherModal 
        isOpen={isSwitcherOpen} 
        onClose={() => setIsSwitcherOpen(false)} 
      />
    </div>
  );
}
