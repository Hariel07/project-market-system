import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import ProfileEditModal from '../../shared/components/ProfileEditModal';
import './ComercianteConfig.css';

export default function ComerciantePerfilPage() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('@MarketSystem:user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <ComercianteLayout title="Meu Perfil" subtitle="Dados pessoais e segurança da conta">
      <div className="config-sections animate-fade-in-up">
        <div className="gestor-profile-card" style={{ marginBottom: '2rem' }}>
          <div className="gestor-avatar">
            {user.nomeCompleto?.charAt(0) || '👤'}
          </div>
          <div className="gestor-info">
            <div className="gestor-main">
              <h3 className="gestor-name">{user.nomeCompleto || 'Gestor'}</h3>
              <span className="gestor-badge">CPF: {formatCPF(user.cpf)}</span>
            </div>
            <div className="gestor-details">
              <span className="gestor-detail-item">📧 {user.email}</span>
              <span className="gestor-detail-item">📱 {user.telefone || 'Não informado'}</span>
              <span className="gestor-detail-item">🔑 Perfil: {user.role}</span>
            </div>
          </div>
        </div>

        <div className="perfil-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="action-card" onClick={() => setIsEditModalOpen(true)} style={{ cursor: 'pointer', padding: '1.5rem', background: 'white', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s' }}>
            <span style={{ fontSize: '2rem' }}>📝</span>
            <div>
              <h4 style={{ margin: 0 }}>Editar Dados Pessoais</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nome, Telefone e E-mail da conta master</p>
            </div>
          </div>

          <div className="action-card" style={{ cursor: 'not-allowed', opacity: 0.6, padding: '1.5rem', background: 'white', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🔒</span>
            <div>
              <h4 style={{ margin: 0 }}>Alterar Senha</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Funcionalidade em desenvolvimento</p>
            </div>
          </div>

          <div className="action-card" onClick={() => navigate('/comerciante/config/perfil')} style={{ cursor: 'pointer', padding: '1.5rem', background: 'white', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s' }}>
            <span style={{ fontSize: '2rem' }}>🏪</span>
            <div>
              <h4 style={{ margin: 0 }}>Dados do Comércio</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configurações da loja e entregas</p>
            </div>
          </div>
        </div>

        <button 
          className="btn btn-outline btn-block" 
          onClick={() => navigate('/comerciante')}
          style={{ marginTop: '2.5rem' }}
        >
          ← Voltar ao Dashboard
        </button>
      </div>

      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user} 
        onSave={(updatedUser) => setUser(updatedUser)} 
      />
    </ComercianteLayout>
  );
}
