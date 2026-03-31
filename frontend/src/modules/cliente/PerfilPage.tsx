import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import './PerfilPage.css';

export default function PerfilPage() {
  const navigate = useNavigate();

  const menuItems = [
    { icon: '📍', label: 'Endereços', desc: 'Gerencie seus endereços de entrega' },
    { icon: '💳', label: 'Pagamentos', desc: 'Cartões e métodos de pagamento' },
    { icon: '🎟️', label: 'Cupons', desc: 'Seus cupons de desconto' },
    { icon: '⭐', label: 'Favoritos', desc: 'Mercados e produtos favoritos' },
    { icon: '🔔', label: 'Notificações', desc: 'Configurar alertas' },
    { icon: '❓', label: 'Ajuda', desc: 'Central de atendimento' },
    { icon: '📄', label: 'Termos de uso', desc: 'Políticas e termos' },
  ];

  return (
    <div className="perfil-page">
      <TopBar title="Meu Perfil" showBack showCart />

      <main className="page-content">
        <div className="container">
          {/* Avatar */}
          <div className="perfil-header animate-fade-in-up">
            <div className="perfil-avatar-section">
              <div className="perfil-avatar">
                <span className="perfil-avatar-emoji">👤</span>
              </div>
              <div className="perfil-info">
                <h1 className="perfil-name">João Silva</h1>
                <p className="perfil-email">joao.silva@email.com</p>
                <p className="perfil-phone">(11) 99999-1234</p>
              </div>
            </div>
            <button className="btn btn-outline btn-sm">Editar</button>
          </div>

          {/* Stats */}
          <div className="perfil-stats animate-fade-in-up delay-1">
            <div className="stat-card">
              <span className="stat-value">12</span>
              <span className="stat-label">Pedidos</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">3</span>
              <span className="stat-label">Favoritos</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">2</span>
              <span className="stat-label">Cupons</span>
            </div>
          </div>

          {/* Menu */}
          <div className="perfil-menu animate-fade-in-up delay-2">
            {menuItems.map(item => (
              <button key={item.label} className="perfil-menu-item" id={`menu-${item.label.toLowerCase()}`}>
                <span className="perfil-menu-icon">{item.icon}</span>
                <div className="perfil-menu-info">
                  <span className="perfil-menu-label">{item.label}</span>
                  <span className="perfil-menu-desc">{item.desc}</span>
                </div>
                <span className="perfil-menu-arrow">→</span>
              </button>
            ))}
          </div>

          {/* Logout */}
          <button
            className="btn btn-outline btn-block logout-btn animate-fade-in-up delay-3"
            onClick={() => navigate('/')}
            id="btn-logout"
          >
            🚪 Sair da conta
          </button>
        </div>
      </main>
    </div>
  );
}
