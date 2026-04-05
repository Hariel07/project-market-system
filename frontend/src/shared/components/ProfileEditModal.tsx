import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import './ProfileEditModal.css';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (updatedUser: any) => void;
}

export default function ProfileEditModal({ isOpen, onClose, user, onSave }: ProfileEditModalProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'account'>('data');
  const [form, setForm] = useState({
    nomeCompleto: '',
    email: '',
    telefone: ''
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<'profile' | 'account' | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  const handleDeleteAction = async () => {
    if (!deletePassword) return alert('Por favor, digite sua senha para confirmar.');
    setLoading(true);
    try {
      const endpoint = showDeleteConfirm === 'account' ? 'perfil/account' : 'perfil/me';
      const res = await api.delete(endpoint, { data: { senha: deletePassword } });
      
      alert(res.data.message);
      localStorage.clear();
      window.location.href = '/login';
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao processar exclusão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setForm({
        nomeCompleto: user.nomeCompleto || user.nome || '',
        email: user.email || '',
        telefone: user.telefone || ''
      });
    }
    if (!isOpen) {
      setActiveTab('data');
      setShowDeleteConfirm(null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.patch('perfil/me', {
        nomeCompleto: form.nomeCompleto,
        telefone: form.telefone
      });
      
      const updatedAccount = response.data.user;
      const currentUser = JSON.parse(localStorage.getItem('@MarketSystem:user') || '{}');
      const mergedUser = { 
        ...currentUser, 
        ...updatedAccount,
        nome: updatedAccount.nomeCompleto
      };

      localStorage.setItem('@MarketSystem:user', JSON.stringify(mergedUser));
      onSave(mergedUser);
      onClose();
      alert('Perfil atualizado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose}>✕</button>
        
        <h2>Gerenciar Perfil</h2>
        
        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Dados Pessoais
          </button>
          <button 
            className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Acesso e Segurança
          </button>
        </div>

        <div className="modal-scroll-area">
          {activeTab === 'data' ? (
            <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '1rem' }}>
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  className="input" 
                  value={form.nomeCompleto} 
                  onChange={e => setForm({...form, nomeCompleto: e.target.value})} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>E-mail da Conta (Não editável)</label>
                <input 
                  type="email" 
                  className="input" 
                  value={form.email} 
                  disabled 
                />
              </div>

              <div className="input-group">
                <label>Telefone / WhatsApp</label>
                <input 
                  type="tel" 
                  className="input" 
                  value={form.telefone} 
                  onChange={e => setForm({...form, telefone: e.target.value})} 
                  required 
                />
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary btn-block ${loading ? 'loading' : ''}`} 
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          ) : (
            <div className="account-settings-pane animate-fade-in">
              <div className="settings-section">
                <h4>Sua Conta Master</h4>
                <p className="text-sm text-secondary">Vínculo: CPF {user?.cpf}</p>
              </div>

              <div className="profile-danger-zone visible">
                <h3>Zona de Exclusão</h3>
                <p className="text-xs mb-4">Escolha uma das opções abaixo para remover seus acessos.</p>
                
                <div className="danger-actions">
                  <button type="button" className="btn-danger-outline" onClick={() => setShowDeleteConfirm('profile')}>
                    🗑️ Excluir apenas este perfil ({user?.role})
                  </button>
                  <button type="button" className="btn-danger-outline" onClick={() => setShowDeleteConfirm('account')}>
                    🔥 EXCLUIR CONTA E TODOS OS PERFIS
                  </button>
                </div>
                
                <div className="info-box-blue" style={{ marginTop: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <p className="text-xs" style={{ color: '#1e40af', margin: 0 }}>
                    <strong>💡 Período de Carência:</strong> Após confirmar, você terá 30 dias para restaurar seu acesso apenas fazendo login novamente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-card animate-fade-in-up">
              <h3>Confirmar com Senha</h3>
              <p className="text-sm">
                Para confirmar a exclusão de {showDeleteConfirm === 'account' ? 'toda sua conta master' : 'seu perfil atual'}, digite sua senha:
              </p>
              <input 
                type="password" 
                className="input" 
                placeholder="Digite sua senha" 
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                style={{ marginBottom: '1.5rem' }}
                autoFocus
              />
              <div className="delete-confirm-btns" style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-ghost flex-1" onClick={() => { setShowDeleteConfirm(null); setDeletePassword(''); }}>Cancelar</button>
                <button className="btn btn-danger flex-1" onClick={handleDeleteAction} disabled={loading}>
                  {loading ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
