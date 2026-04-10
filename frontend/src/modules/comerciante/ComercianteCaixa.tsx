import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import ComercianteLayout from './ComercianteLayout';

interface Movimento {
  id: string;
  tipo: string;
  valor: number;
  descricao: string;
  pdvId: string | null;
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

interface Funcionario {
  id: string;
  role: string;
  ativo: boolean;
  account: { nomeCompleto: string };
}

interface PDVInfo {
  pdvId: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  fundoCaixa: number;
}

// Roles que podem operar PDV
const ROLES_PDV = ['DONO', 'GERENTE', 'CAIXA', 'AJUDANTE_GERAL', 'GARCOM'];

const ROLE_LABEL: Record<string, string> = {
  DONO: '👑 Dono', GERENTE: '👔 Gerente', CAIXA: '🖥️ Operador de Caixa',
  AJUDANTE_GERAL: '🤝 Ajudante Geral', GARCOM: '🍽️ Garçom',
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
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

  // PDVs ativos nessa sessão
  const [pdvsAtivos, setPdvsAtivos] = useState<PDVInfo[]>([]);

  // Modal seleção de funcionário
  const [showModalFuncionario, setShowModalFuncionario] = useState(false);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loadingFuncs, setLoadingFuncs] = useState(false);
  const [funcSelecionado, setFuncSelecionado] = useState<Funcionario | null>(null);
  const [fundoCaixaInput, setFundoCaixaInput] = useState('');

  // Form abertura
  const [saldoInicial, setSaldoInicial] = useState('');

  // Form movimento avulso
  const [movTipo, setMovTipo] = useState('DINHEIRO_ENTRADA');
  const [movValor, setMovValor] = useState('');
  const [movDesc, setMovDesc] = useState('');
  const [savingMov, setSavingMov] = useState(false);

  // Form fechamento
  const [saldoFinal, setSaldoFinal] = useState('');
  const [confirmandoFechamento, setConfirmandoFechamento] = useState(false);

  // Tab histórico
  const [tab, setTab] = useState<'pdvs' | 'movimentos'>('pdvs');

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

  // Recupera PDVs do sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(`pdvs_${comercioId}`);
    if (saved) {
      try { setPdvsAtivos(JSON.parse(saved)); } catch {}
    }
  }, [comercioId]);

  const savePdvs = (lista: PDVInfo[]) => {
    setPdvsAtivos(lista);
    sessionStorage.setItem(`pdvs_${comercioId}`, JSON.stringify(lista));
  };

  // Abre modal e carrega funcionários
  const handleAbrirNovoPDV = async () => {
    setShowModalFuncionario(true);
    setFuncSelecionado(null);
    setFundoCaixaInput('');
    setLoadingFuncs(true);
    try {
      const res = await api.get('/funcionarios');
      const lista: Funcionario[] = Array.isArray(res.data) ? res.data : [];
      // Inclui apenas roles que podem operar PDV (e estão ativos)
      const aptos = lista.filter(f => f.ativo && ROLES_PDV.includes(f.role));
      setFuncionarios(aptos);
    } catch {
      setFuncionarios([]);
    } finally {
      setLoadingFuncs(false);
    }
  };

  const confirmarAbrirPDV = async () => {
    if (!funcSelecionado || !comercioId) return;
    const numero = pdvsAtivos.length + 1;
    const pdvId = `PDV-${numero}`;
    const fundo = parseFloat(fundoCaixaInput) || 0;
    const totalJaAlocado = pdvsAtivos.reduce((s, p) => s + (p.fundoCaixa || 0), 0);
    const disponivel = (caixa?.saldoInicial ?? 0) - totalJaAlocado;
    if (fundo > disponivel) {
      alert(`Fundo excede o disponível. Máximo: ${fmt(disponivel)}`);
      return;
    }
    const novaInfo: PDVInfo = {
      pdvId,
      employeeId: funcSelecionado.id,
      employeeName: funcSelecionado.account.nomeCompleto,
      employeeRole: funcSelecionado.role,
      fundoCaixa: fundo,
    };
    savePdvs([...pdvsAtivos, novaInfo]);
    // Registra fundo de caixa inicial como SUPRIMENTO
    if (fundo > 0) {
      try {
        await api.post('/caixa/movimentos', {
          comercioId,
          pdvId,
          tipo: 'SUPRIMENTO',
          valor: fundo,
          descricao: `Fundo de caixa inicial — ${pdvId} (${funcSelecionado.account.nomeCompleto})`,
        });
      } catch { /* não impede abertura do PDV */ }
    }
    setShowModalFuncionario(false);
    // Abre PDV em nova aba para não bloquear o dashboard
    window.open(`/comerciante/pdv/${pdvId}`, `pdv-${pdvId}`);
  };

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
      savePdvs([]);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao fechar caixa.');
    } finally {
      setSaving(false);
    }
  };

  // Agrupa movimentos por PDV
  const movimentosPorPDV = caixa?.movimentos.reduce((acc, m) => {
    const key = m.pdvId || '_caixa';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, Movimento[]>) ?? {};

  if (loading) {
    return (
      <ComercianteLayout title="Caixa / PDV" subtitle="Abertura e fechamento da loja">
        <div className="empty-state" style={{ padding: '3rem' }}>
          <span className="empty-icon"><span className="spinner" /></span>
          <h3>Verificando caixa...</h3>
        </div>
      </ComercianteLayout>
    );
  }

  if (!comercioId) {
    return (
      <ComercianteLayout title="Caixa / PDV" subtitle="">
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
        ? `Aberto às ${fmtTime(caixa.dataAbertura)} · Saldo: ${fmt(caixa.saldoAtual ?? caixa.saldoInicial)}`
        : 'Abra o caixa para disponibilizar a loja para clientes'}
    >
      {/* ===== MODAL: Selecionar funcionário para o PDV ===== */}
      {showModalFuncionario && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-4)',
        }}>
          <div style={{
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            width: '100%', maxWidth: 460,
            boxShadow: '0 8px 48px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-1)' }}>🖥️ Quem vai operar este PDV?</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
              Selecione o funcionário com permissão para operar o terminal.
            </p>

            {loadingFuncs ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-5)', color: 'var(--color-text-secondary)' }}>
                <span className="spinner" /> Carregando equipe...
              </div>
            ) : funcionarios.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-5)', color: 'var(--color-text-secondary)' }}>
                <p>Nenhum funcionário com permissão de PDV cadastrado.</p>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: 'var(--space-3)' }}
                  onClick={() => { setShowModalFuncionario(false); navigate('/comerciante/equipe'); }}
                >
                  👥 Cadastrar funcionários
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 320, overflowY: 'auto', marginBottom: 'var(--space-4)' }}>
                {funcionarios.map(f => (
                  <div
                    key={f.id}
                    onClick={() => setFuncSelecionado(f)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${funcSelecionado?.id === f.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: funcSelecionado?.id === f.id ? 'rgba(var(--color-primary-rgb,59,130,246),0.06)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--color-bg-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 'var(--font-size-md)',
                      flexShrink: 0,
                    }}>
                      {f.account.nomeCompleto.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{f.account.nomeCompleto}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        {ROLE_LABEL[f.role] || f.role}
                      </div>
                    </div>
                    {funcSelecionado?.id === f.id && (
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Fundo de caixa */}
            {(() => {
              const totalJaAlocado = pdvsAtivos.reduce((s, p) => s + (p.fundoCaixa || 0), 0);
              const disponivel = (caixa?.saldoInicial ?? 0) - totalJaAlocado;
              const fundoInput = parseFloat(fundoCaixaInput) || 0;
              const excede = fundoInput > disponivel && disponivel >= 0;
              return (
                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>💵 Fundo de caixa / troco inicial (R$)</span>
                    <span style={{ fontWeight: 700, color: disponivel > 0 ? 'var(--color-success, #22c55e)' : 'var(--color-danger)' }}>
                      Disponível: {fmt(disponivel)}
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder={`Máx. ${fmt(disponivel)}`}
                    step="0.01"
                    min="0"
                    max={disponivel}
                    value={fundoCaixaInput}
                    onChange={e => setFundoCaixaInput(e.target.value)}
                    style={{ borderColor: excede ? 'var(--color-danger)' : undefined }}
                  />
                  {excede ? (
                    <small style={{ color: 'var(--color-danger)', marginTop: '0.2rem', display: 'block' }}>
                      ⚠️ Valor excede o disponível ({fmt(disponivel)})
                    </small>
                  ) : (
                    <small style={{ color: 'var(--color-text-secondary)', marginTop: '0.2rem', display: 'block' }}>
                      Será registrado como suprimento inicial neste PDV. Deixe em branco se não for distribuir troco agora.
                    </small>
                  )}
                </div>
              );
            })()}

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModalFuncionario(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={!funcSelecionado || (() => {
                  const totalJaAlocado = pdvsAtivos.reduce((s, p) => s + (p.fundoCaixa || 0), 0);
                  const disponivel = (caixa?.saldoInicial ?? 0) - totalJaAlocado;
                  const fundoInput = parseFloat(fundoCaixaInput) || 0;
                  return fundoInput > disponivel;
                })()}
                onClick={confirmarAbrirPDV}
              >
                🖥️ Abrir terminal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== LOJA FECHADA ===== */}
      {!caixa && (
        <div className="animate-fade-in-up" style={{ maxWidth: 460 }}>
          <form className="card" style={{ padding: 'var(--space-6)' }} onSubmit={handleAbrir}>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>🔓 Abrir loja</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
              Ao abrir o caixa, sua loja fica visível e recebe pedidos. Após abrir, libere um ou mais PDVs físicos.
            </p>
            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label>💵 Fundo total da loja (dinheiro físico disponível)</label>
              <input
                type="number" className="input" placeholder="Ex: 200,00"
                step="0.01" min="0" value={saldoInicial}
                onChange={e => setSaldoInicial(e.target.value)} autoFocus
              />
              <small style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                Este valor será distribuído como troco/fundo entre os PDVs. Informe todo o dinheiro físico disponível agora.
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
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '2px solid var(--color-border)', paddingBottom: 0 }}>
            {[
              { key: 'pdvs', label: `🖥️ Terminais (${pdvsAtivos.length})` },
              { key: 'movimentos', label: `📜 Histórico (${caixa.movimentos.length})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 'var(--space-2) var(--space-4)',
                  fontWeight: tab === t.key ? 700 : 400,
                  borderBottom: `2px solid ${tab === t.key ? 'var(--color-primary)' : 'transparent'}`,
                  marginBottom: -2,
                  color: tab === t.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: PDVs */}
          {tab === 'pdvs' && (
            <>
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <h3 style={{ fontWeight: 700 }}>🖥️ Terminais PDV ativos</h3>
                  <button className="btn btn-primary btn-sm" onClick={handleAbrirNovoPDV}>
                    ＋ Abrir novo PDV
                  </button>
                </div>

                {pdvsAtivos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-5)', color: 'var(--color-text-secondary)' }}>
                    <p>Nenhum PDV aberto ainda.</p>
                    <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.25rem' }}>
                      Clique em "Abrir novo PDV" para iniciar um terminal de venda.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    {pdvsAtivos.map(info => (
                      <div
                        key={info.pdvId}
                        style={{
                          border: '2px solid var(--color-success, #22c55e)',
                          borderRadius: 'var(--radius-lg)',
                          padding: 'var(--space-4) var(--space-5)',
                          minWidth: 180, textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🖥️</div>
                        <div style={{ fontWeight: 700 }}>{info.pdvId}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success, #22c55e)', marginTop: '0.2rem' }}>● Ativo</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '0.3rem' }}>
                          {info.employeeName}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                          {ROLE_LABEL[info.employeeRole]?.replace(/\p{Emoji}/u, '').trim() || info.employeeRole}
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: 'var(--space-3)', width: '100%' }}
                          onClick={() => window.open(`/comerciante/pdv/${info.pdvId}`, `pdv-${info.pdvId}`)}
                        >
                          Abrir terminal
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {/* Movimento avulso */}
                <form className="card" style={{ padding: 'var(--space-5)' }} onSubmit={handleMovimento}>
                  <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>📝 Movimento de caixa</h3>
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
                    <input type="number" className="input" placeholder="0,00" step="0.01" min="0.01"
                      value={movValor} onChange={e => setMovValor(e.target.value)} required />
                  </div>
                  <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label>Descrição</label>
                    <input type="text" className="input" placeholder="Motivo..."
                      value={movDesc} onChange={e => setMovDesc(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={savingMov}>
                    {savingMov ? <span className="btn-loading"><span className="spinner" /> Salvando...</span> : '💾 Registrar'}
                  </button>
                </form>

                {/* Últimos movimentos resumido */}
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>💰 Resumo do caixa</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Saldo inicial</span>
                      <span>{fmt(caixa.saldoInicial)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Total de vendas</span>
                      <span style={{ color: 'var(--color-success, #22c55e)' }}>
                        {fmt(caixa.movimentos.filter(m => m.tipo === 'VENDA').reduce((s, m) => s + m.valor, 0))}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Sangrias / Retiradas</span>
                      <span style={{ color: 'var(--color-danger)' }}>
                        {fmt(Math.abs(caixa.movimentos.filter(m => m.valor < 0 && m.tipo !== 'ABERTURA').reduce((s, m) => s + m.valor, 0)))}
                      </span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Saldo atual</span>
                      <span style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-md)' }}>{fmt(caixa.saldoAtual ?? caixa.saldoInicial)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tab: Histórico de movimentos */}
          {tab === 'movimentos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {caixa.movimentos.length === 0 ? (
                <div className="empty-state" style={{ padding: '3rem' }}>
                  <span className="empty-icon">📜</span>
                  <h3>Nenhum movimento ainda</h3>
                </div>
              ) : (
                <>
                  {/* Agrupado por PDV */}
                  {Object.entries(movimentosPorPDV)
                    .sort(([a]) => (a === '_caixa' ? 1 : -1))
                    .map(([key, movs]) => (
                      <div key={key} className="card" style={{ padding: 'var(--space-4)' }}>
                        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{key === '_caixa' ? '🏪 Caixa principal' : `🖥️ ${key}`}</span>
                          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                            {movs.length} movimentos
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          {movs.map(m => (
                            <div key={m.id} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: 'var(--space-2) var(--space-3)',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--color-bg-secondary)',
                              fontSize: 'var(--font-size-sm)',
                            }}>
                              <div>
                                <div style={{ fontWeight: 600 }}>{m.tipo}</div>
                                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                  {m.descricao} · {fmtDateTime(m.createdAt)}
                                </div>
                              </div>
                              <span style={{ fontWeight: 700, color: m.valor >= 0 ? 'var(--color-success, #22c55e)' : 'var(--color-danger)' }}>
                                {m.valor >= 0 ? '+' : ''}{fmt(m.valor)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: 700, marginTop: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          Subtotal:{' '}
                          <span style={{ color: movs.reduce((s, m) => s + m.valor, 0) >= 0 ? 'var(--color-success, #22c55e)' : 'var(--color-danger)' }}>
                            {fmt(movs.reduce((s, m) => s + m.valor, 0))}
                          </span>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          )}

          {/* Fechar loja */}
          <div>
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
                  Saldo esperado: <strong>{fmt(caixa.saldoAtual ?? caixa.saldoInicial)}</strong>. Todos os PDVs serão encerrados. A loja ficará indisponível.
                </p>
                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label>Dinheiro contado em caixa (R$)</label>
                  <input type="number" className="input" placeholder="0,00" step="0.01" min="0"
                    value={saldoFinal} onChange={e => setSaldoFinal(e.target.value)} required autoFocus />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setConfirmandoFechamento(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-danger" disabled={saving}>
                    {saving ? <span className="btn-loading"><span className="spinner" /> Fechando...</span> : '🔒 Confirmar fechamento'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </ComercianteLayout>
  );
}
