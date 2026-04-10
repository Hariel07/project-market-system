import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import ImageUpload from '../../shared/components/ImageUpload';
import HorarioSelector from '../../shared/components/HorarioSelector';
import { api } from '../../lib/api';
import './ComercianteConfig.css';

export default function ComerciantePerfilConfig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savedInfo, setSavedInfo] = useState(false);

  const [form, setForm] = useState({
    nomeFantasia: '',
    segmento: '',
    descricao: '',
    logoUrl: '',
    capaUrl: '',
    taxaEntrega: 0,
    tempoMedio: '',
    isOpen: true,
    horarioAtendimento: '',
    impressaoAutomatica: false,
    copiasImpressao: 1,
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
        descricao: data.descricao || '',
        logoUrl: data.logoUrl || '',
        capaUrl: data.capaUrl || '',
        taxaEntrega: data.taxaEntrega || 0,
        tempoMedio: data.tempoMedio || '',
        isOpen: data.isOpen !== false,
        horarioAtendimento: data.horarioAtendimento || '',
        impressaoAutomatica: data.impressaoAutomatica || false,
        copiasImpressao: data.copiasImpressao || 1,
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    setSavedInfo(false);
    try {
      await api.put('comercios/me', {
        nomeFantasia: form.nomeFantasia,
        segmento: form.segmento,
        descricao: form.descricao,
        taxaEntrega: Number(form.taxaEntrega),
        tempoMedio: form.tempoMedio,
      });
      setSavedInfo(true);
      setTimeout(() => setSavedInfo(false), 3000);
      window.dispatchEvent(new CustomEvent('comercio:updated', {
        detail: { nomeFantasia: form.nomeFantasia, segmento: form.segmento }
      }));
    } catch {
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSavingInfo(false);
    }
  };

  // Auto-save logo immediately after upload + notify sidebar
  const handleLogoUploaded = async (url: string) => {
    setForm(f => ({ ...f, logoUrl: url }));
    try {
      await api.put('comercios/me', { logoUrl: url || null });
      window.dispatchEvent(new CustomEvent('comercio:logoUpdated', { detail: { logoUrl: url } }));
    } catch {}
  };

  // Auto-save capa immediately after upload
  const handleCapaUploaded = async (url: string) => {
    setForm(f => ({ ...f, capaUrl: url }));
    try {
      await api.put('comercios/me', { capaUrl: url || null });
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('comercios/me', {
        ...form,
        taxaEntrega: Number(form.taxaEntrega),
      });
      alert('Configurações atualizadas com sucesso!');
      navigate('/comerciante/config');
    } catch {
      alert('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <ComercianteLayout title="Perfil" subtitle="Carregando">
      <p>Carregando...</p>
    </ComercianteLayout>
  );

  return (
    <ComercianteLayout title="Perfil do Comércio" subtitle="Edite informações e horários da loja">
      <div className="config-sections animate-fade-in-up delay-1">
        <form onSubmit={handleSubmit} className="auth-form" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>

          {/* Status de Operação */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Status de Operação</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {form.isOpen ? 'Sua loja está aberta.' : 'Sua loja está fechada.'} Para abrir ou fechar, use o Caixa.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/comerciante/caixa')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                background: form.isOpen ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                padding: '0.8rem 1.2rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontWeight: 700, color: form.isOpen ? '#16a34a' : '#dc2626', fontSize: '0.9rem',
              }}
            >
              {form.isOpen ? '🟢 Loja Aberta' : '🔴 Loja Fechada'}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>→ Ir ao Caixa</span>
            </button>
          </div>

          {/* Horário */}
          <HorarioSelector
            value={form.horarioAtendimento}
            onChange={val => setForm({ ...form, horarioAtendimento: val })}
          />

          {/* Nome e Segmento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="input-group">
              <label>Nome Fantasia</label>
              <input type="text" className="input" value={form.nomeFantasia}
                onChange={e => setForm({ ...form, nomeFantasia: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Segmento</label>
              <input type="text" className="input" value={form.segmento}
                onChange={e => setForm({ ...form, segmento: e.target.value })} required />
            </div>
          </div>

          {/* Taxa e Tempo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Taxa de Entrega Base (R$)</label>
              <input type="number" step="0.50" min="0" className="input" value={form.taxaEntrega}
                onChange={e => setForm({ ...form, taxaEntrega: Number(e.target.value) })} required />
            </div>
            <div className="input-group">
              <label>Tempo Médio de Entrega</label>
              <input type="text" className="input" placeholder="Ex: 30-45 min" value={form.tempoMedio}
                onChange={e => setForm({ ...form, tempoMedio: e.target.value })} required />
            </div>
          </div>

          {/* Descrição */}
          <div className="input-group">
            <label>Descrição do Comércio</label>
            <textarea
              className="input" rows={3}
              placeholder="Ex: Mercado de bairro com produtos frescos e preços acessíveis..."
              value={form.descricao}
              onChange={e => setForm({ ...form, descricao: e.target.value })}
              style={{ borderRadius: '16px', resize: 'none' }}
            />
            <small style={{ color: 'var(--text-secondary)' }}>Visível para os clientes na página da sua loja.</small>
          </div>

          {/* Salvar dados da loja */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            {savedInfo && (
              <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>✅ Salvo!</span>
            )}
            <button
              type="button"
              onClick={handleSaveInfo}
              disabled={savingInfo}
              style={{
                background: savingInfo ? '#94a3b8' : '#1d4ed8',
                color: '#fff',
                border: 'none', borderRadius: '12px',
                padding: '0.65rem 1.4rem',
                fontWeight: 700, fontSize: '0.9rem',
                cursor: savingInfo ? 'not-allowed' : 'pointer',
                boxShadow: savingInfo ? 'none' : '0 3px 10px rgba(29,78,216,0.3)',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              {savingInfo ? 'Salvando...' : '💾 Salvar informações'}
            </button>
          </div>

          {/* Imagens */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <ImageUpload
                label="Logotipo"
                currentUrl={form.logoUrl}
                onUploaded={handleLogoUploaded}
                aspect="square"
              />
              <small style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Salvo automaticamente
              </small>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <ImageUpload
                label="Imagem de Capa"
                currentUrl={form.capaUrl}
                onUploaded={handleCapaUploaded}
                aspect="wide"
              />
              <small style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Salvo automaticamente
              </small>
            </div>
          </div>

          {/* Configurações de Impressão */}
          <div style={{ marginTop: '1.5rem', padding: '1.2rem', background: 'var(--color-surface, #f8fafc)', borderRadius: '16px', border: '1px solid var(--color-border-light, #e2e8f0)' }}>
            <h4 style={{ margin: '0 0 0.8rem', fontSize: '1rem' }}>🖨️ Impressão de Cupom Fiscal</h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', marginBottom: '0.8rem' }}>
              <input
                type="checkbox"
                checked={form.impressaoAutomatica}
                onChange={e => setForm({ ...form, impressaoAutomatica: e.target.checked })}
                style={{ width: '1.3rem', height: '1.3rem' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Imprimir automaticamente ao concluir pedido</span>
            </label>
            {form.impressaoAutomatica && (
              <div className="input-group" style={{ maxWidth: '200px' }}>
                <label>Cópias por pedido</label>
                <input
                  type="number" min="1" max="5" className="input"
                  value={form.copiasImpressao}
                  onChange={e => setForm({ ...form, copiasImpressao: Math.max(1, Math.min(5, Number(e.target.value))) })}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-block ${saving ? 'loading' : ''}`}
            disabled={saving}
            style={{ marginTop: '2rem', padding: '1.2rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, background: 'var(--primary)', color: '#fff', border: 'none' }}
          >
            {saving ? 'Gravando...' : 'Salvar Perfil do Comércio'}
          </button>
        </form>
      </div>
    </ComercianteLayout>
  );
}
