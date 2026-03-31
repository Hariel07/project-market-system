import { useNavigate } from 'react-router-dom';
import EntregadorLayout from './EntregadorLayout';
import { historicoMock, entregadorStatsMock } from '../../data/entregadorMock';
import { formatPrice } from '../../data/mockData';
import './EntregadorHistorico.css';

export default function EntregadorHistorico() {
  const navigate = useNavigate();

  return (
    <EntregadorLayout title="Ganhos e Histórico">
      <div className="ent-historico">
        
        {/* Resumo da Semana */}
        <div className="ent-balanco-card animate-fade-in-up">
          <span className="balanco-subtitle">Saldo Disponível (Semana)</span>
          <h2 className="balanco-title">{formatPrice(entregadorStatsMock.saldoSemana)}</h2>
          <div className="balanco-actions">
            <button className="btn btn-primary balance-btn">Transferir via Pix</button>
          </div>
        </div>

        {/* Resumo de Hoje */}
        <div className="ent-historico-hoje animate-fade-in-up delay-1">
          <div className="hist-hoje-header">
            <h3>Hoje</h3>
            <span>{formatPrice(entregadorStatsMock.ganhosHoje)}</span>
          </div>
          <div className="hist-meters">
            <div className="hist-meter">
              <span className="meter-label">Entregas</span>
              <div className="meter-val">{historicoMock.filter(h => h.status === 'concluida' && h.data.includes('Hoje')).length}</div>
            </div>
            <div className="hist-meter">
              <span className="meter-label">Caixinhas</span>
              <div className="meter-val text-accent">
                {formatPrice(historicoMock.reduce((acc, curr) => curr.data.includes('Hoje') ? acc + curr.caixinha : acc, 0))}
              </div>
            </div>
            <div className="hist-meter">
              <span className="meter-label">Km Rodado</span>
              <div className="meter-val">12.5 km</div>
            </div>
          </div>
        </div>

        {/* Lista de Histórico */}
        <div className="ent-historico-lista animate-fade-in-up delay-2">
          <h3 className="section-title">Últimas Corridas</h3>
          
          <div className="hist-list">
            {historicoMock.map(hist => (
              <div key={hist.id} className={`hist-card ${hist.status === 'cancelada' ? 'hist-cancelado' : ''}`}>
                <div className="hist-icon">
                  {hist.status === 'concluida' ? '✅' : '❌'}
                </div>
                <div className="hist-details">
                  <span className="hist-date">{hist.data}</span>
                  <span className="hist-rest">{hist.restaurante}</span>
                  {hist.status === 'concluida' ? (
                    <span className="hist-desc">
                      Recebido na entrega · {hist.distanciaTotal}km
                      {hist.caixinha > 0 && <span className="hist-tip"> + {formatPrice(hist.caixinha)} caixinha</span>}
                    </span>
                  ) : (
                    <span className="hist-desc text-danger">Corrida cancelada</span>
                  )}
                </div>
                <div className="hist-value">
                  {hist.status === 'concluida' ? formatPrice(hist.valorDaCorrida + hist.caixinha) : '-'}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </EntregadorLayout>
  );
}
