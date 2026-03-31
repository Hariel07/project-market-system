import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import { itensMock, formatPrice } from '../../data/mockData';
import './ComercianteItemForm.css';

interface Composicao {
  itemId: number;
  nome: string;
  quantidade: number;
  unidade: string;
}

export default function ComercianteItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'novo';
  const existing = isEditing ? itensMock.find(i => i.id === Number(id)) : null;

  const [nome, setNome] = useState(existing?.nome || '');
  const [descricao, setDescricao] = useState(existing?.descricao || '');
  const [preco, setPreco] = useState(existing?.preco?.toString() || '');
  const [precoOriginal, setPrecoOriginal] = useState(existing?.precoOriginal?.toString() || '');
  const [categoria, setCategoria] = useState(existing?.categoriaNome || '');
  const [unidade, setUnidade] = useState(existing?.unidadeMedida || 'un');
  const [tipo, setTipo] = useState(existing?.tipo || 'simples');
  const [estoque, setEstoque] = useState(existing?.estoque?.toString() || '');
  const [emPromocao, setEmPromocao] = useState(existing?.emPromocao || false);
  const [promocaoNome, setPromocaoNome] = useState(existing?.promocaoNome || '');
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  // BOM — Bill of Materials
  const [composicao, setComposicao] = useState<Composicao[]>(
    existing?.tipo === 'composto' || existing?.tipo === 'combo'
      ? [
          { itemId: 7, nome: 'Smash Burger Duplo', quantidade: 2, unidade: 'un' },
          { itemId: 10, nome: 'Batata Frita Grande', quantidade: 2, unidade: 'un' },
        ]
      : []
  );

  const addComposicao = () => {
    setComposicao([...composicao, { itemId: 0, nome: '', quantidade: 1, unidade: 'un' }]);
  };

  const removeComposicao = (idx: number) => {
    setComposicao(composicao.filter((_, i) => i !== idx));
  };

  const updateComposicao = (idx: number, field: keyof Composicao, value: string | number) => {
    setComposicao(composicao.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      navigate('/comerciante/catalogo');
    }, 1500);
  };

  return (
    <ComercianteLayout
      title={isEditing ? `Editar: ${existing?.nome}` : 'Novo Item'}
      subtitle={isEditing ? 'Edite as informações do item' : 'Cadastre um novo item no catálogo'}
    >
      <form className="item-form animate-fade-in-up" onSubmit={handleSave}>
        {/* Seção 1: Dados Básicos */}
        <section className="form-section">
          <h2 className="form-section-title">📋 Dados básicos</h2>
          <div className="form-grid">
            <div className="input-group full-width">
              <label htmlFor="item-nome">Nome do item *</label>
              <input id="item-nome" type="text" className="input" placeholder="Ex: Arroz Tio João 5kg" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div className="input-group full-width">
              <label htmlFor="item-desc">Descrição</label>
              <textarea id="item-desc" className="input textarea" placeholder="Descreva o item..." rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} />
            </div>
            <div className="input-group">
              <label htmlFor="item-cat">Categoria *</label>
              <select id="item-cat" className="input select-input" value={categoria} onChange={e => setCategoria(e.target.value)} required>
                <option value="">Selecione</option>
                {['Alimentos', 'Laticínios', 'Bebidas', 'Limpeza', 'Hortifruti', 'Lanches', 'Combos', 'Pães', 'Bolos', 'Acompanhamentos'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="item-tipo">Tipo do item *</label>
              <select id="item-tipo" className="input select-input" value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="simples">📋 Simples</option>
                <option value="composto">🔗 Composto (tem composição)</option>
                <option value="combo">📦 Combo</option>
              </select>
            </div>
          </div>
        </section>

        {/* Seção 2: Preço e Estoque */}
        <section className="form-section">
          <h2 className="form-section-title">💰 Preço e estoque</h2>
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="item-preco">Preço de venda (R$) *</label>
              <input id="item-preco" type="number" className="input" placeholder="0,00" step="0.01" min="0" value={preco} onChange={e => setPreco(e.target.value)} required />
            </div>
            <div className="input-group">
              <label htmlFor="item-preco-original">Preço original (R$) <span className="optional">(para promoção)</span></label>
              <input id="item-preco-original" type="number" className="input" placeholder="0,00" step="0.01" min="0" value={precoOriginal} onChange={e => setPrecoOriginal(e.target.value)} />
            </div>
            <div className="input-group">
              <label htmlFor="item-unidade">Unidade de medida</label>
              <select id="item-unidade" className="input select-input" value={unidade} onChange={e => setUnidade(e.target.value)}>
                <option value="un">Unidade (un)</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="L">Litro (L)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="g">Grama (g)</option>
                <option value="pct">Pacote (pct)</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="item-estoque">Estoque atual</label>
              <input id="item-estoque" type="number" className="input" placeholder="0" min="0" value={estoque} onChange={e => setEstoque(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Seção 3: Promoção */}
        <section className="form-section">
          <h2 className="form-section-title">🏷️ Promoção</h2>
          <div className="form-grid">
            <div className="input-group">
              <label className="toggle-label">
                <input type="checkbox" className="checkbox" checked={emPromocao} onChange={e => setEmPromocao(e.target.checked)} />
                <span>Item em promoção</span>
              </label>
            </div>
            {emPromocao && (
              <div className="input-group">
                <label htmlFor="item-promo-nome">Nome da promoção</label>
                <input id="item-promo-nome" type="text" className="input" placeholder="Ex: Oferta do dia" value={promocaoNome} onChange={e => setPromocaoNome(e.target.value)} />
              </div>
            )}
          </div>
        </section>

        {/* Seção 4: Composição / BOM (se composto ou combo) */}
        {(tipo === 'composto' || tipo === 'combo') && (
          <section className="form-section bom-section">
            <div className="bom-header">
              <h2 className="form-section-title">🔗 Composição (BOM)</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={addComposicao}>
                ➕ Adicionar componente
              </button>
            </div>
            <p className="text-sm text-secondary mb-4">
              {tipo === 'composto'
                ? 'Defina os materiais/ingredientes que compõem este item. O estoque será descontado automaticamente.'
                : 'Defina os itens que fazem parte deste combo.'
              }
            </p>

            {composicao.length === 0 ? (
              <div className="bom-empty">
                <span>📦</span>
                <p>Nenhum componente adicionado</p>
                <button type="button" className="btn btn-primary btn-sm" onClick={addComposicao}>
                  Adicionar primeiro componente
                </button>
              </div>
            ) : (
              <div className="bom-list">
                <div className="bom-list-header">
                  <span>Item componente</span>
                  <span>Quantidade</span>
                  <span>Unidade</span>
                  <span></span>
                </div>
                {composicao.map((comp, idx) => (
                  <div key={idx} className="bom-item">
                    <select
                      className="input select-input bom-select"
                      value={comp.itemId}
                      onChange={e => {
                        const selected = itensMock.find(i => i.id === Number(e.target.value));
                        updateComposicao(idx, 'itemId', Number(e.target.value));
                        if (selected) updateComposicao(idx, 'nome', selected.nome);
                      }}
                    >
                      <option value={0}>Selecione o item</option>
                      {itensMock.filter(i => i.comercioId === 1 && i.tipo === 'simples').map(i => (
                        <option key={i.id} value={i.id}>{i.nome}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="input bom-qty"
                      min={1}
                      value={comp.quantidade}
                      onChange={e => updateComposicao(idx, 'quantidade', Number(e.target.value))}
                    />
                    <select className="input select-input bom-unit" value={comp.unidade} onChange={e => updateComposicao(idx, 'unidade', e.target.value)}>
                      <option value="un">un</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                    </select>
                    <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => removeComposicao(idx)}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Ativo */}
        <section className="form-section">
          <label className="toggle-label">
            <input type="checkbox" className="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)} />
            <span>Item ativo (visível para clientes)</span>
          </label>
        </section>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancelar</button>
          <button
            type="submit"
            className={`btn btn-primary btn-lg ${saving ? 'loading' : ''}`}
            disabled={saving}
            id="btn-save-item"
          >
            {saving ? (
              <span className="btn-loading"><span className="spinner" /> Salvando...</span>
            ) : (
              isEditing ? '💾 Salvar alterações' : '➕ Criar item'
            )}
          </button>
        </div>
      </form>
    </ComercianteLayout>
  );
}
