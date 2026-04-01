import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { api } from '../../lib/api';
import './AdminPlanos.css';

interface Plan {
  id: string;
  nome: string;
  slug: string;
  preco: number;
  descricao: string | null;
  features: string[];
  maxItens: number | null;
  maxPdvs: number | null;
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  _count?: { comercios: number };
}

interface PlatformConfig {
  assinaturaObrigatoria: boolean;
}

const emptyPlan: Omit<Plan, 'id' | '_count'> = {
  nome: '',
  slug: '',
  preco: 0,
  descricao: '',
  features: [],
  maxItens: null,
  maxPdvs: null,
  destaque: false,
  ativo: true,
  ordem: 0,
};

export default function AdminPlanos() {
  const [planos, setPlanos] = useState<Plan[]>([]);
  const [config, setConfig] = useState<PlatformConfig>({ assinaturaObrigatoria: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [newFeature, setNewFeature] = useState('');

  // Carregar planos e config
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [planosRes, configRes] = await Promise.all([
        api.get('/api/admin/planos'),
        api.get('/api/admin/config'),
      ]);
      setPlanos(planosRes.data);
      setConfig(configRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle assinatura obrigatória
  const handleToggleAssinatura = async () => {
    const novoValor = !config.assinaturaObrigatoria;
    try {
      await api.put('/api/admin/config', { assinaturaObrigatoria: novoValor });
      setConfig({ ...config, assinaturaObrigatoria: novoValor });
    } catch (error) {
      console.error('Erro ao atualizar config:', error);
      alert('Erro ao atualizar configuração.');
    }
  };

  // Abrir modal para criar/editar
  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({ ...emptyPlan, ordem: planos.length });
    setNewFeature('');
    setShowModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      nome: plan.nome,
      slug: plan.slug,
      preco: plan.preco,
      descricao: plan.descricao || '',
      features: [...plan.features],
      maxItens: plan.maxItens,
      maxPdvs: plan.maxPdvs,
      destaque: plan.destaque,
      ativo: plan.ativo,
      ordem: plan.ordem,
    });
    setNewFeature('');
    setShowModal(true);
  };

  // Salvar (criar ou editar)
  const handleSave = async () => {
    if (!form.nome.trim()) {
      alert('O nome do plano é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      if (editingPlan) {
        await api.put(`/api/admin/planos/${editingPlan.id}`, form);
      } else {
        await api.post('/api/admin/planos', form);
      }
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar plano.');
    } finally {
      setSaving(false);
    }
  };

  // Soft-delete (desativar)
  const handleToggleAtivo = async (plan: Plan) => {
    try {
      await api.put(`/api/admin/planos/${plan.id}`, { ativo: !plan.ativo });
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  // Features management
  const addFeature = () => {
    if (newFeature.trim()) {
      setForm({ ...form, features: [...form.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return (
      <AdminLayout title="Planos de Assinatura">
        <div className="admin-planos-loading">
          <div className="spinner-lg" />
          <p>Carregando planos...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Planos de Assinatura">
      <div className="admin-planos animate-fade-in-up">

        {/* Toggle global de assinatura */}
        <div className="admin-card planos-toggle-card">
          <div className="planos-toggle-content">
            <div className="planos-toggle-info">
              <h3>💳 Cobrar assinatura dos comerciantes?</h3>
              <p>
                {config.assinaturaObrigatoria
                  ? 'Ativado — comerciantes precisam escolher um plano ao se cadastrar.'
                  : 'Desativado — todos os comerciantes entram no plano Grátis automaticamente.'}
              </p>
            </div>
            <button
              className={`toggle-switch ${config.assinaturaObrigatoria ? 'active' : ''}`}
              onClick={handleToggleAssinatura}
              id="toggle-assinatura"
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

        {/* Header com botão de criar */}
        <div className="planos-header">
          <div className="planos-header-info">
            <h2>Planos cadastrados</h2>
            <span className="planos-count">{planos.length} plano{planos.length !== 1 ? 's' : ''}</span>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal} id="btn-novo-plano">
            ➕ Novo Plano
          </button>
        </div>

        {/* Cards de planos */}
        <div className="planos-grid">
          {planos.map((plan, idx) => (
            <div
              key={plan.id}
              className={`plano-card ${plan.destaque ? 'destaque' : ''} ${!plan.ativo ? 'inativo' : ''} animate-fade-in-up`}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {plan.destaque && <div className="plano-badge-destaque">⭐ Recomendado</div>}
              {!plan.ativo && <div className="plano-badge-inativo">Desativado</div>}

              <div className="plano-card-header">
                <h3 className="plano-nome">{plan.nome}</h3>
                <div className="plano-preco">
                  <span className="preco-valor">{formatPrice(plan.preco)}</span>
                  {plan.preco > 0 && <span className="preco-periodo">/mês</span>}
                </div>
              </div>

              {plan.descricao && <p className="plano-descricao">{plan.descricao}</p>}

              <ul className="plano-features">
                {plan.features.map((f, i) => (
                  <li key={i}><span className="feature-check">✓</span> {f}</li>
                ))}
              </ul>

              <div className="plano-limits">
                <span>📦 Itens: {plan.maxItens ?? '∞'}</span>
                <span>🖥️ PDVs: {plan.maxPdvs ?? '∞'}</span>
              </div>

              {plan._count && (
                <div className="plano-comercios">
                  <span>🏪 {plan._count.comercios} comércio{plan._count.comercios !== 1 ? 's' : ''} neste plano</span>
                </div>
              )}

              <div className="plano-actions">
                <button className="btn btn-outline btn-sm" onClick={() => openEditModal(plan)}>✏️ Editar</button>
                <button
                  className={`btn btn-sm ${plan.ativo ? 'btn-outline btn-danger-outline' : 'btn-outline btn-success-outline'}`}
                  onClick={() => handleToggleAtivo(plan)}
                >
                  {plan.ativo ? '🚫 Desativar' : '✅ Reativar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de criar/editar */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content plano-modal animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingPlan ? '✏️ Editar Plano' : '➕ Novo Plano'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="form-row">
                  <div className="input-group">
                    <label>Nome do plano</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ex: Básico"
                      value={form.nome}
                      onChange={e => setForm({ ...form, nome: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Slug (URL-friendly)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="ex: basico"
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Preço mensal (R$)</label>
                    <input
                      type="number"
                      className="input"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.preco}
                      onChange={e => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Ordem de exibição</label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      value={form.ordem}
                      onChange={e => setForm({ ...form, ordem: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Descrição</label>
                  <textarea
                    className="input textarea"
                    placeholder="Descrição curta do plano..."
                    value={form.descricao || ''}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Máx. Itens <span className="optional">(vazio = ilimitado)</span></label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      placeholder="Ilimitado"
                      value={form.maxItens ?? ''}
                      onChange={e => setForm({ ...form, maxItens: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Máx. PDVs <span className="optional">(vazio = ilimitado)</span></label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      placeholder="Ilimitado"
                      value={form.maxPdvs ?? ''}
                      onChange={e => setForm({ ...form, maxPdvs: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="input-group">
                  <label>Features / Benefícios</label>
                  <div className="features-editor">
                    {form.features.map((f, i) => (
                      <div key={i} className="feature-tag">
                        <span>✓ {f}</span>
                        <button className="feature-remove" onClick={() => removeFeature(i)}>✕</button>
                      </div>
                    ))}
                    <div className="feature-input-row">
                      <input
                        type="text"
                        className="input"
                        placeholder="Ex: Relatórios avançados"
                        value={newFeature}
                        onChange={e => setNewFeature(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <button className="btn btn-outline btn-sm" onClick={addFeature} type="button">+ Adicionar</button>
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="form-row checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.destaque}
                      onChange={e => setForm({ ...form, destaque: e.target.checked })}
                    />
                    <span>⭐ Plano em destaque (recomendado)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.ativo}
                      onChange={e => setForm({ ...form, ativo: e.target.checked })}
                    />
                    <span>✅ Plano ativo</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button
                  className={`btn btn-primary ${saving ? 'loading' : ''}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
