import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import './ProfileSwitcherModal.css';

interface Profile {
  id: string;
  nome: string;
  role: string;
  comercio?: {
    nomeFantasia: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSwitcherModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const currentUserId = JSON.parse(localStorage.getItem('@MarketSystem:user') || '{}').id;

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/auth/my-profiles');
      setProfiles(data);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async (profileId: string, role: string) => {
    if (profileId === currentUserId) {
      onClose();
      return;
    }

    setSwitching(profileId);
    try {
      const response = await api.post('/auth/switch-profile', { perfilId: profileId });
      const { token, user } = response.data;

      // Atualiza localStorage (mantendo compatibilidade com as duas chaves usadas no sistema)
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.nome);
      localStorage.setItem('@MarketSystem:token', token);
      localStorage.setItem('@MarketSystem:user', JSON.stringify(user));

      onClose();
      
      // Redireciona baseado no novo papel
      switch (role) {
        case 'ADMIN': navigate('/admin'); break;
        case 'DONO':
        case 'GERENTE':
        case 'ESTOQUE':
        case 'CAIXA': navigate('/comerciante'); break;
        case 'ENTREGADOR': navigate('/entregador'); break;
        default: navigate('/cliente');
      }
      
      window.location.reload(); // Recarrega para limpar estados de contextos
    } catch (error) {
      alert('Erro ao trocar de perfil.');
    } finally {
      setSwitching(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ps-modal-overlay" onClick={onClose}>
      <div className="ps-modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="ps-modal-header">
          <h3>Trocar de Perfil</h3>
          <button className="ps-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="ps-modal-body">
          {loading ? (
            <div className="ps-loading">Buscando seus acessos...</div>
          ) : (
            <div className="ps-profile-list">
              {profiles.map(p => {
                let icon = '👤';
                let label = 'Cliente';
                if (p.role === 'DONO') { icon = '🏪'; label = p.comercio?.nomeFantasia || 'Comércio'; }
                if (p.role === 'ENTREGADOR') { icon = '🛵'; label = 'Entregador'; }
                if (p.role === 'ADMIN') { icon = '⚙️'; label = 'Administrador'; }

                const isCurrent = p.id === currentUserId;

                return (
                  <button 
                    key={p.id} 
                    className={`ps-profile-item ${isCurrent ? 'active' : ''} ${switching === p.id ? 'switching' : ''}`}
                    onClick={() => handleSwitch(p.id, p.role)}
                    disabled={!!switching}
                  >
                    <span className="ps-profile-icon">{icon}</span>
                    <div className="ps-profile-info">
                      <span className="ps-profile-name">{p.nome}</span>
                      <span className="ps-profile-role">{label}</span>
                    </div>
                    {isCurrent && <span className="ps-current-badge">Atual</span>}
                    {switching === p.id && <span className="spinner-sm"></span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <p className="ps-modal-footer">
          Seus perfis estão vinculados ao seu CPF.
        </p>
      </div>
    </div>
  );
}
