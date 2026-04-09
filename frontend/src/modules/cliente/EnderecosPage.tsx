import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { api } from '../../lib/api';
import './PerfilPage.css'; // reaproveitar alguns estilos base
import './EnderecosUi.css';

interface Endereco {
  id: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pontoReferencia: string;
  isPrincipal: boolean;
  rotulo: string;
  icone: string;
}

export default function EnderecosPage() {
  const navigate = useNavigate();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnderecos = async () => {
    try {
      setLoading(true);
      const res = await api.get('perfil/enderecos');
      setEnderecos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      setEnderecos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnderecos();
  }, []);

  const handleSetPrincipal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/perfil/enderecos/${id}/principal`);
      fetchEnderecos();
    } catch (error) {
      alert('Erro ao alterar endereço principal.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir este endereço?')) return;
    try {
      await api.delete(`/perfil/enderecos/${id}`);
      fetchEnderecos();
    } catch (error) {
      alert('Erro ao excluir endereço.');
    }
  };

  return (
    <div className="perfil-page" style={{ paddingBottom: '80px' }}>
      <TopBar title="Meus Endereços" showBack showCart={false} />
      
      <main className="page-content">
        <div className="container" style={{ padding: '1rem' }}>
          
          <button 
            className="btn-adicionar-endereco animate-fade-in-up" 
            onClick={() => navigate('/enderecos/novo')}
          >
            <span className="plus-icon">+</span> 
            Adicionar Novo Endereço
          </button>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <span className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '3rem', height: '3rem', borderWidth: '4px' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Carregando seus locais...</p>
            </div>
          ) : enderecos.length === 0 ? (
            <div className="animate-fade-in-up delay-1" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 1rem', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
              <span style={{ fontSize: '3rem', opacity: 0.5, display: 'block', marginBottom: '1rem' }}>🗺️</span>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Nenhum endereço salvo</h2>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>Você ainda não tem endereços cadastrados. Adicione o seu primeiro local para agilizar suas próximas compras!</p>
            </div>
          ) : (
            <div className="enderecos-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {enderecos.map((end, index) => (
                <div 
                  key={end.id} 
                  className={`endereco-card-premium animate-fade-in-up delay-${Math.min(index + 1, 5)} ${end.isPrincipal ? 'principal' : ''}`}
                  onClick={() => navigate(`/enderecos/editar/${end.id}`)}
                >
                  {end.isPrincipal && (
                    <div className="badge-principal">Padrão</div>
                  )}
                  
                  <div className="endereco-card-header">
                    <span className="endereco-icon-wrapper">
                      {end.icone}
                    </span>
                    <div className="endereco-details">
                      <h3>{end.rotulo}</h3>
                      <p className="street">
                        {end.logradouro}, {end.numero || 'S/N'}
                      </p>
                      <p className="subinfo">
                        {end.complemento && <span>{end.complemento} • </span>}
                        {end.bairro}<br />
                        <span style={{ opacity: 0.8 }}>{end.cidade} - {end.estado}</span>
                      </p>
                    </div>
                  </div>

                  <div className="endereco-actions">
                    {!end.isPrincipal && (
                      <button 
                        className="btn-card-action"
                        onClick={(e) => handleSetPrincipal(end.id, e)}
                      >
                        Tornar Principal
                      </button>
                    )}
                    <button 
                      className="btn-card-delete"
                      onClick={(e) => handleDelete(end.id, e)}
                    >
                      <span>🗑️</span> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
