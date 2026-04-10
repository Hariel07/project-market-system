import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { playBeepSound } from '../../lib/sounds';
import CupomFiscal from '../../shared/components/CupomFiscal';
import './ComerciantePDV.css';

interface Produto {
  id: string;
  nome: string;
  precoVenda: number;
  unidade: string;
  estoque: number;
  ativo: boolean;
  categoria: { nome: string } | null;
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface ResultadoVenda {
  ok: boolean;
  total: number;
  troco: number;
  formaPagamento: string;
}

interface PDVInfo {
  pdvId: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  fundoCaixa: number;
}

interface Funcionario {
  id: string;
  role: string;
  ativo: boolean;
  account: { nomeCompleto: string };
}

const ROLE_LABEL: Record<string, string> = {
  DONO: 'Dono', GERENTE: 'Gerente', CAIXA: 'Operador de Caixa',
  AJUDANTE_GERAL: 'Ajudante Geral', GARCOM: 'Garçom',
};

const ROLES_PDV = ['DONO', 'GERENTE', 'CAIXA', 'AJUDANTE_GERAL', 'GARCOM'];

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>
      {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

// ── Modal genérico de overlay ──────────────────────────
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-4)',
    }} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        width: '100%', maxWidth: 420,
        boxShadow: '0 8px 48px rgba(0,0,0,0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontWeight: 700, margin: 0 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0 0.5rem' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ComerciantePDV() {
  const { pdvId } = useParams<{ pdvId: string }>();
  const navigate = useNavigate();

  const [user] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('@MarketSystem:user') || '{}'); } catch { return {}; }
  });

  const comercioId: string | undefined = user?.comercioId;

  // Info do PDV
  const [pdvInfo, setPdvInfo] = useState<PDVInfo | null>(null);

  // Produtos
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);

  // Busca
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<Produto[]>([]);
  const [showResultados, setShowResultados] = useState(false);
  const buscaRef = useRef<HTMLInputElement>(null);
  const resultadosRef = useRef<HTMLDivElement>(null);

  // Carrinho
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [ultimaVendaItens, setUltimaVendaItens] = useState<ItemCarrinho[]>([]);

  // Pagamento
  const [formaPagamento, setFormaPagamento] = useState<'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX'>('DINHEIRO');
  const [valorRecebido, setValorRecebido] = useState('');
  const [finalizando, setFinalizando] = useState(false);

  // Resultado da venda
  const [resultado, setResultado] = useState<ResultadoVenda | null>(null);

  // Modal movimentação
  const [showMovModal, setShowMovModal] = useState(false);
  const [movTipo, setMovTipo] = useState<'SANGRIA' | 'SUPRIMENTO'>('SANGRIA');
  const [movValor, setMovValor] = useState('');
  const [movDesc, setMovDesc] = useState('');
  const [savingMov, setSavingMov] = useState(false);

  // Modal trocar operador
  const [showTrocarModal, setShowTrocarModal] = useState(false);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loadingFuncs, setLoadingFuncs] = useState(false);
  const [novoFunc, setNovoFunc] = useState<Funcionario | null>(null);
  const [trocando, setTrocando] = useState(false);

  // Modal fechar PDV
  const [confirmandoFechar, setConfirmandoFechar] = useState(false);

  const total = carrinho.reduce((s, i) => s + i.subtotal, 0);
  const troco = formaPagamento === 'DINHEIRO' && parseFloat(valorRecebido) > 0
    ? Math.max(0, parseFloat(valorRecebido) - total)
    : 0;

  // Lê info do PDV do sessionStorage
  useEffect(() => {
    if (!comercioId || !pdvId) return;
    const stored = sessionStorage.getItem(`pdvs_${comercioId}`);
    if (stored) {
      try {
        const lista: PDVInfo[] = JSON.parse(stored);
        const info = lista.find(p => p.pdvId === pdvId);
        if (info) setPdvInfo(info);
      } catch {}
    }
  }, [comercioId, pdvId]);

  // Carrega produtos
  useEffect(() => {
    if (!comercioId) { setLoadingProdutos(false); return; }
    api.get('produtos', { params: { ativo: true } })
      .then(res => setProdutos(Array.isArray(res.data) ? res.data.filter((p: Produto) => p.ativo) : []))
      .catch(() => setProdutos([]))
      .finally(() => setLoadingProdutos(false));
  }, [comercioId]);

  // Auto-foca busca
  useEffect(() => { setTimeout(() => buscaRef.current?.focus(), 300); }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        resultadosRef.current && !resultadosRef.current.contains(e.target as Node) &&
        buscaRef.current && !buscaRef.current.contains(e.target as Node)
      ) setShowResultados(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtro busca
  useEffect(() => {
    if (!busca.trim()) { setResultados([]); setShowResultados(false); return; }
    const q = busca.toLowerCase();
    const found = produtos.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.categoria?.nome || '').toLowerCase().includes(q)
    ).slice(0, 8);
    setResultados(found);
    setShowResultados(found.length > 0);
  }, [busca, produtos]);

  const adicionarAoCarrinho = useCallback((produto: Produto) => {
    playBeepSound();
    setCarrinho(prev => {
      const ex = prev.find(i => i.produto.id === produto.id);
      if (ex) {
        return prev.map(i => i.produto.id === produto.id
          ? { ...i, quantidade: i.quantidade + 1, subtotal: (i.quantidade + 1) * i.precoUnitario }
          : i
        );
      }
      return [...prev, { produto, quantidade: 1, precoUnitario: produto.precoVenda, subtotal: produto.precoVenda }];
    });
    setBusca('');
    setShowResultados(false);
    setTimeout(() => buscaRef.current?.focus(), 50);
  }, []);

  const handleBuscaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && resultados.length > 0) adicionarAoCarrinho(resultados[0]);
    if (e.key === 'Escape') { setShowResultados(false); setBusca(''); }
  };

  const alterarQtd = (id: string, delta: number) => {
    setCarrinho(prev => prev
      .map(i => i.produto.id === id
        ? { ...i, quantidade: i.quantidade + delta, subtotal: (i.quantidade + delta) * i.precoUnitario }
        : i
      )
      .filter(i => i.quantidade > 0)
    );
  };

  // ── Finalizar venda ───────────────────────────────────
  const handleFinalizar = async () => {
    if (carrinho.length === 0 || !comercioId) return;
    if (formaPagamento === 'DINHEIRO') {
      const rec = parseFloat(valorRecebido);
      if (!rec || rec < total) { alert(`Valor recebido insuficiente. Total: ${fmt(total)}`); return; }
    }
    setFinalizando(true);
    try {
      const res = await api.post('/caixa/venda', {
        comercioId, pdvId,
        itens: carrinho.map(i => ({ produtoId: i.produto.id, quantidade: i.quantidade, precoUnitario: i.precoUnitario })),
        formaPagamento,
        valorRecebido: parseFloat(valorRecebido) || total,
      });
      setResultado(res.data);
      setUltimaVendaItens([...carrinho]);
      setCarrinho([]);
      setValorRecebido('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao finalizar venda.');
    } finally {
      setFinalizando(false);
    }
  };

  // ── Registrar movimentação (sangria/suprimento) ───────
  const handleMovimento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comercioId) return;
    setSavingMov(true);
    const valor = parseFloat(movValor);
    const valorFinal = movTipo === 'SANGRIA' ? -Math.abs(valor) : Math.abs(valor);
    try {
      await api.post('/caixa/movimentos', {
        comercioId,
        pdvId,
        tipo: movTipo,
        valor: valorFinal,
        descricao: movDesc || (movTipo === 'SANGRIA' ? 'Sangria de caixa' : 'Suprimento de caixa'),
      });
      setMovValor('');
      setMovDesc('');
      setShowMovModal(false);
      alert(`${movTipo === 'SANGRIA' ? 'Sangria' : 'Suprimento'} registrado com sucesso!`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao registrar movimentação.');
    } finally {
      setSavingMov(false);
    }
  };

  // ── Trocar operador ───────────────────────────────────
  const abrirTrocarModal = async () => {
    setShowTrocarModal(true);
    setNovoFunc(null);
    setLoadingFuncs(true);
    try {
      const res = await api.get('/funcionarios');
      const lista: Funcionario[] = Array.isArray(res.data) ? res.data : [];
      setFuncionarios(lista.filter(f => f.ativo && ROLES_PDV.includes(f.role)));
    } catch {
      setFuncionarios([]);
    } finally {
      setLoadingFuncs(false);
    }
  };

  const confirmarTroca = () => {
    if (!novoFunc || !comercioId || !pdvId) return;
    setTrocando(true);
    const stored = sessionStorage.getItem(`pdvs_${comercioId}`);
    if (stored) {
      try {
        const lista: PDVInfo[] = JSON.parse(stored);
        const nova = lista.map(p =>
          p.pdvId === pdvId
            ? { ...p, employeeId: novoFunc.id, employeeName: novoFunc.account.nomeCompleto, employeeRole: novoFunc.role }
            : p
        );
        sessionStorage.setItem(`pdvs_${comercioId}`, JSON.stringify(nova));
        const atualizado = nova.find(p => p.pdvId === pdvId);
        if (atualizado) setPdvInfo(atualizado);
      } catch {}
    }
    setTrocando(false);
    setShowTrocarModal(false);
  };

  // ── Fechar PDV ────────────────────────────────────────
  const fecharPDV = async () => {
    if (!comercioId || !pdvId) { navigate('/comerciante/caixa'); return; }

    // Registra evento de fechamento no histórico do caixa
    try {
      await api.post('/caixa/movimentos', {
        comercioId,
        pdvId,
        tipo: 'FECHAMENTO',
        valor: 0,
        descricao: `Fechamento ${pdvId}${pdvInfo ? ` — operador: ${pdvInfo.employeeName}` : ''}`,
      });
    } catch { /* não impede o fechamento */ }

    // Remove do sessionStorage
    const stored = sessionStorage.getItem(`pdvs_${comercioId}`);
    if (stored) {
      try {
        const lista: PDVInfo[] = JSON.parse(stored);
        sessionStorage.setItem(`pdvs_${comercioId}`, JSON.stringify(lista.filter(p => p.pdvId !== pdvId)));
      } catch {}
    }
    navigate('/comerciante/caixa');
  };

  // ── Tela de resultado ─────────────────────────────────
  if (resultado) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <div style={{ maxWidth: 440, width: '100%', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', border: '2px solid var(--color-success, #22c55e)', padding: 'var(--space-8)', textAlign: 'center', boxShadow: '0 8px 40px rgba(34,197,94,0.15)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-3)' }}>✅</div>
          <h2 style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>Venda concluída!</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-success, #22c55e)', marginBottom: 'var(--space-4)' }}>
            {fmt(resultado.total)}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            Pagamento: <strong>
              {resultado.formaPagamento === 'DINHEIRO' ? '💵 Dinheiro'
                : resultado.formaPagamento === 'CARTAO_CREDITO' ? '💳 Crédito'
                : resultado.formaPagamento === 'CARTAO_DEBITO' ? '🏧 Débito'
                : '📱 PIX'}
            </strong>
          </div>
          {resultado.formaPagamento === 'DINHEIRO' && resultado.troco > 0 && (
            <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid var(--color-success, #22c55e)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Troco</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--color-success, #22c55e)' }}>{fmt(resultado.troco)}</div>
            </div>
          )}
          {/* Cupom fiscal da venda */}
          <div style={{ marginBottom: 'var(--space-4)', textAlign: 'left' }}>
            <CupomFiscal
              pedidoId={`PDV-${Date.now()}`}
              comercioNome={pdvInfo?.employeeName ? `PDV ${pdvId}` : 'Venda Presencial'}
              clienteNome="Cliente balcão"
              itens={ultimaVendaItens.map(i => ({ nome: i.produto.nome, quantidade: i.quantidade, precoUnitario: i.precoUnitario }))}
              subtotal={resultado.total}
              taxaEntrega={0}
              total={resultado.total}
              metodoPagto={resultado.formaPagamento}
              data={new Date().toISOString()}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => { setResultado(null); setTimeout(() => buscaRef.current?.focus(), 100); }}>
              ➕ Nova venda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Modal: Confirmar fechar PDV ───────────────────────
  if (confirmandoFechar) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <div style={{ maxWidth: 400, width: '100%', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', border: '2px solid var(--color-danger)', padding: 'var(--space-7)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🔒</div>
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Fechar {pdvId}?</h2>
          {carrinho.length > 0 && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>⚠️ {carrinho.length} item(ns) no carrinho serão descartados.</p>}
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-5)' }}>O terminal será encerrado. O caixa principal permanece aberto.</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmandoFechar(false)}>Cancelar</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => void fecharPDV()}>🔒 Confirmar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Terminal PDV Principal ────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-primary)' }}>

      {/* ── Modals ── */}

      {/* Modal Movimentação */}
      {showMovModal && (
        <Modal title="💸 Movimentação de caixa" onClose={() => setShowMovModal(false)}>
          <form onSubmit={handleMovimento} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              {([
                { key: 'SANGRIA', label: '💸 Sangria', desc: 'Retirada de dinheiro' },
                { key: 'SUPRIMENTO', label: '📥 Suprimento', desc: 'Entrada de dinheiro' },
              ] as const).map(opt => (
                <button key={opt.key} type="button"
                  className={`btn ${movTipo === opt.key ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  style={{ flexDirection: 'column', height: 64, fontSize: 'var(--font-size-xs)' }}
                  onClick={() => setMovTipo(opt.key)}
                >
                  <span style={{ fontWeight: 700 }}>{opt.label}</span>
                  <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>{opt.desc}</span>
                </button>
              ))}
            </div>
            <div className="input-group">
              <label>Valor (R$)</label>
              <input type="number" className="input" placeholder="0,00" step="0.01" min="0.01"
                value={movValor} onChange={e => setMovValor(e.target.value)} required autoFocus />
            </div>
            <div className="input-group">
              <label>Descrição</label>
              <input type="text" className="input" placeholder={movTipo === 'SANGRIA' ? 'Ex: Envio ao banco...' : 'Ex: Troco adicional...'}
                value={movDesc} onChange={e => setMovDesc(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowMovModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={savingMov}>
                {savingMov ? <span className="btn-loading"><span className="spinner" />Registrando...</span> : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Trocar Operador */}
      {showTrocarModal && (
        <Modal title="👤 Trocar operador" onClose={() => setShowTrocarModal(false)}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
            O terminal permanece aberto. Apenas o operador responsável é alterado.
          </p>
          {loadingFuncs ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-5)', color: 'var(--color-text-secondary)' }}>
              <span className="spinner" /> Carregando equipe...
            </div>
          ) : funcionarios.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-4)' }}>
              Nenhum funcionário habilitado encontrado.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 260, overflowY: 'auto', marginBottom: 'var(--space-4)' }}>
              {funcionarios.map(f => (
                <div key={f.id}
                  onClick={() => setNovoFunc(f)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${novoFunc?.id === f.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: novoFunc?.id === f.id ? 'rgba(59,130,246,0.06)' : 'transparent',
                    cursor: 'pointer',
                    opacity: f.id === pdvInfo?.employeeId ? 0.5 : 1,
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    {f.account.nomeCompleto.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{f.account.nomeCompleto}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      {ROLE_LABEL[f.role] || f.role}
                      {f.id === pdvInfo?.employeeId && ' · atual'}
                    </div>
                  </div>
                  {novoFunc?.id === f.id && <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowTrocarModal(false)}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={!novoFunc || novoFunc.id === pdvInfo?.employeeId || trocando} onClick={confirmarTroca}>
              {trocando ? <span className="btn-loading"><span className="spinner" />...</span> : '✓ Confirmar troca'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Header ── */}
      <div className="pdv-header">
        <div className="pdv-header-left">
          <div>
            <div className="pdv-header-title">🖥️ {pdvId}</div>
            <div className="pdv-header-sub">Terminal de venda</div>
          </div>
          {pdvInfo && (
            <div className="pdv-operator-badge">
              <strong>{pdvInfo.employeeName}</strong>
              <span className="pdv-operator-role">· {ROLE_LABEL[pdvInfo.employeeRole] || pdvInfo.employeeRole}</span>
              {pdvInfo.fundoCaixa > 0 && (
                <span className="pdv-operator-fund">Fundo: <strong>{fmt(pdvInfo.fundoCaixa)}</strong></span>
              )}
            </div>
          )}
        </div>

        <div className="pdv-header-clock"><Clock /></div>

        <div className="pdv-header-actions">
          <button className="btn btn-outline btn-sm" onClick={abrirTrocarModal}>👤 <span className="pdv-btn-text">Trocar operador</span></button>
          <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={() => setConfirmandoFechar(true)}>🔒 <span className="pdv-btn-text">Fechar PDV</span></button>
        </div>
      </div>

      {/* ── Corpo ── */}
      <div className="pdv-body">

        {/* Coluna esquerda: busca + carrinho */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', overflow: 'hidden' }}>

          {/* Campo busca */}
          <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-4)', position: 'relative', flexShrink: 0 }}>
            <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>🔍 Código de barras, nome ou categoria</div>
            <input ref={buscaRef} type="text" className="input"
              placeholder={loadingProdutos ? 'Carregando produtos...' : 'Digite, escaneie ou pesquise...'}
              value={busca} onChange={e => setBusca(e.target.value)} onKeyDown={handleBuscaKeyDown}
              disabled={loadingProdutos}
              style={{ fontSize: 'var(--font-size-md)', height: 48 }}
              autoComplete="off"
            />
            <div style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {loadingProdutos ? 'Carregando catálogo...' : `${produtos.length} produtos · Enter para adicionar o 1º resultado · Esc limpa`}
            </div>
            {showResultados && (
              <div ref={resultadosRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', marginTop: '0.25rem', overflow: 'hidden' }}>
                {resultados.map((p, idx) => (
                  <div key={p.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', cursor: 'pointer', background: idx === 0 ? 'var(--color-bg-secondary)' : 'transparent', borderBottom: idx < resultados.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                    onMouseDown={() => adicionarAoCarrinho(p)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.background = idx === 0 ? 'var(--color-bg-secondary)' : 'transparent')}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {idx === 0 && <span style={{ color: 'var(--color-primary)', marginRight: '0.4rem', fontSize: 'var(--font-size-xs)' }}>↵</span>}
                        {p.nome}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{p.categoria?.nome || 'Sem categoria'} · Estoque: {p.estoque} {p.unidade}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 'var(--font-size-md)' }}>{fmt(p.precoVenda)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carrinho */}
          <div style={{ flex: 1, background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-4)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🛒 Carrinho ({carrinho.reduce((s, i) => s + i.quantidade, 0)} un.)</span>
              {carrinho.length > 0 && (
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }} onClick={() => setCarrinho([])}>🗑️ Limpar</button>
              )}
            </div>

            {carrinho.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🛒</div>
                <p>Escaneie ou pesquise um produto para começar</p>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 'var(--space-2)', padding: '0 var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <span>Produto</span><span style={{ textAlign: 'center' }}>Unit.</span><span style={{ textAlign: 'center', minWidth: 80 }}>Qtd</span><span style={{ textAlign: 'right', minWidth: 72 }}>Subtotal</span><span style={{ minWidth: 28 }}></span>
                </div>
                {carrinho.map(item => (
                  <div key={item.produto.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 'var(--space-2)', alignItems: 'center', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.produto.nome}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{item.produto.categoria?.nome || ''}</div>
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{fmt(item.precoUnitario)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', minWidth: 80, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '0 0.5rem', minWidth: 28, fontWeight: 700, fontSize: '1rem' }} onClick={() => alterarQtd(item.produto.id, -1)}>−</button>
                      <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantidade}</span>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '0 0.5rem', minWidth: 28, fontWeight: 700, fontSize: '1rem' }} onClick={() => alterarQtd(item.produto.id, 1)}>+</button>
                    </div>
                    <div style={{ fontWeight: 700, minWidth: 72, textAlign: 'right', fontSize: 'var(--font-size-sm)' }}>{fmt(item.subtotal)}</div>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)', padding: '0 0.4rem', minWidth: 28 }} onClick={() => setCarrinho(prev => prev.filter(i => i.produto.id !== item.produto.id))}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita: total + pagamento + ações */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

          {/* Total */}
          <div style={{ background: total > 0 ? 'var(--color-primary)' : 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center', transition: 'background 0.2s' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: total > 0 ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Total a pagar</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: total > 0 ? '#fff' : 'var(--color-text-secondary)', lineHeight: 1 }}>{fmt(total)}</div>
            {carrinho.length > 0 && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: total > 0 ? 'rgba(255,255,255,0.6)' : 'var(--color-text-secondary)', marginTop: '0.4rem' }}>
                {carrinho.length} produto(s) · {carrinho.reduce((s, i) => s + i.quantidade, 0)} un.
              </div>
            )}
          </div>

          {/* Forma de pagamento */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
            <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>💳 Forma de pagamento</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              {([
                { key: 'DINHEIRO', label: '💵 Dinheiro' },
                { key: 'CARTAO_CREDITO', label: '💳 Crédito' },
                { key: 'CARTAO_DEBITO', label: '🏧 Débito' },
                { key: 'PIX', label: '📱 PIX' },
              ] as const).map(fp => (
                <button key={fp.key} className={`btn ${formaPagamento === fp.key ? 'btn-primary' : 'btn-outline'} btn-sm`} style={{ fontSize: 'var(--font-size-sm)' }} onClick={() => setFormaPagamento(fp.key)}>
                  {fp.label}
                </button>
              ))}
            </div>
            {formaPagamento === 'DINHEIRO' && (
              <div>
                <div className="input-group" style={{ marginBottom: 'var(--space-2)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)' }}>Valor recebido (R$)</label>
                  <input type="number" className="input" placeholder="0,00" step="0.01" min={total} value={valorRecebido} onChange={e => setValorRecebido(e.target.value)} style={{ height: 44 }} />
                </div>
                {troco > 0 && (
                  <div style={{ padding: 'var(--space-3)', background: 'rgba(34,197,94,0.1)', border: '1px solid var(--color-success, #22c55e)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                    <span>Troco:</span>
                    <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-success, #22c55e)' }}>{fmt(troco)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Finalizar */}
          <button className="btn btn-primary btn-lg" style={{ width: '100%', height: 56, fontSize: 'var(--font-size-md)', fontWeight: 700 }}
            disabled={carrinho.length === 0 || finalizando} onClick={handleFinalizar}>
            {finalizando
              ? <span className="btn-loading"><span className="spinner" /> Processando...</span>
              : carrinho.length === 0 ? '🛒 Carrinho vazio' : `✅ Finalizar · ${fmt(total)}`}
          </button>

          {/* Ações do PDV */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-2)', fontWeight: 600 }}>Ações do terminal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => setShowMovModal(true)}>
                💸 Sangria / Suprimento
              </button>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/comerciante/caixa')}>
                ← Voltar ao painel do caixa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
