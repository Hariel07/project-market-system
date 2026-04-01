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
    nome: '',
    email: '',
    telefone: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome || '',
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
      const response = await api.put('/api/perfil', form);
      // O backend devolve o usuário atualizado
      const updatedUser = response.data.user;
      
      // Atualiza localStorage
      localStorage.setItem('@MarketSystem:user', JSON.stringify(updatedUser));
      
      onSave(updatedUser);
      onClose();
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
              value={form.nome} 
              onChange={e => setForm({...form, nome: e.target.value})} 
              required 
            />
          </div>

          <div className="input-group">
            <label>E-mail da Conta</label>
            <input 
              type="email" 
              className="input" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              required 
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
      </div>
    </div>
  );
}
