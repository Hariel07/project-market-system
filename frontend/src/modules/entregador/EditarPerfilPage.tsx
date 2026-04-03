import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EntregadorLayout from './EntregadorLayout';
import { useAuthProtected, useAuthUser } from '../../lib/useAuth';
import { api } from '../../lib/api';
import './EditarPerfilPage.css';

interface PerfilEntregador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  placa?: string;
  tipoVeiculo?: string;
}

export default function EditarPerfilPage() {
  const navigate = useNavigate();
  useAuthProtected(['ENTREGADOR']);
  const { userId } = useAuthUser();

  const [formData, setFormData] = useState<PerfilEntregador>({
    id: '',
    nome: '',
    email: '',
    telefone: '',
    placa: '',
    tipoVeiculo: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Carregar dados atuais do perfil
  useEffect(() => {
    if (!userId) return;

    api.get(`/api/perfil/${userId}`)
      .then((res: any) => {
        setFormData(res.data);
        setErro(null);
      })
      .catch((err: any) => {
        console.error('Erro ao carregar perfil:', err);
        setErro('Erro ao carregar dados do perfil');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSucesso(false);
    setErro(null);

    try {
      // Atualmente, enviamos para a API (pode não ter endpoint PUT, mas está pronto)
      // await api.put(`/api/perfil/${userId}`, formData);
      
      // Fallback: salvar no localStorage por hora
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userPhone', formData.telefone || '');
      localStorage.setItem('userName', formData.nome);

      setSucesso(true);
      setTimeout(() => navigate('/entregador/config'), 1500);
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EntregadorLayout title="Editar Perfil">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Carregando dados...</p>
        </div>
      </EntregadorLayout>
    );
  }

  return (
    <EntregadorLayout title="Editar Perfil">
      <div className="editar-perfil-container animate-fade-in-up">
        <form onSubmit={handleSubmit} className="perfil-form">
          {erro && (
            <div className="alert alert-error">
              ❌ {erro}
            </div>
          )}

          {sucesso && (
            <div className="alert alert-success">
              ✅ Dados atualizados com sucesso!
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nome">Nome Completo *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone || ''}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="form-group">
            <label htmlFor="placa">Placa do Veículo</label>
            <input
              type="text"
              id="placa"
              name="placa"
              value={formData.placa || ''}
              onChange={handleChange}
              placeholder="ABC-1234"
              maxLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipoVeiculo">Tipo de Veículo</label>
            <select
              id="tipoVeiculo"
              name="tipoVeiculo"
              value={formData.tipoVeiculo || ''}
              onChange={(e) => setFormData({ ...formData, tipoVeiculo: e.target.value })}
            >
              <option value="">Selecione um tipo</option>
              <option value="Moto">🏍️ Moto</option>
              <option value="Bicicleta">🚲 Bicicleta</option>
              <option value="Carro">🚗 Carro</option>
              <option value="Van">🚐 Van</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/entregador/config')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? '⏳ Salvando...' : '💾 Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </EntregadorLayout>
  );
}
