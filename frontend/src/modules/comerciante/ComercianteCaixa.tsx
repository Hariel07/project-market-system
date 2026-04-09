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
  responsavel: { nome: string };
}

interface AberturaCaixa {
  id: string;
  status: string;
  saldoInicial: number;
  saldoAtual: number;
  dataAbertura: string;
  responsavel: { nome: string };
  movimentos: Movimento[];
}

const TIPO_LABEL: Record<string, string> = {
  ABERTURA: '🔓 Abertura',
  VENDA: '🛒 Venda',
  DINHEIRO_ENTRADA: '💵 Entrada',
  SANGRIA: '💸 Sangria',
  SUPRIMENTO: '📥 Suprimento',
  DEVOLUCAO: '↩️ Devolução',
  AJUSTE: '🔧 Ajuste',
  FECHAMENTO: '🔒 Fechamento',
};

function formatPrice(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ComercianteCaixa() {
  const navigate = useNavigate();

  const [user] = useState<any>(() => {
    const s = localStorage.getItem('@MarketSystem:user');
    return s ? JSON.parse(s) : null;
  });

  const [caixaAtivo, setCaixaAtivo] = useState<AberturaCaixa | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form abertura
  const [saldoInicial, setSaldoInicial] = useState('');
  const [obsAbertura, setObsAbertura] = useState('');

  // Form movimento avulso
  const [movTipo, setMovTipo] = useState('SANGRIA');
  const [movValor, setMovValor] = useState('');
  const [movDesc, setMovDesc] = useState('');
  const [savingMov, setSavingMov] = useState(false);

  // Form fechamento
  const [saldoFinal, setSaldoFinal] = useState('');
  const [obsFechamento, setObsFechamento] = useState('');
  const [showFechamento, setShowFechamento] = useState(false);

  const comercioId = user?.comercioId;

  const fetchCaixaAtivo = useCallback(async () => {
    if (!comercioId) return;
    try {
      const res = await api.get(`/caixa/ativo/${comercioId}/`);
      setCaixaAtivo(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCaixaAtivo(null);
      }
    } finally {
      setLoading(false);
    }
  }, [comercioId]);

  useEffect(() => {
    fetchCaixaAtivo();
  }, [fetchCaixaAtivo]);

  const handleAbrirCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/caixa/abrir', {
        comercioId,
        saldoInicial: Number(saldoInicial) || 0,
        observacoes: obsAbertura || undefined,
      });
      setSaldoInicial('');
      setObsAbertura('');
      await fetchCaixaAtivo();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao abrir caixa.');
    } finally {
      setSaving(false);
    }
  };

  const handleMovimento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movValor || !movDesc) return;
    setSavingMov(true);
    const isNegativo = ['SANGRIA', 'DEVOLUCAO'].includes(movTipo);
    try {
      await api.post('/caixa/movimentos', {
        comercioId,
        tipo: movTipo,
        valor: isNegativo ? -Math.abs(Number(movValor)) : Math.abs(Number(movValor)),
        descricao: movDesc,
      });
      setMovValor('');
      setMovDesc('');
      await fetchCaixaAtivo();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao registrar movimento.');
    } finally {
      setSavingMov(false);
    }
  };

  const handleFecharCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caixaAtivo) return;
    setSaving(true);
    try {
      await api.post(`/caixa/${caixaAtivo.id}/fechar`, {
        saldoFinal: Number(saldoFinal) || 0,
        observacoes: obsFechamento || undefined,
      });
      setCaixaAtivo(null);
      setShowFechamento(false);
      setSaldoFinal('');
      setObsFechamento('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao fechar caixa.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ComercianteLayout title="Caixa / PDV" subtitle="Controle de abertura e fechamento de caixa">
        <div className="empty-state" style={{ padding: '3rem' }}>
          <span className="empty-icon"><span className="spinner" /></span>
          <h3>Carregando...</h3>
        </div>
      </ComercianteLayout>
    );
  }

  return (
    <ComercianteLayout title="Caixa / PDV" subtitle="Controle de abertura e fechamento de caixa">

      {/* === CAIXA FECHADO === */}
      {!caixaAtivo && (
        <div className="animate-fade-in-up" style={{ maxWidth: 480 }}>
          <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🔒</div>
            <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Caixa fechado</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Abra o caixa para começar a registrar vendas.
            </p>
          </div>

          <form className="card" style={{ padding: 'var(--space-6)' }} onSubmit={handleAbrirCaixa}>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>🔓 Abrir caixa</h3>
            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label>Saldo inicial (R$)</label>
              <input
                type="number"
                className="input"
                placeholder="0,00"
                step="0.01"
                min="0"
                value={saldoInicial}
                onChange={e => setSaldoInicial(e.target.value)}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label>Observação <span style={{ color: 'var(--color-text-secondary)' }}>(opcional)</span></label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Caixa principal"
                value={obsAbertura}
                onChange={e => setObsAbertura(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary btn-lg w-full ${saving ? 'loading' : ''}`}
              disabled={saving}
            >
              {saving ? <span className="btn-loading"><span className="spinner" /> Abrindo...</span> : '🔓 Abrir caixa'}
            </button>
          </form>
        </div>
      )}

      {/* === CAIXA ABERTO === */}
      {caixaAtivo && (
        <>
          {/* Status do caixa */}
          <div
            className="animate-fade-in-up"
            style={{
              background: 'var(--color-success, #22c55e)',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-5)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>🟢 Caixa aberto</div>
              <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                por {caixaAtivo.responsavel?.nome} às {formatTime(caixaAtivo.dataAbertura)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>Saldo atual</div>
              <div style={{ fontWeight: 800, fontSize: '1.5rem' }}>{formatPrice(caixaAtivo.saldoAtual ?? caixaAtivo.saldoInicial)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {/* Registrar movimento */}
            <form className="card animate-fade-in-up delay-1" style={{ padding: 'var(--space-5)' }} onSubmit={handleMovimento}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>📝 Registrar movimento</h3>

              <div className="input-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label>Tipo</label>
                <select className="input select-input" value={movTipo} onChange={e => setMovTipo(e.target.value)}>
                  <option value="DINHEIRO_ENTRADA">💵 Entrada de dinheiro</option>
                  <option value="SANGRIA">💸 Sangria</option>
                  <option value="SUPRIMENTO">📥 Suprimento</option>
                  <option value="DEVOLUCAO">↩️ Devolução</option>
                  <option value="AJUSTE">🔧 Ajuste</option>
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
                  placeholder="Descreva o motivo..."
                  value={movDesc}
                  onChange={e => setMovDesc(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`btn btn-accent btn-lg w-full ${savingMov ? 'loading' : ''}`}
                disabled={savingMov}
              >
                {savingMov ? <span className="btn-loading"><span className="spinner" /> Salvando...</span> : '💾 Registrar'}
              </button>
            </form>

            {/* Movimentos do dia */}
            <div className="card animate-fade-in-up delay-2" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>📜 Movimentos de hoje</h3>
              <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {caixaAtivo.movimentos.length === 0 && (
                  <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-4)' }}>
                    Nenhum movimento ainda
                  </p>
                )}
                {caixaAtivo.movimentos.map(m => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-secondary)',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{TIPO_LABEL[m.tipo] || m.tipo}</div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{m.descricao}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: m.valor >= 0 ? 'var(--color-success, #22c55e)' : 'var(--color-danger, #ef4444)' }}>
                      {m.valor >= 0 ? '+' : ''}{formatPrice(m.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fechar caixa */}
          <div className="animate-fade-in-up delay-3" style={{ marginTop: 'var(--space-4)' }}>
            {!showFechamento ? (
              <button className="btn btn-outline btn-danger" onClick={() => setShowFechamento(true)}>
                🔒 Fechar caixa
              </button>
            ) : (
              <form
                className="card"
                style={{ padding: 'var(--space-5)', border: '2px solid var(--color-danger, #ef4444)' }}
                onSubmit={handleFecharCaixa}
              >
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>🔒 Fechar caixa</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                  Saldo esperado: <strong>{formatPrice(caixaAtivo.saldoAtual ?? caixaAtivo.saldoInicial)}</strong>
                </p>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Saldo final contado (R$)</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="0,00"
                      step="0.01"
                      min="0"
                      value={saldoFinal}
                      onChange={e => setSaldoFinal(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Observação <span style={{ color: 'var(--color-text-secondary)' }}>(opcional)</span></label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Observações do fechamento..."
                      value={obsFechamento}
                      onChange={e => setObsFechamento(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowFechamento(false)}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-danger ${saving ? 'loading' : ''}`}
                    disabled={saving}
                  >
                    {saving ? <span className="btn-loading"><span className="spinner" /> Fechando...</span> : '🔒 Confirmar fechamento'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </ComercianteLayout>
  );
}
