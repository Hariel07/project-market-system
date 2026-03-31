import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import { api } from '../../lib/api';
import { movimentosEstoqueMock } from '../../data/comercianteMock';
import './ComercianteEstoque.css';

interface Produto {
  id: string;
  nome: string;
  precoVenda: number;
  unidade: string;
  estoque: number;
  ativo: boolean;
  categoria: { id: string; nome: string } | null;
}

export default function ComercianteEstoque() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'visao' | 'movimentos' | 'entrada'>('visao');
  const [search, setSearch] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca produtos reais da API
  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/produtos');
      setProdutos(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
      if (error.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const alertasEstoque = produtos
    .filter(p => p.estoque < 20 && p.ativo)
    .map((p, i) => ({
      id: i + 1,
      icon: '📦',
      msg: `${p.nome} — estoque em ${p.estoque} ${p.unidade} (baixo)`,
      tempo: 'agora',
    }));

  const filtered = search
    ? produtos.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()))
    : produtos;

  const getCategoryEmoji = (catNome: string | undefined) => {
    if (!catNome) return '📦';
    const map: Record<string, string> = {
      'Alimentos': '🍚', 'Laticínios': '🥛', 'Bebidas': '🥤',
      'Limpeza': '🧹', 'Hortifruti': '🍌', 'Lanches': '🍔',
      'Combos': '📦', 'Pães': '🥖', 'Bolos': '🎂',
    };
    return map[catNome] || '📦';
  };

  // Entrada manual de estoque via API
  const [entradaItem, setEntradaItem] = useState('');
  const [entradaQty, setEntradaQty] = useState('');
  const [entradaRef, setEntradaRef] = useState('');
  const [entradaObs, setEntradaObs] = useState('');
  const [savingEntrada, setSavingEntrada] = useState(false);

  const handleEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entradaItem || !entradaQty) return;
    
    const produto = produtos.find(p => p.id === entradaItem);
    if (!produto) return;

    try {
      setSavingEntrada(true);
      const novoEstoque = produto.estoque + Number(entradaQty);
      await api.put(`/api/produtos/${entradaItem}`, { estoque: novoEstoque });
      
      // Atualiza local
      setProdutos(prev => prev.map(p => p.id === entradaItem ? { ...p, estoque: novoEstoque } : p));
      
      alert(`✅ Entrada registrada! ${produto.nome}: ${produto.estoque} → ${novoEstoque} ${produto.unidade}`);
      setEntradaItem('');
      setEntradaQty('');
      setEntradaRef('');
      setEntradaObs('');
    } catch (error: any) {
      console.error('Erro ao registrar entrada:', error);
      alert(error.response?.data?.error || 'Erro ao registrar entrada.');
    } finally {
      setSavingEntrada(false);
    }
  };

  return (
    <ComercianteLayout title="Estoque" subtitle="Controle de entrada, saída e níveis de estoque">
      {/* Tabs */}
      <div className="estoque-tabs animate-fade-in-up">
        <button className={`estoque-tab ${tab === 'visao' ? 'active' : ''}`} onClick={() => setTab('visao')}>
          📊 Visão geral
        </button>
        <button className={`estoque-tab ${tab === 'movimentos' ? 'active' : ''}`} onClick={() => setTab('movimentos')}>
          📜 Movimentações
        </button>
        <button className={`estoque-tab ${tab === 'entrada' ? 'active' : ''}`} onClick={() => setTab('entrada')}>
          📥 Entrada manual
        </button>
      </div>

      {/* Tab: Visão geral */}
      {tab === 'visao' && (
        <>
          {/* Alertas gerados dinamicamente dos dados reais */}
          {alertasEstoque.length > 0 && (
            <div className="estoque-alertas animate-fade-in-up delay-1">
              <h3 className="estoque-section-title">⚠️ Alertas de estoque ({alertasEstoque.length} itens baixos)</h3>
              {alertasEstoque.map(a => (
                <div key={a.id} className="estoque-alerta-item">
                  <span>{a.icon}</span>
                  <span className="estoque-alerta-msg">{a.msg}</span>
                  <span className="estoque-alerta-time">{a.tempo}</span>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="estoque-search animate-fade-in-up delay-1">
            <span className="search-bar-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar item..."
              className="input search-bar-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Loading */}
          {loading ? (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <span className="empty-icon"><span className="spinner" /></span>
              <h3>Carregando estoque...</h3>
            </div>
          ) : (
            <div className="estoque-grid animate-fade-in-up delay-2">
              {filtered.map(item => {
                const percent = Math.min(100, (item.estoque / 200) * 100);
                const isLow = item.estoque < 20;
                const emoji = getCategoryEmoji(item.categoria?.nome);
                return (
                  <div key={item.id} className={`estoque-card ${isLow ? 'estoque-low' : ''}`}>
                    <div className="estoque-card-top">
                      <span className="estoque-card-emoji">{emoji}</span>
                      <div className="estoque-card-info">
                        <span className="estoque-card-name">{item.nome}</span>
                        <span className="estoque-card-cat">{item.categoria?.nome || 'Sem categoria'}</span>
                      </div>
                      {isLow && <span className="estoque-low-badge">⚠️ Baixo</span>}
                    </div>
                    <div className="estoque-card-bar">
                      <div className="estoque-bar-bg">
                        <div
                          className={`estoque-bar-fill ${isLow ? 'fill-low' : ''}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="estoque-card-qty">
                        <strong>{item.estoque}</strong> {item.unidade}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="empty-state" style={{ padding: '3rem', gridColumn: '1 / -1' }}>
                  <span className="empty-icon">📦</span>
                  <h3>Nenhum item encontrado</h3>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Tab: Movimentações — ainda usa mock (será integrado quando módulo de pedidos existir) */}
      {tab === 'movimentos' && (
        <div className="movimentos-section animate-fade-in-up delay-1">
          <div className="movimentos-table-wrap">
            <table className="catalogo-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Tipo</th>
                  <th>Qtd</th>
                  <th className="hide-mobile">Motivo</th>
                  <th>Data</th>
                  <th className="hide-mobile">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {movimentosEstoqueMock.map(mov => (
                  <tr key={mov.id}>
                    <td><strong>{mov.itemNome}</strong></td>
                    <td>
                      <span className={`mov-type mov-${mov.tipo}`}>
                        {mov.tipo === 'entrada' ? '📥 Entrada' : mov.tipo === 'saida' ? '📤 Saída' : '🔧 Ajuste'}
                      </span>
                    </td>
                    <td>
                      <span className={mov.tipo === 'entrada' ? 'text-accent' : mov.tipo === 'saida' ? 'text-danger' : ''}>
                        {mov.tipo === 'entrada' ? '+' : ''}{mov.quantidade}
                      </span>
                    </td>
                    <td className="hide-mobile text-sm text-secondary">{mov.motivo}</td>
                    <td className="text-sm">{mov.data}</td>
                    <td className="hide-mobile text-sm">{mov.responsavel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Entrada manual — agora salva de verdade via API */}
      {tab === 'entrada' && (
        <div className="entrada-section animate-fade-in-up delay-1">
          <form className="entrada-form" onSubmit={handleEntrada}>
            <h3 className="estoque-section-title">📥 Registrar entrada de estoque</h3>
            <p className="text-sm text-secondary mb-4">Registre uma entrada de nota branca ou compra de fornecedor.</p>

            <div className="form-grid">
              <div className="input-group">
                <label>Item</label>
                <select
                  className="input select-input"
                  value={entradaItem}
                  onChange={e => setEntradaItem(e.target.value)}
                  required
                >
                  <option value="">Selecione o item</option>
                  {produtos.map(i => (
                    <option key={i.id} value={i.id}>{i.nome} (atual: {i.estoque} {i.unidade})</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Quantidade</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Ex: 50"
                  min={1}
                  value={entradaQty}
                  onChange={e => setEntradaQty(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Custo unitário (opcional)</label>
                <input type="number" className="input" placeholder="R$ 0,00" step="0.01" />
              </div>

              <div className="input-group">
                <label>Nº da Nota / Referência</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: NF 4821"
                  value={entradaRef}
                  onChange={e => setEntradaRef(e.target.value)}
                />
              </div>

              <div className="input-group full-width">
                <label>Observação</label>
                <textarea
                  className="input textarea"
                  placeholder="Detalhes adicionais..."
                  rows={3}
                  value={entradaObs}
                  onChange={e => setEntradaObs(e.target.value)}
                />
              </div>
            </div>

            <div className="entrada-actions">
              <button type="submit" className={`btn btn-primary btn-lg ${savingEntrada ? 'loading' : ''}`} disabled={savingEntrada}>
                {savingEntrada ? <span className="btn-loading"><span className="spinner" /> Salvando...</span> : '📥 Registrar entrada'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => { setEntradaItem(''); setEntradaQty(''); setEntradaRef(''); setEntradaObs(''); }}>
                Limpar
              </button>
            </div>
          </form>
        </div>
      )}
    </ComercianteLayout>
  );
}
