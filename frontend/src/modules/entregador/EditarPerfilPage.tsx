import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EntregadorLayout from './EntregadorLayout';
import ProfileEditModal from '../../shared/components/ProfileEditModal';
import { useAuthProtected } from '../../lib/useAuth';
import './EditarPerfilPage.css';

export default function EditarPerfilPage() {
  const navigate = useNavigate();
  useAuthProtected(['ENTREGADOR']);

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
    <EntregadorLayout title="Meu Perfil">
      <div className="editar-perfil-container animate-fade-in-up">
        
        {/* Card de Identidade do Entregador */}
        <div className="gestor-profile-card" style={{ marginBottom: '2rem' }}>
          <div className="gestor-avatar" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            {user.nomeCompleto?.charAt(0) || user.nome?.charAt(0) || '🛵'}
          </div>
          <div className="gestor-info">
            <div className="gestor-main">
              <h3 className="gestor-name">{user.nomeCompleto || user.nome || 'Entregador'}</h3>
              <span className="gestor-badge">CPF: {formatCPF(user.cpf)}</span>
            </div>
            <div className="gestor-details">
              <span className="gestor-detail-item">📧 {user.email}</span>
              <span className="gestor-detail-item">📱 {user.telefone || 'Não informado'}</span>
            </div>
          </div>
        </div>

        <div className="perfil-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="action-card" onClick={() => setIsEditModalOpen(true)} style={{ cursor: 'pointer', padding: '1.25rem', background: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '1.8rem' }}>📝</span>
            <div>
              <h4 style={{ margin: 0 }}>Dados Pessoais</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Nome, Telefone e E-mail mestre</p>
            </div>
          </div>

          <div className="action-card" style={{ opacity: 0.6, padding: '1.25rem', background: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'not-allowed' }}>
            <span style={{ fontSize: '1.8rem' }}>🏍️</span>
            <div>
              <h4 style={{ margin: 0 }}>Veículo & Documentos</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Em breve: Gerenciar CNH e Placa</p>
            </div>
          </div>
        </div>

        <button 
          className="btn btn-outline btn-block" 
          onClick={() => navigate('/entregador')}
          style={{ marginTop: '2rem' }}
        >
          ← Voltar ao Início
        </button>
      </div>

      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user} 
        onSave={(updatedUser) => setUser(updatedUser)} 
      />
    </EntregadorLayout>
  );
}
