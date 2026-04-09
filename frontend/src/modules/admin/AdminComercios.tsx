import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { formatPrice } from '../../data/mockData';
import { api } from '../../lib/api';
import './AdminComercios.css';

interface Comercio {
  id: string;
  nomeFantasia: string;
  razaoSocial: string | null;
  segmento: string;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  taxaEntrega: number;
  plano?: { nome: string } | null;
  dono?: { account: { email: string | null; cpf: string } } | null;
}

export default function AdminComercios() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  useEffect(() => {
    api.get('admin/comercios')
      .then((res: any) => setComercios(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        // fallback: tenta endpoint público
        api.get('comercios/public?limit=100')
          .then((res: any) => setComercios(Array.isArray(res.data) ? res.data : []))
          .catch(() => setComercios([]));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtrados = comercios.filter(c => {
    const nome = (c.nomeFantasia || '').toLowerCase();
    const seg = (c.segmento || '').toLowerCase();
    const bateBusca = nome.includes(busca.toLowerCase()) || seg.includes(busca.toLowerCase());
    const bateStatus =
      filtroStatus === 'todos' ||
      (filtroStatus === 'ativo' && c.ativo) ||
      (filtroStatus === 'inativo' && !c.ativo);
    return bateBusca && bateStatus;
  });

  return (
    <AdminLayout title="Comércios da Plataforma">
      <div className="admin-comercios-container animate-fade-in-up">

        {/* Resumo */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div className="admin-kpi-card" style={{ flex: 1, minWidth: 140 }}>
            <div className="kpi-icon bg-accent-subtle text-accent-dark">🏪</div>
            <div className="kpi-info">
              <span className="kpi-label">Total</span>
              <span className="kpi-value">{loading ? '...' : comercios.length}</span>
            </div>
          </div>
          <div className="admin-kpi-card" style={{ flex: 1, minWidth: 140 }}>
            <div className="kpi-icon bg-primary-subtle text-primary">✅</div>
            <div className="kpi-info">
              <span className="kpi-label">Ativos</span>
              <span className="kpi-value">{loading ? '...' : comercios.filter(c => c.ativo).length}</span>
            </div>
          </div>
          <div className="admin-kpi-card" style={{ flex: 1, minWidth: 140 }}>
            <div className="kpi-icon bg-warning-subtle text-warning-dark">🚫</div>
            <div className="kpi-info">
              <span className="kpi-label">Inativos</span>
              <span className="kpi-value">{loading ? '...' : comercios.filter(c => !c.ativo).length}</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="admin-card mb-4">
          <div className="admin-filter-bar">
            <div className="input-search-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="input search-input"
                placeholder="Buscar por nome ou segmento..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>
            <select
              className="input admin-select"
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="ativo">✅ Ativos</option>
              <option value="inativo">🚫 Inativos</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="admin-card table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <span className="spinner" /> <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Carregando...</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Comércio</th>
                  <th>Segmento</th>
                  <th>Localização</th>
                  <th>Taxa entrega</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-secondary">Nenhum comércio encontrado</td>
                  </tr>
                )}
                {filtrados.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="admin-table-brand">
                        <div className="brand-dot">{(c.nomeFantasia || '?').charAt(0).toUpperCase()}</div>
                        <div className="brand-info">
                          <strong>{c.nomeFantasia}</strong>
                          <span>{c.razaoSocial || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td>{c.segmento || '—'}</td>
                    <td>{[c.cidade, c.estado].filter(Boolean).join(', ') || '—'}</td>
                    <td>{c.taxaEntrega === 0 ? '🟢 Grátis' : formatPrice(c.taxaEntrega)}</td>
                    <td>
                      <span className={`status-pill ${c.ativo ? 'status-ativo' : 'status-bloqueado'}`}>
                        {c.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
