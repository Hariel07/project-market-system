import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import { api } from '../../lib/api';
import './ComercianteItemForm.css';

interface CategoriaAPI {
  id: string;
  nome: string;
  icone: string | null;
}

interface ProdutoAPI {
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
  categoria: CategoriaAPI | null;
}

export default function ComercianteItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'novo';

  // Form state
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [precoPromocional, setPrecoPromocional] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [unidade, setUnidade] = useState('UN');
  const [estoque, setEstoque] = useState('');
  const [isCombo, setIsCombo] = useState(false);
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Categorias vindas da API
  const [categorias, setCategorias] = useState<CategoriaAPI[]>([]);

  // Carrega categorias + dados do produto (se editando)
  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

      // Busca categorias reais do comércio
      try {
        const catResponse = await api.get('/api/categorias');
        setCategorias(catResponse.data);
      } catch (err: any) {
        // Se não tem categorias, segue sem elas
        console.warn('Nenhuma categoria encontrada ou erro:', err.response?.data?.error);
        setCategorias([]);
      }

      // Se editando, busca dados do produto
      if (isEditing) {
        const prodResponse = await api.get(`/api/produtos/${id}`);
        const prod: ProdutoAPI = prodResponse.data;
        setNome(prod.nome);
        setDescricao(prod.descricao || '');
        setPreco(prod.precoVenda.toString());
        setPrecoPromocional(prod.precoPromocional?.toString() || '');
        setCategoriaId(prod.categoriaId || '');
        setUnidade(prod.unidade);
        setEstoque(prod.estoque.toString());
        setIsCombo(prod.isCombo);
        setAtivo(prod.ativo);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        navigate('/login');
        return;
      }
      if (error.response?.status === 404) {
        alert('Produto não encontrado.');
        navigate('/comerciante/catalogo');
        return;
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !preco) {
      alert('Nome e preço de venda são obrigatórios.');
      return;
    }

    setSaving(true);

    const payload = {
      nome,
      descricao: descricao || null,
      precoVenda: preco,
      precoPromocional: precoPromocional || null,
      categoriaId: categoriaId || null,
      unidade,
      estoque: estoque || '0',
      isCombo,
      ativo,
    };

    try {
      if (isEditing) {
        await api.put(`/api/produtos/${id}`, payload);
      } else {
        await api.post('/api/produtos', payload);
      }
      navigate('/comerciante/catalogo');
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      alert(error.response?.data?.error || 'Erro ao salvar produto.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <ComercianteLayout title={isEditing ? 'Editar Item' : 'Novo Item'} subtitle="Carregando...">
        <div className="empty-state" style={{ padding: '3rem' }}>
          <span className="empty-icon"><span className="spinner" /></span>
          <h3>Carregando dados...</h3>
        </div>
      </ComercianteLayout>
    );
  }

  return (
    <ComercianteLayout
      title={isEditing ? `Editar: ${nome}` : 'Novo Item'}
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
              <label htmlFor="item-cat">Categoria</label>
              <select id="item-cat" className="input select-input" value={categoriaId} onChange={e => setCategoriaId(e.target.value)}>
                <option value="">Sem categoria</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              {categorias.length === 0 && (
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                  Nenhuma categoria cadastrada. Crie categorias nas configurações.
                </small>
              )}
            </div>
            <div className="input-group">
              <label>Tipo</label>
              <label className="toggle-label" style={{ marginTop: '0.5rem' }}>
                <input type="checkbox" className="checkbox" checked={isCombo} onChange={e => setIsCombo(e.target.checked)} />
                <span>É um combo</span>
              </label>
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
              <label htmlFor="item-preco-promo">Preço promocional (R$) <span className="optional">(opcional)</span></label>
              <input id="item-preco-promo" type="number" className="input" placeholder="0,00" step="0.01" min="0" value={precoPromocional} onChange={e => setPrecoPromocional(e.target.value)} />
            </div>
            <div className="input-group">
              <label htmlFor="item-unidade">Unidade de medida</label>
              <select id="item-unidade" className="input select-input" value={unidade} onChange={e => setUnidade(e.target.value)}>
                <option value="UN">Unidade (UN)</option>
                <option value="KG">Quilograma (KG)</option>
                <option value="L">Litro (L)</option>
                <option value="ML">Mililitro (ML)</option>
                <option value="G">Grama (G)</option>
                <option value="PCT">Pacote (PCT)</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="item-estoque">Estoque atual</label>
              <input id="item-estoque" type="number" className="input" placeholder="0" min="0" value={estoque} onChange={e => setEstoque(e.target.value)} />
            </div>
          </div>
        </section>

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
