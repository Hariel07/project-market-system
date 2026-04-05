import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import ProfileEditModal from '../../shared/components/ProfileEditModal';
import './AdminDashboard.css';

export default function AdminPerfilPage() {
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
    <AdminLayout title="Meu Perfil">
      <div className="admin-dash animate-fade-in-up">
        
        {/* Card de Identidade do Admin */}
        <div className="gestor-profile-card">
          <div className="gestor-avatar">
            {user.nomeCompleto?.charAt(0) || user.nome?.charAt(0) || '⚙️'}
          </div>
          <div className="gestor-info">
            <div className="gestor-main">
              <h3 className="gestor-name">{user.nomeCompleto || user.nome || 'Admin Master'}</h3>
              <span className="gestor-badge">CPF: {formatCPF(user.cpf)}</span>
            </div>
            <div className="gestor-details">
              <span className="gestor-detail-item">📧 {user.email}</span>
              <span className="gestor-detail-item">📱 {user.telefone || 'Não informado'}</span>
              <span className="gestor-detail-item">🔑 Perfil: {user.role}</span>
            </div>
          </div>
        </div>

        {/* Ações de Conta */}
        <div className="admin-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="admin-card" onClick={() => setIsEditModalOpen(true)} style={{ cursor: 'pointer', padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>📝</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Editar Dados Master</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>Alterar Nome, Telefone e E-mail da conta principal.</p>
            </div>
          </div>

          <div className="admin-card" style={{ opacity: 0.6, padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1.5rem', cursor: 'not-allowed' }}>
            <span style={{ fontSize: '2.5rem' }}>🔒</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Segurança & Senha</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>Gerenciamento de credenciais (Em breve).</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
           <button className="btn btn-outline" onClick={() => navigate('/admin')}>
             ← Voltar ao Dashboard
           </button>
        </div>

      </div>

      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user} 
        onSave={(updatedUser) => setUser(updatedUser)} 
      />
    </AdminLayout>
  );
}
