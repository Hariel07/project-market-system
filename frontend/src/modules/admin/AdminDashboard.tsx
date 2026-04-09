import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { api } from '../../lib/api';
import './AdminDashboard.css';

interface Stats {
  totalUsers: number;
  totalCommerces: number;
  totalOrders: number;
  totalFake: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingFake, setLoadingFake] = useState(false);
  const [msg, setMsg] = useState('');

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('@MarketSystem:user') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    api.get('/admin/stats')
      .then((res: any) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCreateFake = async () => {
    if (!window.confirm('Deseja criar um set de contas fake (Cliente, Loja, Entregador)?')) return;
    setLoadingFake(true); setMsg('');
    try {
      await api.post('admin/fake-data/create');
      setMsg('✅ Contas fake criadas com sucesso!');
      window.location.reload();
    } catch { setMsg('❌ Erro ao criar contas fake.'); }
    finally { setLoadingFake(false); }
  };

  const handleDeleteFake = async () => {
    if (!window.confirm('TEM CERTEZA? Isso removerá TODAS as contas marcadas como isFake.')) return;
    setLoadingFake(true); setMsg('');
    try {
      await api.delete('admin/fake-data/cleanup');
      setMsg('✅ Contas fake removidas!');
      window.location.reload();
    } catch { setMsg('❌ Erro ao remover contas fake.'); }
    finally { setLoadingFake(false); }
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-dash animate-fade-in-up">

        {/* Perfil do Admin */}
        <div className="gestor-profile-card">
          <div className="gestor-avatar">
            {user?.nomeCompleto?.charAt(0) || user?.nome?.charAt(0) || '⚙️'}
          </div>
          <div className="gestor-info">
            <div className="gestor-main">
              <h3 className="gestor-name">{user?.nomeCompleto || user?.nome || 'Admin Master'}</h3>
              <span className="gestor-badge">CPF: {formatCPF(user?.cpf)}</span>
            </div>
            <div className="gestor-details">
              <span className="gestor-detail-item">📧 {user?.email || '—'}</span>
              <span className="gestor-detail-item">📱 {user?.telefone || 'Não informado'}</span>
              <span className="gestor-detail-item">🔑 {user?.role}</span>
            </div>
          </div>
          <button className="gestor-edit-btn" onClick={() => navigate('/admin/perfil')}>
            ⚙️ Editar Perfil
          </button>
        </div>

        {/* KPIs reais */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="kpi-icon bg-accent-subtle text-accent-dark">🏪</div>
            <div className="kpi-info">
              <span className="kpi-label">Comércios cadastrados</span>
              <span className="kpi-value">
                {loadingStats ? '...' : (stats?.totalCommerces ?? 0)}
              </span>
              <span className="kpi-trend">Total na plataforma</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="kpi-icon bg-blue-subtle text-blue-dark">👤</div>
            <div className="kpi-info">
              <span className="kpi-label">Total de usuários</span>
              <span className="kpi-value">
                {loadingStats ? '...' : (stats?.totalUsers ?? 0).toLocaleString('pt-BR')}
              </span>
              <span className="kpi-trend">Perfis ativos</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="kpi-icon bg-primary-subtle text-primary">📋</div>
            <div className="kpi-info">
              <span className="kpi-label">Total de pedidos</span>
              <span className="kpi-value">
                {loadingStats ? '...' : (stats?.totalOrders ?? 0).toLocaleString('pt-BR')}
              </span>
              <span className="kpi-trend">Todos os tempos</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="kpi-icon bg-warning-subtle text-warning-dark">🧪</div>
            <div className="kpi-info">
              <span className="kpi-label">Contas fake</span>
              <span className="kpi-value">
                {loadingStats ? '...' : (stats?.totalFake ?? 0)}
              </span>
              {(stats?.totalFake ?? 0) > 0
                ? <span className="kpi-trend" style={{ color: 'var(--color-warning)' }}>Detectadas</span>
                : <span className="kpi-trend">Banco limpo ✅</span>
              }
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="admin-card mb-6" style={{ border: '2px solid #6366f133' }}>
          <div className="admin-card-header">
            <h3>⚡ Ações de Teste</h3>
            {(stats?.totalFake ?? 0) > 0 && (
              <span className="badge badge-warning">{stats!.totalFake} Contas Fake</span>
            )}
          </div>
          <div className="flex gap-4 p-2">
            <button className="btn btn-primary" onClick={handleCreateFake} disabled={loadingFake}>
              🚀 Criar massa de teste
            </button>
            <button className="btn btn-outline btn-danger" onClick={handleDeleteFake} disabled={loadingFake}>
              🗑 Limpar contas fake
            </button>
            {msg && <span className="ml-4 self-center font-bold">{msg}</span>}
          </div>
          <p className="sys-desc px-2 pb-2">Popula o banco com Cliente, Loja e Entregador de demonstração.</p>
        </div>

        {/* Ações rápidas de navegação */}
        <div className="admin-row">
          {[
            { icon: '🏪', label: 'Comércios', desc: 'Gerencie lojas e aprovações', path: '/admin/comercios' },
            { icon: '👤', label: 'Usuários', desc: 'Todos os perfis da plataforma', path: '/admin/usuarios' },
            { icon: '💳', label: 'Planos', desc: 'Assinaturas e cobrança', path: '/admin/planos' },
            { icon: '⚙️', label: 'Sistema', desc: 'Manutenção e configurações', path: '/admin/sistema' },
          ].map(item => (
            <div
              key={item.path}
              className="admin-card delay-1 animate-fade-in-up"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(item.path)}
            >
              <div className="admin-card-header">
                <h3>{item.icon} {item.label}</h3>
              </div>
              <p className="sys-desc px-2 pb-3">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}
