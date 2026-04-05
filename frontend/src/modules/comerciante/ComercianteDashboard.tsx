import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardStatsMock, vendasSemana, pedidosComercioMock, alertasMock } from '../../data/comercianteMock';
import { formatPrice } from '../../data/mockData';
import ComercianteLayout from './ComercianteLayout';
import './ComercianteDashboard.css';

export default function ComercianteDashboard() {
  const navigate = useNavigate();
  const stats = dashboardStatsMock;
  
  // Recupera dados do usuário logado (Perfil + Conta)
  const [user] = useState(() => {
    const saved = localStorage.getItem('@MarketSystem:user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const pedidosNovos = pedidosComercioMock.filter(p => p.status === 'novo');
  const maxVenda = Math.max(...vendasSemana.map(v => v.valor));

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <ComercianteLayout 
      title="Dashboard" 
      subtitle="Visão geral do seu comércio hoje"
      actions={
        <>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/comerciante/pedidos')}>
            📋 Ver pedidos
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/comerciante/item/novo')}>
            ➕ Novo item
          </button>
        </>
      }
    >
      {/* Perfil do Gestor (Conta vinculada ao CPF) */}
      <div className="gestor-profile-card animate-fade-in-up">
        <div className="gestor-avatar">
          {user?.nomeCompleto?.charAt(0) || user?.nome?.charAt(0) || '👤'}
        </div>
        <div className="gestor-info">
          <div className="gestor-main">
            <h3 className="gestor-name">{user?.nomeCompleto || user?.nome || 'Gestor'}</h3>
            <span className="gestor-badge">CPF: {formatCPF(user?.cpf)}</span>
          </div>
          <div className="gestor-details">
            <span className="gestor-detail-item">📧 {user?.email}</span>
            <span className="gestor-detail-item">📱 {user?.telefone || 'Não informado'}</span>
            <span className="gestor-detail-item">🔑 Perfil: {user?.role}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm gestor-edit-btn" onClick={() => navigate('/comerciante/perfil')}>
          ⚙️ Editar Perfil
        </button>
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
    </ComercianteLayout>
  );
}
