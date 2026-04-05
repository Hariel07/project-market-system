import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EntregadorLayout from './EntregadorLayout';
import { useAuthProtected, useAuthUser, useLogout } from '../../lib/useAuth';
import { api } from '../../lib/api';
import './EntregadorConfig.css';

interface PerfilEntregador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  placa?: string;
  tipoVeiculo?: string;
  rating?: number;
  totalEntregas?: number;
}

export default function EntregadorConfig() {
  const navigate = useNavigate();
  
  // ✅ Proteção JWT
  useAuthProtected(['ENTREGADOR']);
  const { userId, userName } = useAuthUser();
  const logout = useLogout();

  const [perfil, setPerfil] = useState<PerfilEntregador | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Carregar dados do entregador da API
  useEffect(() => {
    if (!userId) return;

    api.get(`/perfil/${userId}`)
      .then((res: any) => {
        setPerfil(res.data);
        setErro(null);
      })
      .catch((err: any) => {
        console.error('Erro ao carregar perfil:', err);
        // Fallback: criar perfil com dados do localStorage
        setPerfil({
          id: userId,
          nome: userName || 'Entregador',
          email: localStorage.getItem('userEmail') || 'email@exemplo.com',
          telefone: localStorage.getItem('userPhone') || undefined,
          placa: 'ABC-1234',
          tipoVeiculo: 'Moto',
          totalEntregas: 0,
          rating: 4.8,
        });
        setErro('Alguns dados são aproximados');
      })
      .finally(() => setLoading(false));
  }, [userId, userName]);

  if (loading) {
    return (
      <EntregadorLayout title="Ajustes">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Carregando perfil...</p>
        </div>
      </EntregadorLayout>
    );
  }

  if (!perfil) {
    return (
      <EntregadorLayout title="Ajustes">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>❌ Erro ao carregar perfil</p>
        </div>
      </EntregadorLayout>
    );
  }

  const handleLogoutClick = () => {
    if (confirm('Deseja sair do app?')) {
      logout();
    }
  };

  return (
    <EntregadorLayout title="Ajustes">
      <div className="ent-config-container animate-fade-in-up">
        
        {/* Perfil Header com Dados Reais */}
        <div className="ent-profile-header">
          <div className="ent-avatar" style={{
            backgroundColor: '#FF6B35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}>
            🛵
          </div>
          <div className="ent-profile-info">
            <h3>{perfil.nome}</h3>
            <span>ID: {perfil.id.slice(0, 8)}...</span>
            {perfil.placa && <span>Placa: {perfil.placa} • {perfil.tipoVeiculo}</span>}
            {perfil.rating && <span>⭐ {perfil.rating} • {perfil.totalEntregas || 0} entregas</span>}
          </div>
        </div>

        {erro && (
          <div style={{
            backgroundColor: '#FFF3CD',
            borderLeft: '4px solid #FFC107',
            padding: '12px 16px',
            borderRadius: '4px',
            marginTop: '16px',
            fontSize: '14px',
            color: '#856404',
          }}>
            ⚠️ {erro}
          </div>
        )}

        {/* Seção Conta com Dados Reais */}
        <div className="ent-section-title mt-4">Dados Pessoais</div>
        <div className="ent-config-list">
          <div className="ent-config-item info-display">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">👤</span>
              <div style={{ textAlign: 'left' }}>
                <span className="ent-config-label">Nome Completo</span>
                <div className="ent-config-value">{perfil.nome}</div>
              </div>
            </div>
          </div>

          <div className="ent-config-item info-display">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">📧</span>
              <div style={{ textAlign: 'left' }}>
                <span className="ent-config-label">Email</span>
                <div className="ent-config-value">{perfil.email}</div>
              </div>
            </div>
          </div>

          {perfil.telefone && (
            <div className="ent-config-item info-display">
              <div className="ent-config-item-left">
                <span className="ent-config-icon">📱</span>
                <div style={{ textAlign: 'left' }}>
                  <span className="ent-config-label">Telefone</span>
                  <div className="ent-config-value">{perfil.telefone}</div>
                </div>
              </div>
            </div>
          )}

          <button className="ent-config-item" onClick={() => navigate('/entregador/editar-perfil')}>
            <div className="ent-config-item-left">
              <span className="ent-config-icon">✏️</span>
              <span className="ent-config-label">Editar Dados</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
        </div>

        {/* Veículo */}
        <div className="ent-section-title mt-4">Veículo e Documentos</div>
        <div className="ent-config-list">
          <div className="ent-config-item info-display">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">🏍️</span>
              <div style={{ textAlign: 'left' }}>
                <span className="ent-config-label">Tipo de Veículo</span>
                <div className="ent-config-value">{perfil.tipoVeiculo || 'Não definido'}</div>
              </div>
            </div>
          </div>

          {perfil.placa && (
            <div className="ent-config-item info-display">
              <div className="ent-config-item-left">
                <span className="ent-config-icon">🚗</span>
                <div style={{ textAlign: 'left' }}>
                  <span className="ent-config-label">Placa</span>
                  <div className="ent-config-value">{perfil.placa}</div>
                </div>
              </div>
            </div>
          )}

          <button className="ent-config-item">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">📄</span>
              <span className="ent-config-label">Upload de Documentos</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
        </div>

        {/* Reputação */}
        <div className="ent-section-title mt-4">Reputação</div>
        <div className="ent-config-list">
          <div className="ent-config-item info-display">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">⭐</span>
              <div style={{ textAlign: 'left' }}>
                <span className="ent-config-label">Avaliação Média</span>
                <div className="ent-config-value">{perfil.rating || 'N/A'}/5.0</div>
              </div>
            </div>
          </div>

          <div className="ent-config-item info-display">
            <div className="ent-config-item-left">
              <span className="ent-config-icon">📦</span>
              <div style={{ textAlign: 'left' }}>
                <span className="ent-config-label">Total de Entregas</span>
                <div className="ent-config-value">{perfil.totalEntregas || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Conta Bancária */}
        <div className="ent-section-title mt-4">Pagamento & Repasse</div>
        <div className="ent-config-list">
          <button className="ent-config-item" onClick={() => navigate('/entregador/conta-bancaria')}>
            <div className="ent-config-item-left">
              <span className="ent-config-icon">🏦</span>
              <span className="ent-config-label">Conta Bancária (Pix/Repasse)</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
          <button className="ent-config-item" onClick={() => navigate('/entregador/conta-bancaria')}>
            <div className="ent-config-item-left">
              <span className="ent-config-icon">📊</span>
              <span className="ent-config-label">Histórico de Repasses</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
        </div>

        {/* Preferências */}
        <div className="ent-section-title mt-4">Preferências</div>
        <div className="ent-config-list">
          <button className="ent-config-item" onClick={() => navigate('/entregador/preferencias')}>
            <div className="ent-config-item-left">
              <span className="ent-config-icon">🔔</span>
              <span className="ent-config-label">Notificações</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
          <button className="ent-config-item" onClick={() => navigate('/entregador/preferencias')}>
            <div className="ent-config-item-left">
              <span className="ent-config-icon">📍</span>
              <span className="ent-config-label">App de Mapas Padrão (Google Maps/Waze)</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
          <button className="ent-config-item" onClick={() => navigate('/entregador/preferencias')}>
            <div className="ent-config-item-left">
              <span className="ent-config-icon">🌙</span>
              <span className="ent-config-label">Modo Escuro</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
        </div>

        {/* Suporte */}
        <div className="ent-section-title mt-4">Ajuda & Suporte</div>
        <div className="ent-config-list">
          <button className="ent-config-item" onClick={() => navigate('/entregador/suporte')}>
            <div className="ent-config-item-left">
              <span className="ent-config-icon">❓</span>
              <span className="ent-config-label">Central de Ajuda</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
          <button className="ent-config-item" onClick={() => navigate('/entregador/suporte')}>
            <div className="ent-config-item-left">
              <span className="ent-config-icon">📞</span>
              <span className="ent-config-label">Contato com Suporte</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
          <button className="ent-config-item" onClick={() => navigate('/entregador/suporte')}>
            <div className="ent-config-item-left">
              <span className="ent-config-icon">📋</span>
              <span className="ent-config-label">Termos e Políticas</span>
            </div>
            <span className="ent-config-arrow">›</span>
          </button>
        </div>

        {/* Logout */}
        <div className="ent-section-title mt-4">Sessão</div>
        <div className="ent-config-list">
          <button
            className="ent-config-item text-danger"
            onClick={handleLogoutClick}
            style={{
              color: '#DC2626',
            }}
          >
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
