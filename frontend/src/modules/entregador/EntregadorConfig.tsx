import { useNavigate } from 'react-router-dom';
import EntregadorLayout from './EntregadorLayout';
import './EntregadorConfig.css';

export default function EntregadorConfig() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('@MarketSystem:token');
    localStorage.removeItem('@MarketSystem:user');
    navigate('/login');
  };

  return (
    <EntregadorLayout title="Ajustes">
      <div className="ent-config-container animate-fade-in-up">
        
        {/* Perfil Header */}
        <div className="ent-profile-header">
          <div className="ent-avatar">🛵</div>
          <div className="ent-profile-info">
            <h3>José Motoboy</h3>
            <span>Placa: ABC-1234 • Moto</span>
          </div>
        </div>

        {/* Links / Menu */}
        <div className="ent-section-title mt-4">Conta</div>
        <div className="ent-config-list">
          <button className="ent-config-item">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">👤</span>
              <span className="ent-config-label">Dados Pessoais</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
          <button className="ent-config-item">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">🏍️</span>
              <span className="ent-config-label">Veículo e Documentos</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
          <button className="ent-config-item">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">🏦</span>
              <span className="ent-config-label">Conta Bancária (Repasse)</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
        </div>

        <div className="ent-section-title mt-4">Preferências</div>
        <div className="ent-config-list">
          <button className="ent-config-item">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">🔔</span>
              <span className="ent-config-label">Notificações</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
          <button className="ent-config-item">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">📍</span>
              <span className="ent-config-label">GPS Padrão (Maps / Waze)</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
          <button className="ent-config-item">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">🌙</span>
              <span className="ent-config-label">Modo Escuro</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
        </div>

        <div className="ent-section-title mt-4">Sistema</div>
        <div className="ent-config-list">
          <button className="ent-config-item">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">❓</span>
              <span className="ent-config-label">Ajuda e Suporte</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
          <button className="ent-config-item text-danger" onClick={handleLogout}>
            <div className="ent-config-item-left">
              <span className="ent-config-icon">🚪</span>
              <span className="ent-config-label">Sair do App</span>
            </div>
          </button>
        </div>

      </div>
    </EntregadorLayout>
  );
}
