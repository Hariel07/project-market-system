import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EntregadorLayout from './EntregadorLayout';
import { oportunidadesMock } from '../../data/entregadorMock';
import { formatPrice } from '../../data/mockData';
import './EntregadorRota.css';

export default function EntregadorRota() {
  const { id } = useParams();
  const navigate = useNavigate();
  const corrida = oportunidadesMock.find(o => o.id === Number(id)) || oportunidadesMock[0];

  // Etapas da corrida:
  // 1: Indo pro restaurante / 2: Chegou / 3: Indo pro cliente / 4: Entregue
  const [etapa, setEtapa] = useState<1 | 2 | 3 | 4>(1);

  // Mock progress map
  const [progressoMapa, setProgressoMapa] = useState(0);

  useEffect(() => {
    // Animar o pino no mapa até chegar a 100%
    if (etapa === 1 || etapa === 3) {
      setProgressoMapa(0);
      const timer = setInterval(() => {
        setProgressoMapa(p => {
          if (p >= 100) {
            clearInterval(timer);
            return 100;
          }
          return p + 2;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [etapa]);

  const handleNextStep = () => {
    if (etapa === 1) setEtapa(2);
    else if (etapa === 2) setEtapa(3);
    else if (etapa === 3) setEtapa(4);
    else {
      // Finalizou, volta pro dash
      navigate('/entregador');
    }
  };

  const getButtonText = () => {
    switch (etapa) {
      case 1: return '📍 Cheguei na Coleta';
      case 2: return '📦 Confirmar Coleta de Pedido';
      case 3: return '🏠 Cheguei no Destino';
      case 4: return '✅ Finalizar Entrega';
    }
  };

  const getMapTitle = () => {
    switch (etapa) {
      case 1: return `Navegando para: ${corrida.restaurante}`;
      case 2: return 'Na Coleta';
      case 3: return `Navegando para o Cliente`;
      case 4: return 'No Cliente';
    }
  };

  return (
    <EntregadorLayout title={getMapTitle()} hideHeader={true}>
      <div className="rota-full-container animate-fade-in-up">
        
        {/* Mapa Fullscreen Mockado */}
        <div className="rota-map-view">
          {/* Mock Map Background Layer */}
          <div className="map-tiles bg-layer"></div>

          {/* User Marker (Delivery) */}
          <div 
            className="map-marker delivery-guy" 
            style={{ 
              top: `${etapa === 1 || etapa === 2 ? 60 - (progressoMapa * 0.4) : 20 + (progressoMapa * 0.4)}%`, 
              left: `${etapa === 1 || etapa === 2 ? 20 + (progressoMapa * 0.3) : 50 + (progressoMapa * 0.3)}%` 
            }}
          >
            🛵
            <span className="marker-pulse"></span>
          </div>

          {/* Coleta Marker */}
          {(etapa === 1 || etapa === 2) && (
            <div className="map-marker pickup-point" style={{ top: '20%', left: '50%' }}>
              🏬
              <div className="marker-label">{corrida.restaurante}</div>
            </div>
          )}

          {/* Delivery Marker */}
          {(etapa >= 3) && (
            <div className="map-marker drop-point" style={{ top: '60%', left: '80%' }}>
              🏠
              <div className="marker-label">Cliente</div>
            </div>
          )}

          {/* Header flutuante sobre o mapa */}
          <div className="map-header-overlay">
            <button className="btn-map-back" onClick={() => navigate('/entregador')}>←</button>
            <div className="map-status-pill">
              <span className="status-dot pulsing"></span>
              {getMapTitle()}
            </div>
            <button className="btn-map-help">?</button>
          </div>
        </div>

        {/* Action Bottom Sheet (Arrastável no app real, fixo aqui) */}
        <div className="rota-bottom-sheet">
          <div className="sheet-handle"></div>
          
          <div className="sheet-header">
            <div>
              <h2 className="sheet-title">{formatPrice(corrida.valor)}</h2>
              <p className="sheet-subtitle">Valor da entrega</p>
            </div>
            <div>
              <span className="sheet-dist text-right">{etapa <= 2 ? corrida.distanciaColeta : corrida.distanciaEntrega} km</span>
              <p className="sheet-subtitle text-right">Distância até o local</p>
            </div>
          </div>

          <div className="sheet-details">
            {etapa <= 2 ? (
              <div className="detail-card info-card">
                <span className="detail-icon">🏬</span>
                <div className="detail-info">
                  <span className="info-title">Restaurante</span>
                  <span className="info-val">{corrida.restaurante}</span>
                  <span className="info-desc">{corrida.enderecoColeta}</span>
                </div>
              </div>
            ) : (
              <div className="detail-card client-card">
                <span className="detail-icon">👤</span>
                <div className="detail-info">
                  <span className="info-title">Entregar para</span>
                  <span className="info-val">Cliente VIP</span>
                  <span className="info-desc">{corrida.enderecoEntrega}</span>
                  <p className="obs-client">Instruções: Deixar na portaria com o seu João.</p>
                </div>
                <div className="action-icons">
                  <button className="btn-circle">💬</button>
                  <button className="btn-circle">📞</button>
                </div>
              </div>
            )}
            
            {etapa === 2 && (
              <div className="order-check-inf">
                <strong>Número do Pedido:</strong> #8942<br/>
                Mostre este número ao restaurante.
              </div>
            )}
          </div>

          <div className="sheet-actions">
            <button 
              className={`btn btn-lg btn-block ${etapa === 2 || etapa === 4 ? 'btn-accent' : 'btn-primary'} btn-swipe-effect`} 
              onClick={handleNextStep}
              disabled={progressoMapa < 100 && (etapa === 1 || etapa === 3)}
            >
              {getButtonText()}
            </button>
            
            {etapa === 4 && (
              <p className="text-center text-xs mt-2 text-secondary">Aguarde o cliente receber antes de finalizar</p>
            )}
          </div>
        </div>
      </div>
    </EntregadorLayout>
  );
}
