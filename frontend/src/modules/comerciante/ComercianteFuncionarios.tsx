import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import ComercianteLayout from './ComercianteLayout';

interface Funcionario {
  id: string;
  role: string;
  ativo: boolean;
  createdAt: string;
  account: { nomeCompleto: string; email: string; telefone: string | null; cpf: string };
}

const ROLE_LABEL: Record<string, string> = {
  GERENTE:       '👔 Gerente',
  ESTOQUE:       '📦 Estoquista',
  CAIXA:         '🖥️ Operador de Caixa',
  AJUDANTE_GERAL:'🤝 Ajudante Geral',
  GARCOM:        '🍽️ Garçom',
};

const ROLE_COLOR: Record<string, string> = {
  GERENTE: 'badge-primary',
  ESTOQUE: 'badge-accent',
  CAIXA:   'badge-warning',
  AJUDANTE_GERAL: 'badge-secondary',
  GARCOM:  'badge-info',
};

export default function ComercianteFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Form
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('ESTOQUE');
  const [formErro, setFormErro] = useState('');

  const fetchFuncionarios = async () => {
    try {
      const res = await api.get('/funcionarios');
      setFuncionarios(Array.isArray(res.data) ? res.data : []);
    } catch {
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFuncionarios(); }, []);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErro('');
    setSaving(true);
    try {
      await api.post('/funcionarios', { cpf, nomeCompleto: nome, email, telefone, senha, role });
      setShowForm(false);
      setCpf(''); setNome(''); setEmail(''); setTelefone(''); setSenha(''); setRole('ESTOQUE');
      await fetchFuncionarios();
    } catch (err: any) {
      setFormErro(err.response?.data?.error || 'Erro ao cadastrar.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemover = async (id: string, nomeFunc: string) => {
    if (!confirm(`Remover "${nomeFunc}" da equipe?`)) return;
    setRemovingId(id);
    try {
      await api.delete(`/funcionarios/${id}`);
      setFuncionarios(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleToggleAtivo = async (f: Funcionario) => {
    try {
      const res = await api.patch(`/funcionarios/${f.id}`, { ativo: !f.ativo });
      setFuncionarios(prev => prev.map(x => x.id === f.id ? { ...x, ativo: res.data.ativo } : x));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao atualizar.');
    }
  };

  const formatCPF = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  return (
    <ComercianteLayout
      title="Equipe"
      subtitle="Gerencie os funcionários do seu comércio"
      actions={
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancelar' : '➕ Novo funcionário'}
        </button>
      }
    >
      {/* Formulário de cadastro */}
      {showForm && (
        <div className="card animate-fade-in-up" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>➕ Cadastrar funcionário</h3>
          <form onSubmit={handleCadastrar}>
            <div className="form-grid">
              <div className="input-group">
                <label>CPF *</label>
                <input className="input" type="text" placeholder="000.000.000-00" value={cpf}
                  onChange={e => setCpf(e.target.value)} required maxLength={14} />
              </div>
              <div className="input-group">
                <label>Nome completo *</label>
                <input className="input" type="text" placeholder="Nome do funcionário" value={nome}
                  onChange={e => setNome(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>E-mail</label>
                <input className="input" type="email" placeholder="email@exemplo.com" value={email}
                  onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Telefone</label>
                <input className="input" type="tel" placeholder="(11) 99999-9999" value={telefone}
                  onChange={e => setTelefone(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Senha temporária *</label>
                <input className="input" type="password" placeholder="Mínimo 6 caracteres" value={senha}
                  onChange={e => setSenha(e.target.value)} required minLength={6} />
              </div>
              <div className="input-group">
                <label>Função *</label>
                <select className="input select-input" value={role} onChange={e => setRole(e.target.value)}>
                  {Object.entries(ROLE_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {formErro && (
              <p style={{ color: 'var(--color-danger)', marginTop: 'var(--space-3)', fontSize: 'var(--font-size-sm)' }}>
                ⚠️ {formErro}
              </p>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button type="submit" className={`btn btn-primary ${saving ? 'loading' : ''}`} disabled={saving}>
                {saving ? <span className="btn-loading"><span className="spinner" /> Salvando...</span> : '✓ Cadastrar'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <span className="empty-icon"><span className="spinner" /></span>
          <h3>Carregando equipe...</h3>
        </div>
      ) : funcionarios.length === 0 ? (
        <div className="empty-state animate-fade-in-up">
          <span className="empty-icon">👥</span>
          <h3>Nenhum funcionário cadastrado</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Adicione membros à sua equipe para delegar acessos.</p>
        </div>
      ) : (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {funcionarios.map(f => (
            <div
              key={f.id}
              className="card"
              style={{
                padding: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                flexWrap: 'wrap',
                opacity: f.ativo ? 1 : 0.6,
              }}
            >
              <div
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--color-bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', flexShrink: 0,
                }}
              >
                {f.account.nomeCompleto.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700 }}>{f.account.nomeCompleto}</span>
                  <span className={`badge ${ROLE_COLOR[f.role] || 'badge-secondary'}`}>
                    {ROLE_LABEL[f.role] || f.role}
                  </span>
                  {!f.ativo && <span className="badge badge-danger">Inativo</span>}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                  CPF: {formatCPF(f.account.cpf)}
                  {f.account.email && ` • ${f.account.email}`}
                  {f.account.telefone && ` • ${f.account.telefone}`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleToggleAtivo(f)}
                  title={f.ativo ? 'Desativar acesso' : 'Reativar acesso'}
                >
                  {f.ativo ? '🔒 Desativar' : '🔓 Reativar'}
                </button>
                <button
                  className="btn btn-ghost btn-sm text-danger"
                  disabled={removingId === f.id}
                  onClick={() => handleRemover(f.id, f.account.nomeCompleto)}
                >
                  {removingId === f.id ? <span className="spinner" /> : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ComercianteLayout>
  );
}
