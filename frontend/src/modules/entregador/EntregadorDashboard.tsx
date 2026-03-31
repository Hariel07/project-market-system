import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EntregadorLayout from './EntregadorLayout';
import { entregadorStatsMock, oportunidadesMock } from '../../data/entregadorMock';
import { formatPrice } from '../../data/mockData';
import './EntregadorDashboard.css';

export default function EntregadorDashboard() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);

  const stats = entregadorStatsMock;

  return (
    <EntregadorLayout title="Início">
      <div className="ent-dashboard animate-fade-in-up">
        {/* Toggle Online/Offline Header */}
        <div className={`ent-status-header ${isOnline ? 'online' : 'offline'}`}>
          <div className="ent-status-info">
            <h2>{isOnline ? 'Você está Online' : 'Você está Offline'}</h2>
            <p>{isOnline ? 'Procurando corridas perto de você...' : 'Fique online para receber pedidos'}</p>
          </div>
          <label className="ent-switcher">
            <input 
              type="checkbox" 
              checked={isOnline} 
              onChange={e => setIsOnline(e.target.checked)} 
              id="toggle-online" 
            />
            <span className="ent-slider round"></span>
          </label>
        </div>

        {/* Resumo do dia (só mostra offline pra não poluir, ou mostra sempre pequeno) */}
        {!isOnline && (
          <div className="ent-stats-card animate-fade-in-up delay-1">
            <h3 className="ent-section-title">Resumo de Hoje</h3>
            <div className="ent-stats-grid">
              <div className="ent-stat-item highlight">
                <span className="ent-stat-label">Ganhos</span>
                <span className="ent-stat-val">{formatPrice(stats.ganhosHoje)}</span>
              </div>
              <div className="ent-stat-item">
                <span className="ent-stat-label">Corridas</span>
                <span className="ent-stat-val">{stats.corridasHoje}</span>
              </div>
              <div className="ent-stat-item">
                <span className="ent-stat-label">Aceitação</span>
                <span className="ent-stat-val">{stats.taxaAceitacao}%</span>
              </div>
              <div className="ent-stat-item">
                <span className="ent-stat-label">Nota</span>
                <span className="ent-stat-val">⭐ {stats.avaliacao}</span>
              </div>
            </div>
            <button className="btn btn-outline btn-block mt-3" onClick={() => navigate('/entregador/ganhos')}>
              Ver detalhes dos ganhos →
            </button>
          </div>
        )}

        {/* Mapa Mockado do radar */}
        {isOnline && (
          <div className="ent-radar-map animate-fade-in-up">
            <div className="radar-circle"></div>
            <div className="radar-circle delay"></div>
            <span className="radar-icon">🛵</span>
            <div className="hotzone" style={{ top: '20%', left: '30%' }}>🔥 Alta demanda</div>
            <div className="hotzone" style={{ bottom: '30%', right: '20%' }}>🔥 Moderada</div>
          </div>
        )}

        {/* Lista de Oportunidades Pendentes */}
        {isOnline && (
          <div className="ent-oportunidades animate-fade-in-up delay-1">
            <h3 className="ent-section-title flex-between">
              Corridas Disponíveis
              <span className="badge badge-primary bounce">{oportunidadesMock.length}</span>
            </h3>

            <div className="ent-opp-list">
              {oportunidadesMock.map(opp => (
                <div key={opp.id} className="ent-opp-card" onClick={() => navigate(`/entregador/rota/${opp.id}`)}>
                  {/* Tempo expirando barrinha animada */}
                  <div className="ent-opp-timer-bar">
                    <div className="ent-opp-timer-fill" style={{ animationDuration: `${opp.expiraEm}s` }}></div>
                  </div>
                  
                  <div className="ent-opp-body">
                    <div className="ent-opp-top">
                      <span className="ent-opp-price">{formatPrice(opp.valor)}</span>
                      <span className="ent-opp-time">⌚ {opp.tempoEstimado} min</span>
                    </div>
                    
                    <div className="ent-opp-route">
                      <div className="route-point start">
                        <span className="route-dot"></span>
                        <div className="route-texts">
                          <span className="route-title">Coleta · {opp.distanciaColeta}km</span>
                          <span className="route-desc">{opp.restaurante}</span>
                        </div>
                      </div>
                      <div className="route-line"></div>
                      <div className="route-point end">
                        <span className="route-dot pulse"></span>
                        <div className="route-texts">
                          <span className="route-title">Entrega · {opp.distanciaEntrega}km</span>
                          <span className="route-desc">{opp.enderecoEntrega}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ent-opp-actions">
                      <button className="btn btn-ghost btn-sm text-danger">Recusar</button>
                      <button className="btn btn-primary flex-1 btn-bump">ACEITAR CORRIDA</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </EntregadorLayout>
  );
}
