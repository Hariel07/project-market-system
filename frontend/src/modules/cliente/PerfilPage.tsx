import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import ProfileEditModal from '../../shared/components/ProfileEditModal';
import ProfileSwitcherModal from '../../shared/components/ProfileSwitcherModal';
import './PerfilPage.css';

export default function PerfilPage() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('@MarketSystem:user');
    return saved ? JSON.parse(saved) : { nome: 'Visitante', email: '', telefone: '' };
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('@MarketSystem:token');
    const userStr = localStorage.getItem('@MarketSystem:user');

    if (!token || !userStr) {
      navigate('/login?redirect=/cliente/perfil');
      return;
    }

    const parsedUser = JSON.parse(userStr);
    
    // Bloqueia Comerciantes, Entregadores e Admins de acessar a tela de perfil de Cliente
    if (parsedUser.role !== 'CLIENTE') {
      alert('Seu perfil atual não é de Cliente. Redirecionando para o seu Painel de Controle.');
      if (['DONO', 'GERENTE', 'ESTOQUE', 'CAIXA'].includes(parsedUser.role)) {
        navigate('/comerciante');
      } else if (parsedUser.role === 'ENTREGADOR') {
        navigate('/entregador');
      } else if (parsedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/login');
      }
    }
  }, [navigate]);

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
                <h1 className="perfil-name">{user.nome}</h1>
                <p className="perfil-email">{user.email || user.cpf || 'Sem informações de contato'}</p>
                <p className="perfil-phone">{user.telefone || ''}</p>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setIsEditModalOpen(true)}>Editar</button>
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
              <button 
                key={item.label} 
                className="perfil-menu-item" 
                id={`menu-${item.label.toLowerCase()}`}
                onClick={() => {
                  if (item.label === 'Endereços') {
                    navigate('/cliente/enderecos');
                  }
                }}
              >
                <span className="perfil-menu-icon">{item.icon}</span>
                <div className="perfil-menu-info">
                  <span className="perfil-menu-label">{item.label}</span>
                  <span className="perfil-menu-desc">{item.desc}</span>
                </div>
                <span className="perfil-menu-arrow">→</span>
              </button>
            ))}
          </div>

          {/* Switch Profile */}
          <button
            className="btn btn-block animate-fade-in-up delay-3"
            style={{ marginBottom: '1rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', fontWeight: 700 }}
            onClick={() => setIsSwitcherOpen(true)}
          >
            🔄 Trocar de Perfil
          </button>

          {/* Logout */}
          <button
            className="btn btn-outline btn-block logout-btn animate-fade-in-up delay-3"
            onClick={() => { localStorage.removeItem('@MarketSystem:token'); localStorage.removeItem('@MarketSystem:user'); navigate('/login'); }}
            id="btn-logout"
          >
            🚪 Sair da conta
          </button>
        </div>
      </main>

      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user} 
        onSave={(updatedUser) => setUser(updatedUser)} 
      />

      <ProfileSwitcherModal 
        isOpen={isSwitcherOpen} 
        onClose={() => setIsSwitcherOpen(false)} 
      />
    </div>
  );
}
