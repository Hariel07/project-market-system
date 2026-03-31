import { useNavigate } from 'react-router-dom';
import { dashboardStatsMock, vendasSemana, pedidosComercioMock, alertasMock } from '../../data/comercianteMock';
import { formatPrice } from '../../data/mockData';
import './ComercianteDashboard.css';

export default function ComercianteDashboard() {
  const navigate = useNavigate();
  const stats = dashboardStatsMock;
  const pedidosNovos = pedidosComercioMock.filter(p => p.status === 'novo');
  const maxVenda = Math.max(...vendasSemana.map(v => v.valor));

  return (
    <div className="com-dashboard">
      {/* Sidebar (desktop) */}
      <aside className="com-sidebar hide-mobile">
        <div className="sidebar-brand">
          <span className="sidebar-logo">🏪</span>
          <span className="sidebar-name">Mercado<br/>Bom Preço</span>
        </div>
        <nav className="sidebar-nav">
          {[
            { icon: '📊', label: 'Dashboard', path: '/comerciante' },
            { icon: '📋', label: 'Pedidos', path: '/comerciante/pedidos' },
            { icon: '📦', label: 'Catálogo', path: '/comerciante/catalogo' },
            { icon: '🏷️', label: 'Estoque', path: '/comerciante/estoque' },
            { icon: '➕', label: 'Novo Item', path: '/comerciante/item/novo' },
            { icon: '⚙️', label: 'Configurações', path: '/comerciante/config' },
          ].map(item => (
            <button
              key={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button className="sidebar-link sidebar-logout" onClick={() => navigate('/login')}>
          <span className="sidebar-icon">🚪</span>
          Sair
        </button>
      </aside>

      {/* Mobile top bar */}
      <header className="com-topbar hide-tablet-up">
        <div className="com-topbar-inner">
          <div className="com-topbar-brand">
            <span>🏪</span>
            <span className="com-topbar-name">Mercado Bom Preço</span>
          </div>
          <button className="com-topbar-bell" onClick={() => navigate('/comerciante/pedidos')}>
            🔔
            {pedidosNovos.length > 0 && <span className="bell-badge">{pedidosNovos.length}</span>}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="com-main">
        <div className="com-content">
          {/* Header */}
          <div className="com-header animate-fade-in-up">
            <div>
              <h1 className="com-page-title">Dashboard</h1>
              <p className="com-page-subtitle">Visão geral do seu comércio hoje</p>
            </div>
            <div className="com-header-actions hide-mobile">
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/comerciante/pedidos')}>
                📋 Ver pedidos
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/comerciante/item/novo')}>
                ➕ Novo item
              </button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="stats-grid animate-fade-in-up delay-1">
            <div className="stat-card-com stat-vendas">
              <div className="stat-card-icon">💰</div>
              <div className="stat-card-info">
                <span className="stat-card-label">Vendas hoje</span>
                <span className="stat-card-value">{formatPrice(stats.vendasHoje)}</span>
              </div>
              <span className="stat-card-trend positive">↑ {stats.crescimento}%</span>
            </div>
            <div className="stat-card-com stat-pedidos">
              <div className="stat-card-icon">📋</div>
              <div className="stat-card-info">
                <span className="stat-card-label">Pedidos hoje</span>
                <span className="stat-card-value">{stats.pedidosHoje}</span>
              </div>
              <span className="stat-card-badge">{stats.pedidosPendentes} pendentes</span>
            </div>
            <div className="stat-card-com stat-ticket">
              <div className="stat-card-icon">🎫</div>
              <div className="stat-card-info">
                <span className="stat-card-label">Ticket médio</span>
                <span className="stat-card-value">{formatPrice(stats.ticketMedio)}</span>
              </div>
            </div>
            <div className="stat-card-com stat-estoque" onClick={() => navigate('/comerciante/estoque')}>
              <div className="stat-card-icon">⚠️</div>
              <div className="stat-card-info">
                <span className="stat-card-label">Estoque baixo</span>
                <span className="stat-card-value">{stats.itensEstoqueBaixo} itens</span>
              </div>
              <span className="stat-card-link">Ver →</span>
            </div>
          </div>

          {/* Chart + Orders row */}
          <div className="dashboard-grid animate-fade-in-up delay-2">
            {/* Mini chart */}
            <div className="chart-card">
              <div className="section-header">
                <h2 className="section-title">📈 Vendas da semana</h2>
                <span className="chart-total">{formatPrice(stats.faturamentoMes)}/mês</span>
              </div>
              <div className="chart-bars">
                {vendasSemana.map((d, i) => (
                  <div key={i} className="chart-bar-group">
                    <div className="chart-bar-wrapper">
                      <div
                        className="chart-bar"
                        style={{ height: `${(d.valor / maxVenda) * 100}%` }}
                      />
                    </div>
                    <span className="chart-bar-label">{d.dia}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pedidos novos */}
            <div className="orders-card">
              <div className="section-header">
                <h2 className="section-title">🔔 Pedidos novos</h2>
                <button className="section-link" onClick={() => navigate('/comerciante/pedidos')}>
                  Ver todos →
                </button>
              </div>
              {pedidosNovos.length === 0 ? (
                <p className="no-orders">Nenhum pedido novo 🎉</p>
              ) : (
                <div className="new-orders-list">
                  {pedidosNovos.map(pedido => (
                    <div key={pedido.id} className="new-order-item" onClick={() => navigate('/comerciante/pedidos')}>
                      <div className="new-order-info">
                        <span className="new-order-number">{pedido.numero}</span>
                        <span className="new-order-client">{pedido.clienteNome}</span>
                      </div>
                      <div className="new-order-right">
                        <span className="new-order-total">{formatPrice(pedido.total)}</span>
                        <span className="new-order-time">{pedido.tempoDecorrido}</span>
                      </div>
                      <div className="new-order-actions">
                        <button className="btn btn-accent btn-sm">✓ Aceitar</button>
                        <button className="btn btn-ghost btn-sm">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Alertas */}
          <div className="alerts-section animate-fade-in-up delay-3">
            <div className="section-header">
              <h2 className="section-title">⚡ Alertas</h2>
            </div>
            <div className="alerts-list">
              {alertasMock.slice(0, 4).map(alerta => (
                <div key={alerta.id} className="alert-item">
                  <span className="alert-icon">{alerta.icon}</span>
                  <span className="alert-msg">{alerta.msg}</span>
                  <span className="alert-time">{alerta.tempo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="com-bottom-nav hide-tablet-up">
          {[
            { icon: '📊', label: 'Início', path: '/comerciante' },
            { icon: '📋', label: 'Pedidos', path: '/comerciante/pedidos' },
            { icon: '📦', label: 'Catálogo', path: '/comerciante/catalogo' },
            { icon: '🏷️', label: 'Estoque', path: '/comerciante/estoque' },
            { icon: '⚙️', label: 'Mais', path: '/comerciante/config' },
          ].map(item => (
            <button
              key={item.path}
              className={`com-bnav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="com-bnav-icon">{item.icon}</span>
              <span className="com-bnav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
