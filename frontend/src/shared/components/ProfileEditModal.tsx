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
      // Logout imediato após marcar para exclusão
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
      
      // O backend devolve o usuário atualizado
      const updatedAccount = response.data.user;
      
      // Mescla dados do Perfil atual com a Conta atualizada
      const currentUser = JSON.parse(localStorage.getItem('@MarketSystem:user') || '{}');
      const mergedUser = { 
        ...currentUser, 
        ...updatedAccount,
        nome: updatedAccount.nomeCompleto // Garante compatibilidade onde usa 'nome'
      };

      // Atualiza localStorage
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
        
        <h2>Editar Meu Perfil</h2>
        <p>Atualize as informações da sua conta.</p>

        <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '1.5rem' }}>
          
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
              title="O e-mail não pode ser alterado por segurança."
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
            {loading ? <span className="btn-loading"><span className="spinner"/> Salvando...</span> : 'Salvar Alterações'}
          </button>
          
        </form>

        <div className="profile-danger-zone">
          <h3>Gerenciamento de Conta</h3>
          <div className="danger-actions">
            <button type="button" className="btn-danger-outline" onClick={() => setShowDeleteConfirm('profile')}>
              Excluir apenas este perfil ({user?.role})
            </button>
            <button type="button" className="btn-danger-outline" onClick={() => setShowDeleteConfirm('account')}>
              Excluir conta master e todos os perfis
            </button>
          </div>
          <p className="danger-note">Suas informações podem ser restauradas em até 30 dias se você fizer login novamente.</p>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-card animate-fade-in-up">
              <h3>Confirmar Exclusão</h3>
              <p>
                Você está prestes a excluir {showDeleteConfirm === 'account' ? 'sua CONTA MASTER COMPLETA' : 'este PERFIL'}. 
                Isso afetará seu acesso imediato. Digite sua senha para confirmar:
              </p>
              <input 
                type="password" 
                className="input" 
                placeholder="Sua senha atual" 
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                style={{ marginBottom: '1.5rem' }}
              />
              <div className="delete-confirm-btns" style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-ghost flex-1" onClick={() => { setShowDeleteConfirm(null); setDeletePassword(''); }}>Cancelar</button>
                <button className="btn btn-danger flex-1" onClick={handleDeleteAction} disabled={loading}>
                  {loading ? 'Processando...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
