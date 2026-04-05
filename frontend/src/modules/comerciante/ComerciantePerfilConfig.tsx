import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import { api } from '../../lib/api';
import './ComercianteConfig.css';

export default function ComerciantePerfilConfig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nomeFantasia: '',
    segmento: '',
    logoUrl: '',
    taxaEntrega: 0,
    tempoMedio: '',
    isOpen: true,
    horarioAtendimento: ''
  });

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const { data } = await api.get('comercios/me');
      setForm({
        nomeFantasia: data.nomeFantasia || '',
        segmento: data.segmento || '',
        logoUrl: data.logoUrl || '',
        taxaEntrega: data.taxaEntrega || 0,
        tempoMedio: data.tempoMedio || '',
        isOpen: data.isOpen !== false, // default true
        horarioAtendimento: data.horarioAtendimento || ''
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (newStatus: boolean) => {
    const updatedForm = { ...form, isOpen: newStatus };
    setForm(updatedForm); // Update UI immediately

    try {
      // Background save to prevent the user from having to click "Save Profile" for a simple toggle
      await api.put('comercios/me', {
        ...updatedForm,
        taxaEntrega: Number(updatedForm.taxaEntrega)
      });
    } catch (error) {
      console.error('Falha ao salvar o status:', error);
      // Revert if failed
      setForm({ ...updatedForm, isOpen: !newStatus });
      alert('Erro ao alterar o status da loja.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('comercios/me', {
        ...form,
        taxaEntrega: Number(form.taxaEntrega)
      });
      alert('Configurações atualizadas com sucesso!');
      navigate('/comerciante/config');
    } catch (error) {
      alert('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ComercianteLayout title="Perfil" subtitle="Carregando"><p>Carregando...</p></ComercianteLayout>;

  return (
    <ComercianteLayout title="Perfil do Comércio" subtitle="Edite informações e horários da loja">
      <div className="config-sections animate-fade-in-up delay-1">
        <form onSubmit={handleSubmit} className="auth-form" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Status de Operação</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Controle se você está aberto para receber pedidos.</p>
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', background: form.isOpen ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.8rem 1.2rem', borderRadius: '20px', transition: 'all 0.3s' }}>
              <input 
                type="checkbox" 
                checked={form.isOpen} 
                onChange={e => handleToggleStatus(e.target.checked)} 
                style={{ width: '1.5rem', height: '1.5rem', accentColor: form.isOpen ? 'var(--success)' : 'var(--danger)' }}
              />
              <span style={{ fontWeight: 700, color: form.isOpen ? 'var(--success)' : 'var(--danger)' }}>
                {form.isOpen ? 'Loja Aberta' : 'Loja Fechada'}
              </span>
            </label>
          </div>

          <div className="input-group">
            <label>Horário de Atendimento (Exibido se fechado)</label>
            <textarea 
              className="input" 
              rows={2} 
              placeholder="Ex: Seg a Sex: 08:00h às 18:00h - Sáb e Dom: Fechado"
              value={form.horarioAtendimento}
              onChange={e => setForm({...form, horarioAtendimento: e.target.value})}
              style={{ borderRadius: '16px', resize: 'none' }}
            />
            <small style={{ color: 'var(--text-secondary)' }}>Esta mensagem aparecerá como "Placa" em cima da sua vitrine quando estiver com o status Fechado.</small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="input-group">
              <label>Nome Fantasia</label>
              <input type="text" className="input" value={form.nomeFantasia} onChange={e => setForm({...form, nomeFantasia: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Segmento</label>
              <input type="text" className="input" value={form.segmento} onChange={e => setForm({...form, segmento: e.target.value})} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Taxa de Entrega Base (R$)</label>
              <input type="number" step="0.50" min="0" className="input" value={form.taxaEntrega} onChange={e => setForm({...form, taxaEntrega: Number(e.target.value)})} required />
            </div>
            <div className="input-group">
              <label>Tempo Médio de Entrega</label>
              <input type="text" className="input" placeholder="Ex: 30-45 min" value={form.tempoMedio} onChange={e => setForm({...form, tempoMedio: e.target.value})} required />
            </div>
          </div>

          <div className="input-group">
            <label>URL do Logotipo (Opcional)</label>
            <input type="text" className="input" value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})} />
          </div>

          <button type="submit" className={`btn btn-block ${saving ? 'loading' : ''}`} disabled={saving} style={{ marginTop: '2rem', padding: '1.2rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, background: 'var(--primary)', color: '#fff', border: 'none' }}>
            {saving ? 'Gravando...' : 'Salvar Perfil do Comércio'}
          </button>
        </form>
      </div>
    </ComercianteLayout>
  );
}
