import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import { itensMock, formatPrice } from '../../data/mockData';
import './ComercianteCatalogo.css';

export default function ComercianteCatalogo() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [catFiltro, setCatFiltro] = useState('');

  // Itens do comércio 1 (Mercado Bom Preço) como mock do dono
  const meusItens = itensMock.filter(i => i.comercioId === 1);
  const categorias = [...new Set(meusItens.map(i => i.categoriaNome))];

  const filtered = useMemo(() => {
    let result = meusItens;
    if (search) result = result.filter(i => i.nome.toLowerCase().includes(search.toLowerCase()));
    if (catFiltro) result = result.filter(i => i.categoriaNome === catFiltro);
    return result;
  }, [search, catFiltro]);

  const actions = (
    <button className="btn btn-primary btn-sm" onClick={() => navigate('/comerciante/item/novo')}>
      ➕ Novo item
    </button>
  );

  return (
    <ComercianteLayout title="Catálogo" subtitle={`${meusItens.length} itens cadastrados`} actions={actions}>
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

      {/* Items table */}
      <div className="catalogo-table-wrap animate-fade-in-up delay-1">
        <table className="catalogo-table">
          <thead>
            <tr>
              <th>Item</th>
              <th className="hide-mobile">Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th className="hide-mobile">Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const emoji = item.categoriaNome === 'Alimentos' ? '🍚' :
                           item.categoriaNome === 'Laticínios' ? '🥛' :
                           item.categoriaNome === 'Bebidas' ? '🥤' :
                           item.categoriaNome === 'Limpeza' ? '🧹' :
                           item.categoriaNome === 'Hortifruti' ? '🍌' : '📦';
              const lowStock = item.estoque < 20;
              return (
                <tr key={item.id} className={lowStock ? 'low-stock-row' : ''}>
                  <td>
                    <div className="catalogo-item-cell">
                      <span className="catalogo-item-emoji">{emoji}</span>
                      <div>
                        <span className="catalogo-item-name">{item.nome}</span>
                        {item.emPromocao && <span className="catalogo-promo-tag">Promoção</span>}
                      </div>
                    </div>
                  </td>
                  <td className="hide-mobile">
                    <span className="catalogo-cat-badge">{item.categoriaNome}</span>
                  </td>
                  <td>
                    <div className="catalogo-price-cell">
                      {item.precoOriginal && (
                        <span className="catalogo-old-price">{formatPrice(item.precoOriginal)}</span>
                      )}
                      <span className="catalogo-price">{formatPrice(item.preco)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`catalogo-stock ${lowStock ? 'stock-low' : 'stock-ok'}`}>
                      {item.estoque} {item.unidadeMedida}
                    </span>
                  </td>
                  <td className="hide-mobile">
                    <span className="catalogo-type-badge" style={{ textTransform: 'capitalize' }}>
                      {item.tipo === 'composto' ? '🔗 Composto' : item.tipo === 'combo' ? '📦 Combo' : '📋 Simples'}
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
                      <button className="btn btn-ghost btn-sm" title="Duplicar">📋</button>
                      <button className="btn btn-ghost btn-sm text-danger" title="Excluir">🗑️</button>
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
          </div>
        )}
      </div>

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
