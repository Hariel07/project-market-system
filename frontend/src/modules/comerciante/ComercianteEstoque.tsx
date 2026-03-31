import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import { itensMock, formatPrice } from '../../data/mockData';
import { movimentosEstoqueMock, alertasMock } from '../../data/comercianteMock';
import './ComercianteEstoque.css';

export default function ComercianteEstoque() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'visao' | 'movimentos' | 'entrada'>('visao');
  const [search, setSearch] = useState('');

  const meusItens = itensMock.filter(i => i.comercioId === 1);
  const alertasEstoque = alertasMock.filter(a => a.tipo === 'estoque' || a.tipo === 'validade');

  const filtered = search
    ? meusItens.filter(i => i.nome.toLowerCase().includes(search.toLowerCase()))
    : meusItens;

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
          {/* Alertas */}
          {alertasEstoque.length > 0 && (
            <div className="estoque-alertas animate-fade-in-up delay-1">
              <h3 className="estoque-section-title">⚠️ Alertas de estoque</h3>
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

          {/* Items grid com estoque */}
          <div className="estoque-grid animate-fade-in-up delay-2">
            {filtered.map(item => {
              const percent = Math.min(100, (item.estoque / 200) * 100);
              const isLow = item.estoque < 20;
              const emoji = item.categoriaNome === 'Alimentos' ? '🍚' :
                           item.categoriaNome === 'Laticínios' ? '🥛' :
                           item.categoriaNome === 'Bebidas' ? '🥤' :
                           item.categoriaNome === 'Limpeza' ? '🧹' :
                           item.categoriaNome === 'Hortifruti' ? '🍌' : '📦';
              return (
                <div key={item.id} className={`estoque-card ${isLow ? 'estoque-low' : ''}`}>
                  <div className="estoque-card-top">
                    <span className="estoque-card-emoji">{emoji}</span>
                    <div className="estoque-card-info">
                      <span className="estoque-card-name">{item.nome}</span>
                      <span className="estoque-card-cat">{item.categoriaNome}</span>
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
                      <strong>{item.estoque}</strong> {item.unidadeMedida}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Tab: Movimentações */}
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

      {/* Tab: Entrada manual */}
      {tab === 'entrada' && (
        <div className="entrada-section animate-fade-in-up delay-1">
          <div className="entrada-form">
            <h3 className="estoque-section-title">📥 Registrar entrada de estoque</h3>
            <p className="text-sm text-secondary mb-4">Registre uma entrada de nota branca ou compra de fornecedor.</p>

            <div className="form-grid">
              <div className="input-group">
                <label>Item</label>
                <select className="input select-input">
                  <option value="">Selecione o item</option>
                  {meusItens.map(i => (
                    <option key={i.id} value={i.id}>{i.nome}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Quantidade</label>
                <input type="number" className="input" placeholder="Ex: 50" min={1} />
              </div>

              <div className="input-group">
                <label>Custo unitário (opcional)</label>
                <input type="number" className="input" placeholder="R$ 0,00" step="0.01" />
              </div>

              <div className="input-group">
                <label>Nº da Nota / Referência</label>
                <input type="text" className="input" placeholder="Ex: NF 4821" />
              </div>

              <div className="input-group full-width">
                <label>Observação</label>
                <textarea className="input textarea" placeholder="Detalhes adicionais..." rows={3} />
              </div>
            </div>

            <div className="entrada-actions">
              <button className="btn btn-primary btn-lg">📥 Registrar entrada</button>
              <button className="btn btn-outline">Limpar</button>
            </div>
          </div>
        </div>
      )}
    </ComercianteLayout>
  );
}
