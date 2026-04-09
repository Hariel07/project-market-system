import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import ComercianteLayout from './ComercianteLayout';

interface Movimento {
  id: string;
  tipo: string;
  valor: number;
  descricao: string;
  createdAt: string;
}

interface CaixaAtivo {
  id: string;
  saldoInicial: number;
  saldoAtual: number;
  dataAbertura: string;
  responsavel: { nome: string };
  movimentos: Movimento[];
}

const TIPO_LABEL: Record<string, string> = {
  ABERTURA: '🔓 Abertura',
  VENDA: '🛒 Venda',
  DINHEIRO_ENTRADA: '💵 Entrada dinheiro',
  SANGRIA: '💸 Sangria',
  SUPRIMENTO: '📥 Suprimento',
  DEVOLUCAO: '↩️ Devolução',
  AJUSTE: '🔧 Ajuste',
  FECHAMENTO: '🔒 Fechamento',
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ComercianteCaixa() {
  const navigate = useNavigate();

  const [user] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('@MarketSystem:user') || '{}'); } catch { return {}; }
  });

  const comercioId: string | undefined = user?.comercioId;

  const [caixa, setCaixa] = useState<CaixaAtivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form abertura
  const [saldoInicial, setSaldoInicial] = useState('');

  // Form movimento
  const [movTipo, setMovTipo] = useState('DINHEIRO_ENTRADA');
  const [movValor, setMovValor] = useState('');
  const [movDesc, setMovDesc] = useState('');
  const [savingMov, setSavingMov] = useState(false);

  // Form fechamento
  const [saldoFinal, setSaldoFinal] = useState('');
  const [confirmandoFechamento, setConfirmandoFechamento] = useState(false);

  const fetchCaixa = useCallback(async () => {
    if (!comercioId) { setLoading(false); return; }
    try {
      const res = await api.get(`/caixa/ativo/${comercioId}`);
      setCaixa(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) setCaixa(null);
    } finally {
      setLoading(false);
    }
  }, [comercioId]);

  useEffect(() => { fetchCaixa(); }, [fetchCaixa]);

  const handleAbrir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comercioId) { alert('Comércio não identificado. Faça login novamente.'); return; }
    setSaving(true);
    try {
      await api.post('/caixa/abrir', {
        comercioId,
        saldoInicial: parseFloat(saldoInicial) || 0,
      });
      setSaldoInicial('');
      await fetchCaixa();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao abrir caixa.');
    } finally {
      setSaving(false);
    }
  };

  const handleMovimento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMov(true);
    const saida = ['SANGRIA', 'DEVOLUCAO'].includes(movTipo);
    try {
      await api.post('/caixa/movimentos', {
        comercioId,
        tipo: movTipo,
        valor: saida ? -Math.abs(parseFloat(movValor)) : Math.abs(parseFloat(movValor)),
        descricao: movDesc,
      });
      setMovValor(''); setMovDesc('');
      await fetchCaixa();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao registrar movimento.');
    } finally {
      setSavingMov(false);
    }
  };

  const handleFechar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caixa) return;
    setSaving(true);
    try {
      await api.post(`/caixa/${caixa.id}/fechar`, {
        saldoFinal: parseFloat(saldoFinal) || 0,
      });
      setCaixa(null);
      setConfirmandoFechamento(false);
      setSaldoFinal('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao fechar caixa.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ComercianteLayout title="Caixa / PDV" subtitle="Abertura e fechamento da loja">
        <div className="empty-state" style={{ padding: '3rem' }}>
          <span className="empty-icon"><span className="spinner" /></span>
          <h3>Verificando status do caixa...</h3>
        </div>
      </ComercianteLayout>
    );
  }

  if (!comercioId) {
    return (
      <ComercianteLayout title="Caixa / PDV" subtitle="Abertura e fechamento da loja">
        <div className="empty-state" style={{ padding: '3rem' }}>
          <span className="empty-icon">⚠️</span>
          <h3>Sessão inválida</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Faça logout e login novamente.</p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => navigate('/login')}>
            Ir para login
          </button>
        </div>
      </ComercianteLayout>
    );
  }

  return (
    <ComercianteLayout
      title={caixa ? '🟢 Loja Aberta' : '🔴 Loja Fechada'}
      subtitle={caixa
        ? `Caixa aberto às ${fmtTime(caixa.dataAbertura)} — saldo: ${fmt(caixa.saldoAtual ?? caixa.saldoInicial)}`
        : 'Abra o caixa para disponibilizar a loja para clientes'}
    >
      {/* ===== LOJA FECHADA ===== */}
      {!caixa && (
        <div className="animate-fade-in-up" style={{ maxWidth: 460 }}>
          <form className="card" style={{ padding: 'var(--space-6)' }} onSubmit={handleAbrir}>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>🔓 Abrir loja</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
              Ao abrir o caixa, sua loja fica visível e recebe pedidos dos clientes.
            </p>

            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label>Dinheiro em caixa agora (R$)</label>
              <input
                type="number"
                className="input"
                placeholder="Ex: 150,00"
                step="0.01"
                min="0"
                value={saldoInicial}
                onChange={e => setSaldoInicial(e.target.value)}
                autoFocus
              />
              <small style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                Valor físico em dinheiro no momento da abertura.
              </small>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={saving}>
              {saving ? <span className="btn-loading"><span className="spinner" /> Abrindo...</span> : '🔓 Abrir loja agora'}
            </button>
          </form>
        </div>
      )}

      {/* ===== LOJA ABERTA ===== */}
      {caixa && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: 'var(--space-4)' }}>

            {/* Registrar movimento */}
            <form className="card" style={{ padding: 'var(--space-5)' }} onSubmit={handleMovimento}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>📝 Registrar movimento</h3>

              <div className="input-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label>Tipo</label>
                <select className="input select-input" value={movTipo} onChange={e => setMovTipo(e.target.value)}>
                  <option value="DINHEIRO_ENTRADA">💵 Entrada de dinheiro</option>
                  <option value="SANGRIA">💸 Sangria (retirada)</option>
                  <option value="SUPRIMENTO">📥 Suprimento</option>
                  <option value="DEVOLUCAO">↩️ Devolução</option>
                  <option value="AJUSTE">🔧 Ajuste manual</option>
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label>Valor (R$)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0,00"
                  step="0.01"
                  min="0.01"
                  value={movValor}
                  onChange={e => setMovValor(e.target.value)}
                  required
                />
              </div>

              <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label>Descrição</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Pagamento fornecedor"
                  value={movDesc}
                  onChange={e => setMovDesc(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={savingMov}>
                {savingMov ? <span className="btn-loading"><span className="spinner" /> Salvando...</span> : '💾 Registrar'}
              </button>
            </form>

            {/* Movimentos do dia */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                📜 Movimentos
                <span style={{ marginLeft: '0.5rem', fontSize: 'var(--font-size-sm)', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
                  ({caixa.movimentos.length})
                </span>
              </h3>
              <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {caixa.movimentos.length === 0 && (
                  <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-4)' }}>
                    Nenhum movimento ainda
                  </p>
                )}
                {caixa.movimentos.map(m => (
                  <div key={m.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-secondary)',
                    fontSize: 'var(--font-size-sm)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{TIPO_LABEL[m.tipo] || m.tipo}</div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{m.descricao}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: m.valor >= 0 ? 'var(--color-success, #22c55e)' : 'var(--color-danger)' }}>
                      {m.valor >= 0 ? '+' : ''}{fmt(m.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fechar loja */}
          {!confirmandoFechamento ? (
            <button
              className="btn btn-outline"
              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
              onClick={() => { setConfirmandoFechamento(true); setSaldoFinal(String(caixa.saldoAtual ?? caixa.saldoInicial)); }}
            >
              🔒 Fechar loja
            </button>
          ) : (
            <form
              className="card animate-fade-in-up"
              style={{ padding: 'var(--space-5)', border: '2px solid var(--color-danger)', maxWidth: 460 }}
              onSubmit={handleFechar}
            >
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-1)' }}>🔒 Fechar loja</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                Saldo esperado: <strong>{fmt(caixa.saldoAtual ?? caixa.saldoInicial)}</strong>. A loja ficará indisponível para clientes.
              </p>

              <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label>Dinheiro contado em caixa (R$)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  value={saldoFinal}
                  onChange={e => setSaldoFinal(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmandoFechamento(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger" disabled={saving}>
                  {saving ? <span className="btn-loading"><span className="spinner" /> Fechando...</span> : '🔒 Confirmar fechamento'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </ComercianteLayout>
  );
}
