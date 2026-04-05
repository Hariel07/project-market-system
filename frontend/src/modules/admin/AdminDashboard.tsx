import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminStatsMock, adminChartMock } from '../../data/adminMock';
import { formatPrice } from '../../data/mockData';
import { api } from '../../lib/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(adminStatsMock);
  const [realStats, setRealStats] = useState<any>(null);
  const [loadingFake, setLoadingFake] = useState(false);
  const [msg, setMsg] = useState('');

  // Recupera dados do administrador logado
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('@MarketSystem:user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setRealStats(res.data);
      } catch (err) {
        console.error('Erro ao buscar stats reais:', err);
      }
    };
    fetchStats();
  }, []);

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCreateFake = async () => {
    if (!window.confirm('Deseja criar um set de contas fake (Cliente, Loja, Entregador)?')) return;
    setLoadingFake(true);
    setMsg('');
    try {
      await api.post('admin/fake-data/create');
      setMsg('✅ Contas fake criadas com sucesso!');
      window.location.reload();
    } catch (err) {
      setMsg('❌ Erro ao criar contas fake.');
    } finally {
      setLoadingFake(false);
    }
  };

  const handleDeleteFake = async () => {
    if (!window.confirm('TEM CERTEZA? Isso removerá TODAS as contas marcadas como isFake.')) return;
    setLoadingFake(true);
    setMsg('');
    try {
      await api.delete('admin/fake-data/cleanup');
      setMsg('✅ Contas fake removidas!');
      window.location.reload();
    } catch (err) {
      setMsg('❌ Erro ao remover contas fake.');
    } finally {
      setLoadingFake(false);
    }
  };

  return (
    <AdminLayout title="System Dashboard">
      <div className="admin-dash animate-fade-in-up">

        {/* Perfil do Administrador Master */}
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
              <span className="gestor-detail-item">📧 {user?.email}</span>
              <span className="gestor-detail-item">📱 {user?.telefone || 'Não informado'}</span>
              <span className="gestor-detail-item">🔑 Perfil: {user?.role}</span>
            </div>
          </div>
          <button className="gestor-edit-btn" onClick={() => navigate('/admin/perfil')}>
            ⚙️ Editar Perfil
          </button>
        </div>
        
        {/* Top KPI Cards */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="kpi-icon bg-primary-subtle text-primary">💰</div>
            <div className="kpi-info">
              <span className="kpi-label">GMV Mensal Transacionado</span>
              <span className="kpi-value">{formatPrice(stats.gmvMensal)}</span>
              <span className="kpi-trend positive">↑ {stats.taxaCrescimento}%</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="kpi-icon bg-accent-subtle text-accent-dark">🏪</div>
            <div className="kpi-info">
              <span className="kpi-label">Comércios Ativos</span>
              <span className="kpi-value">{realStats?.totalCommerces ?? stats.comerciosAtivos}</span>
              <span className="kpi-trend positive">+ {stats.novosCadastros} novos na semana</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="kpi-icon bg-warning-subtle text-warning-dark">💳</div>
            <div className="kpi-info">
              <span className="kpi-label">Receita de Planos (MRR)</span>
              <span className="kpi-value">{formatPrice(stats.mensalidades)}</span>
              <span className="kpi-trend">Líquido estimado</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="kpi-icon bg-blue-subtle text-blue-dark">👤</div>
            <div className="kpi-info">
              <span className="kpi-label">Total de Usuários</span>
              <span className="kpi-value">{(realStats?.totalUsers ?? stats.usuariosAtivos).toLocaleString('pt-BR')}</span>
              <span className="kpi-trend positive">Base de dados real</span>
            </div>
          </div>
        </div>

        {/* Developer / Owner Actions */}
        <div className="admin-card mb-6" style={{ border: '2px solid #6366f133' }}>
          <div className="admin-card-header">
            <h3>⚡ Ações Rápidas do Owner (Testes)</h3>
            {realStats?.totalFake > 0 && (
              <span className="badge badge-warning">{realStats.totalFake} Contas Fake detectadas</span>
            )}
          </div>
          <div className="flex gap-4 p-2">
            <button 
              className="btn btn-primary" 
              onClick={handleCreateFake}
              disabled={loadingFake}
            >
              🚀 Criar Massa de Teste (1 clique)
            </button>
            <button 
              className="btn btn-outline btn-danger" 
              onClick={handleDeleteFake}
              disabled={loadingFake}
            >
              🗑 Limpar Todas as Contas Fake
            </button>
            {msg && <span className="ml-4 self-center font-bold">{msg}</span>}
          </div>
          <p className="sys-desc px-2 pb-2">Use estas ferramentas para popular o sistema rapidamente para demonstração ou testes práticos.</p>
        </div>

        {/* C4 Model Style Chart (Mocked CSS Graphic) */}
        <div className="admin-row">
          <div className="admin-card col-span-2 delay-1 animate-fade-in-up">
            <div className="admin-card-header">
              <h3>Volume de Vendas Global (GMV Geral) - 6 meses</h3>
              <button className="btn btn-sm btn-outline">Exportar</button>
            </div>
            
            <div className="admin-chart-container">
              {/* CSS Only Mock Chart */}
              <div className="mock-bar-chart">
                {adminChartMock.map((data, idx) => {
                  const maxGmv = Math.max(...adminChartMock.map(d => d.gmv));
                  const height = (data.gmv / maxGmv) * 100;
                  return (
                    <div key={idx} className="bar-wrapper">
                      <div className="bar-value-tooltip">{formatPrice(data.gmv)}</div>
                      <div className="bar" style={{ height: `${height}%` }}></div>
                      <span className="bar-label">{data.mes}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="admin-card delay-2 animate-fade-in-up">
            <div className="admin-card-header">
              <h3>Status do Sistema</h3>
            </div>
            <div className="system-status-list">
              <div className="sys-status-item">
                <span className="status-dot healthy"></span>
                <div className="sys-status-text">
                  <strong>API Gateway</strong>
                  <span>Operação normal (99.9% uptime)</span>
                </div>
              </div>
              <div className="sys-status-item">
                <span className="status-dot healthy"></span>
                <div className="sys-status-text">
                  <strong>Mensageria Kafka</strong>
                  <span>14 mil eventos/min</span>
                </div>
              </div>
              <div className="sys-status-item">
                <span className="status-dot warning"></span>
                <div className="sys-status-text">
                  <strong>Emissão NF-e (Provedor)</strong>
                  <span>Latência alta detectada (+2s)</span>
                </div>
              </div>
              <div className="sys-status-item">
                <span className="status-dot healthy"></span>
                <div className="sys-status-text">
                  <strong>Serviço de Rastreio (gRPC)</strong>
                  <span>840 entregadores conectados</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
