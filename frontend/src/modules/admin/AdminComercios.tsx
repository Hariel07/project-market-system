import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { comerciosGlobalMock } from '../../data/adminMock';
import { formatPrice } from '../../data/mockData';
import './AdminComercios.css';

export default function AdminComercios() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const filtrados = comerciosGlobalMock.filter(c => {
    const batimentoNome = c.nome.toLowerCase().includes(busca.toLowerCase());
    const batimentoStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    return batimentoNome && batimentoStatus;
  });

  return (
    <AdminLayout title="Comércios da Plataforma">
      <div className="admin-comercios-container animate-fade-in-up">
        
        {/* Filtros */}
        <div className="admin-card mb-4">
          <div className="admin-filter-bar">
            <div className="input-search-group">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                className="input search-input" 
                placeholder="Buscar por nome ou dono..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>
            <select 
              className="input admin-select" 
              value={filtroStatus} 
              onChange={e => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">✅ Ativos</option>
              <option value="analise">⏳ Em Análise</option>
              <option value="bloqueado">🚫 Bloqueados</option>
            </select>
          </div>
        </div>

        {/* Tabela de Comércios */}
        <div className="admin-card table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Comércio / Segmento</th>
                <th>Contato / Dono</th>
                <th>Plano</th>
                <th>Faturamento (Mês)</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-secondary">Nenhum comércio encontrado</td>
                </tr>
              )}
              {filtrados.map(c => (
                <tr key={c.id}>
                  <td><strong>#{c.id}</strong></td>
                  <td>
                    <div className="admin-table-brand">
                      <div className="brand-dot">{c.segmento.charAt(0)}</div>
                      <div className="brand-info">
                        <strong>{c.nome}</strong>
                        <span>{c.segmento} · Cadastro: {c.dataCadastro}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="admin-table-contact">
                      <strong>{c.dono}</strong>
                      <span>{c.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`plan-badge plan-${c.plano}`}>{c.plano.toUpperCase()}</span>
                  </td>
                  <td>
                    {formatPrice(c.faturamentoMes)} <br/>
                    <small className="text-tertiary">{c.pedidosMes} pedidos</small>
                  </td>
                  <td>
                    <span className={`status-pill status-${c.status}`}>
                      {c.status === 'ativo' ? 'Ativo' : c.status === 'analise' ? 'Em Análise' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="text-right admin-table-actions">
                    <button className="btn-icon-admin" title="Ver detalhes">👁️</button>
                    {c.status === 'analise' && <button className="btn-icon-admin text-accent" title="Aprovar Cadastro">✅</button>}
                    {c.status === 'ativo' && <button className="btn-icon-admin text-danger" title="Bloquear">🚫</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
}
