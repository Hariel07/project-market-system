import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminStatsMock, adminChartMock } from '../../data/adminMock';
import { formatPrice } from '../../data/mockData';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const stats = adminStatsMock;

  return (
    <AdminLayout title="System Dashboard">
      <div className="admin-dash animate-fade-in-up">
        
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
              <span className="kpi-value">{stats.comerciosAtivos}</span>
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
              <span className="kpi-label">Usuários Ativos (MAU)</span>
              <span className="kpi-value">{stats.usuariosAtivos.toLocaleString('pt-BR')}</span>
              <span className="kpi-trend positive">↑ 8% vs mês anterior</span>
            </div>
          </div>
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
