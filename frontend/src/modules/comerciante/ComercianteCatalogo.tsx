import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import './ComercianteCatalogo.css';

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  precoVenda: number;
  precoPromocional: number | null;
  unidade: string;
  imagemUrl: string | null;
  estoque: number;
  isCombo: boolean;
  ativo: boolean;
  categoriaId: string | null;
  categoria: { id: string; nome: string } | null;
}

export default function ComercianteCatalogo() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [catFiltro, setCatFiltro] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Busca produtos da API real
  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('produtos');
      setProdutos(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
      setProdutos([]);
      if (error.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Categorias extraídas dos produtos carregados
  const categorias = [...new Set(produtos.map(p => p.categoria?.nome).filter(Boolean))] as string[];

  const filtered = useMemo(() => {
    let result = produtos;
    if (search) result = result.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));
    if (catFiltro) result = result.filter(p => p.categoria?.nome === catFiltro);
    return result;
  }, [search, catFiltro, produtos]);

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    try {
      setDeletingId(id);
      await api.delete(`/produtos/${id}`);
      setProdutos(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error);
      alert(error.response?.data?.error || 'Erro ao excluir produto.');
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryEmoji = (catNome: string | undefined) => {
    if (!catNome) return '📦';
    const map: Record<string, string> = {
      'Alimentos': '🍚', 'Laticínios': '🥛', 'Bebidas': '🥤',
      'Limpeza': '🧹', 'Hortifruti': '🍌', 'Lanches': '🍔',
      'Combos': '📦', 'Pães': '🥖', 'Bolos': '🎂', 'Acompanhamentos': '🍟',
    };
    return map[catNome] || '📦';
  };

  const actions = (
    <button className="btn btn-primary btn-sm" onClick={() => navigate('/comerciante/item/novo')}>
      ➕ Novo item
    </button>
  );

  return (
    <ComercianteLayout title="Catálogo" subtitle={`${produtos.length} itens cadastrados`} actions={actions}>
      {/* Search and filters */}
      <div className="catalogo-toolbar animate-fade-in-up">
        <div className="catalogo-search">
          <span className="search-bar-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar no catálogo..."
            className="input search-bar-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="search-catalogo"
          />
        </div>
        <div className="catalogo-filters">
          <button className={`filter-chip ${!catFiltro ? 'active' : ''}`} onClick={() => setCatFiltro('')}>
            Todos
          </button>
          {categorias.map(c => (
            <button key={c} className={`filter-chip ${catFiltro === c ? 'active' : ''}`} onClick={() => setCatFiltro(catFiltro === c ? '' : c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <span className="empty-icon"><span className="spinner" /></span>
          <h3>Carregando produtos...</h3>
        </div>
      ) : (
        <>
          {/* Items table */}
          <div className="catalogo-table-wrap animate-fade-in-up delay-1">
            <table className="catalogo-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="hide-mobile">Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th className="hide-mobile">Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const emoji = getCategoryEmoji(item.categoria?.nome);
                  const lowStock = item.estoque < 20;
                  return (
                    <tr key={item.id} className={lowStock ? 'low-stock-row' : ''}>
                      <td>
                        <div className="catalogo-item-cell">
                          <span className="catalogo-item-emoji">{emoji}</span>
                          <div>
                            <span className="catalogo-item-name">{item.nome}</span>
                            {item.precoPromocional && <span className="catalogo-promo-tag">Promoção</span>}
                          </div>
                        </div>
                      </td>
                      <td className="hide-mobile">
                        <span className="catalogo-cat-badge">{item.categoria?.nome || '—'}</span>
                      </td>
                      <td>
                        <div className="catalogo-price-cell">
                          {item.precoPromocional && (
                            <span className="catalogo-old-price">{formatPrice(item.precoVenda)}</span>
                          )}
                          <span className="catalogo-price">
                            {formatPrice(item.precoPromocional || item.precoVenda)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`catalogo-stock ${lowStock ? 'stock-low' : 'stock-ok'}`}>
                          {item.estoque} {item.unidade}
                        </span>
                      </td>
                      <td className="hide-mobile">
                        <span className="catalogo-type-badge" style={{ textTransform: 'capitalize' }}>
                          {item.isCombo ? '📦 Combo' : item.ativo ? '✅ Ativo' : '⛔ Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="catalogo-actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate(`/comerciante/item/${item.id}`)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-ghost btn-sm text-danger"
                            title="Excluir"
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item.id, item.nome)}
                          >
                            {deletingId === item.id ? '⏳' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: '3rem' }}>
                <span className="empty-icon">📦</span>
                <h3>Nenhum item encontrado</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {produtos.length === 0
                    ? 'Comece cadastrando seu primeiro produto!'
                    : 'Tente ajustar os filtros de busca.'}
                </p>
                {produtos.length === 0 && (
                  <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/comerciante/item/novo')}>
                    ➕ Cadastrar primeiro item
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile FAB */}
      <button
        className="com-fab hide-tablet-up"
        onClick={() => navigate('/comerciante/item/novo')}
        id="fab-novo-item"
      >
        ➕
      </button>
    </ComercianteLayout>
  );
}
