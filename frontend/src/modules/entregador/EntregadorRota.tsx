import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import EntregadorLayout from './EntregadorLayout';
import { formatPrice } from '../../data/mockData';
import { api } from '../../lib/api';
import { Entrega } from '../../types/entrega';
import './EntregadorRota.css';

// Configuração de Ícones Personalizados
const motoIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3198/3198336.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const storeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/606/606547.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const homeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Coordenadas padrão (SP) usadas antes do GPS real iniciar
const DEFAULT_LAT = -23.5505;
const DEFAULT_LNG = -46.6333;

export default function EntregadorRota() {
  const { id } = useParams(); // pedidoId (UUID)
  const navigate = useNavigate();

  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [loadingEntrega, setLoadingEntrega] = useState(true);
  const [erroEntrega, setErroEntrega] = useState<string | null>(null);

  // Coordenadas da corrida (vindas do endereço do comércio e do cliente)
  const [latColeta, setLatColeta] = useState(DEFAULT_LAT);
  const [lngColeta, setLngColeta] = useState(DEFAULT_LNG);
  const [latEntrega, setLatEntrega] = useState(DEFAULT_LAT - 0.01);
  const [lngEntrega, setLngEntrega] = useState(DEFAULT_LNG + 0.01);

  // GPS Real
  const [gpsAtivo, setGpsAtivo] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentPos, setCurrentPos] = useState<[number, number]>([DEFAULT_LAT - 0.005, DEFAULT_LNG - 0.005]);
  const [distanciaAtual, setDistanciaAtual] = useState(0);
  const [velocidadeAtual, setVelocidadeAtual] = useState(0);

  // Etapas da corrida
  const [etapa, setEtapa] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Histórico de posições para traçar a rota
  const [rotaPercorrida, setRotaPercorrida] = useState<[number, number][]>([currentPos]);

  // Buscar entrega real da API
  useEffect(() => {
    if (!id) return;

    api.get(`/api/entregas/pedido/${id}`)
      .then((res: any) => {
        const data: Entrega = res.data;
        setEntrega(data);

        // Extrair coordenadas do endereço do comércio (primeiro endereço cadastrado)
        const enderecos = (data.pedido.comercio as any).enderecos;
        if (enderecos?.length > 0 && enderecos[0].lat && enderecos[0].lng) {
          setLatColeta(enderecos[0].lat);
          setLngColeta(enderecos[0].lng);
          setCurrentPos([enderecos[0].lat - 0.005, enderecos[0].lng - 0.005]);
          setRotaPercorrida([[enderecos[0].lat - 0.005, enderecos[0].lng - 0.005]]);
        }

        // Sincronizar etapa com status atual da entrega
        if (data.status === 'A_CAMINHO_COLETA') setEtapa(1);
        else if (data.status === 'A_CAMINHO_ENTREGA') setEtapa(3);
        else if (data.status === 'ENTREGUE') setEtapa(4);
      })
      .catch((err: any) => {
        console.error('Erro ao carregar entrega:', err);
        setErroEntrega('Não foi possível carregar os dados da entrega.');
      })
      .finally(() => setLoadingEntrega(false));
  }, [id]);

  // Calcular distância entre dois pontos (Haversine)
  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Rastreamento GPS
  useEffect(() => {
    if (!gpsAtivo) return;

    if (!navigator.geolocation) {
      setGpsError('Geolocalização não suportada neste navegador');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, accuracy } = position.coords;

        setCurrentPos([latitude, longitude]);
        setVelocidadeAtual(speed || 0);
        setGpsError(null);
        setRotaPercorrida(prev => [...prev, [latitude, longitude]]);

        const destLat = etapa <= 2 ? latColeta : latEntrega;
        const destLng = etapa <= 2 ? lngColeta : lngEntrega;
        const dist = calcularDistancia(latitude, longitude, destLat, destLng);
        setDistanciaAtual(parseFloat(dist.toFixed(2)));

        if (entrega?.id) {
          api.post(`/api/entregas/${entrega.id}/gps`, {
            latitude,
            longitude,
            velocidade: speed,
            precisao: accuracy,
          }).catch((err: any) => console.error('Erro ao enviar GPS:', err));
        }

        // Auto-confirmar chegada quando < 50 metros
        if (dist < 0.05 && (etapa === 1 || etapa === 3)) {
          setGpsAtivo(false);
        }
      },
      (error) => {
        setGpsError(`Erro GPS: ${error.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [gpsAtivo, etapa, latColeta, lngColeta, latEntrega, lngEntrega, entrega]);

  const handleStartNavigation = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS não disponível');
      return;
    }
    setGpsAtivo(true);
  };

  const handleNextStep = async () => {
    if (!entrega) return;
    setLoading(true);
    try {
      if (etapa === 1) {
        await api.post(`/api/entregas/${entrega.id}/coleta`, {});
        setEtapa(2);
      } else if (etapa === 2) {
        setEtapa(3);
        setGpsAtivo(true);
      } else if (etapa === 3) {
        setGpsAtivo(false);
        setEtapa(4);
      } else if (etapa === 4) {
        await api.post(`/api/entregas/${entrega.id}/entregar`, {});
        navigate('/entregador', { state: { entregueComSucesso: true } });
      }
    } catch (error) {
      console.error('Erro:', error);
      setGpsError('Erro ao atualizar status da entrega');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    switch (etapa) {
      case 1: return gpsAtivo ? `Navegando (${distanciaAtual.toFixed(2)}km)` : 'Iniciar Navegacao';
      case 2: return 'Confirmar Coleta de Pedido';
      case 3: return gpsAtivo ? `Navegando (${distanciaAtual.toFixed(2)}km)` : 'Iniciar Navegacao para Cliente';
      case 4: return 'Finalizar Entrega';
    }
  };

  const getMapTitle = () => {
    switch (etapa) {
      case 1: return `Navegando para: ${entrega?.pedido.comercio.nomeFantasia ?? '...'}`;
      case 2: return 'Na Coleta';
      case 3: return 'Navegando para o Cliente';
      case 4: return 'No Cliente';
    }
  };

  const rotaCompleta: [number, number][] = [[latColeta, lngColeta], [latEntrega, lngEntrega]];

  if (loadingEntrega) {
    return (
      <EntregadorLayout title="Carregando..." hideHeader={true}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Carregando dados da entrega...</p>
        </div>
      </EntregadorLayout>
    );
  }

  if (erroEntrega || !entrega) {
    return (
      <EntregadorLayout title="Erro" hideHeader={true}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>{erroEntrega || 'Entrega não encontrada.'}</p>
          <button className="btn btn-outline mt-3" onClick={() => navigate('/entregador')}>
            Voltar
          </button>
        </div>
      </EntregadorLayout>
    );
  }

  const nomeCliente = entrega.pedido.cliente.nome;
  const telefoneCliente = entrega.pedido.cliente.account.telefone;
  const enderecoCliente = entrega.pedido.enderecoEntrega || 'Endereço não informado';
  const nomeComercio = entrega.pedido.comercio.nomeFantasia;
  const valorEntrega = entrega.taxaRepasse ?? entrega.pedido.valorTotal;

  return (
    <EntregadorLayout title={getMapTitle()} hideHeader={true}>
      <div className="rota-full-container animate-fade-in-up">

        <div className="rota-map-view">
          <MapContainer
            center={currentPos}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController center={currentPos} />

            <Polyline positions={rotaCompleta} color="var(--color-primary)" weight={5} opacity={0.6} dashArray="10, 10" />

            {rotaPercorrida.length > 1 && (
              <Polyline positions={rotaPercorrida} color="#4CAF50" weight={4} opacity={0.8} />
            )}

            {gpsAtivo && (
              <Circle
                center={currentPos}
                radius={50}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
              />
            )}

            <Marker position={currentPos} icon={motoIcon}>
              <Popup>
                Você está aqui
                {gpsAtivo && <><br />Velocidade: {(velocidadeAtual * 3.6).toFixed(1)} km/h</>}
              </Popup>
            </Marker>

            <Marker position={[latColeta, lngColeta]} icon={storeIcon}>
              <Popup>{nomeComercio}</Popup>
            </Marker>

            <Marker position={[latEntrega, lngEntrega]} icon={homeIcon}>
              <Popup>{nomeCliente}</Popup>
            </Marker>
          </MapContainer>

          <div className="map-header-overlay">
            <button className="btn-map-back" onClick={() => navigate('/entregador')}>←</button>
            <div className="map-status-pill">
              <span className={`status-dot ${gpsAtivo ? 'pulsing' : ''}`}></span>
              {getMapTitle()}
              {gpsAtivo && <span className="gps-indicator">GPS Ativo</span>}
            </div>
            <button className="btn-map-help">?</button>
          </div>

          {gpsError && (
            <div className="map-error-alert">
              {gpsError}
            </div>
          )}
        </div>

        <div className="rota-bottom-sheet">
          <div className="sheet-handle"></div>

          <div className="sheet-header">
            <div>
              <h2 className="sheet-title">{formatPrice(valorEntrega)}</h2>
              <p className="sheet-subtitle">Valor da entrega</p>
            </div>
            <div>
              <span className="sheet-dist text-right">{distanciaAtual.toFixed(2)} km</span>
              <p className="sheet-subtitle text-right">Distância até o destino</p>
            </div>
          </div>

          <div className="sheet-details">
            {etapa <= 2 ? (
              <div className="detail-card info-card">
                <span className="detail-icon">🏬</span>
                <div className="detail-info">
                  <span className="info-title">Coletar em</span>
                  <span className="info-val">{nomeComercio}</span>
                  <span className="info-desc">Pedido #{entrega.pedidoId.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <div className="detail-card client-card">
                <span className="detail-icon">👤</span>
                <div className="detail-info">
                  <span className="info-title">Entregar para</span>
                  <span className="info-val">{nomeCliente}</span>
                  <span className="info-desc">{enderecoCliente}</span>
                </div>
                <div className="action-icons">
                  {telefoneCliente && (
                    <a href={`tel:${telefoneCliente}`} className="btn-circle">📞</a>
                  )}
                </div>
              </div>
            )}

            {etapa === 2 && (
              <div className="order-check-inf">
                <strong>Pedido:</strong> #{entrega.pedidoId.slice(-6).toUpperCase()} — Confirme com o vendedor
              </div>
            )}

            {gpsAtivo && (
              <div className="gps-status-card">
                <div className="gps-stat">
                  <span>Latitude: {currentPos[0].toFixed(6)}</span>
                </div>
                <div className="gps-stat">
                  <span>Longitude: {currentPos[1].toFixed(6)}</span>
                </div>
                <div className="gps-stat">
                  <span>Velocidade: {(velocidadeAtual * 3.6).toFixed(1)} km/h</span>
                </div>
              </div>
            )}
          </div>

          <div className="sheet-actions">
            <button
              className={`btn btn-lg btn-block ${etapa === 2 || etapa === 4 ? 'btn-accent' : 'btn-primary'} btn-swipe-effect`}
              onClick={etapa === 1 || etapa === 3 ? handleStartNavigation : handleNextStep}
              disabled={loading}
            >
              {loading ? '...' : getButtonText()}
            </button>

            {gpsAtivo && (etapa === 1 || etapa === 3) && (
              <>
                <p className="text-center text-xs mt-2 text-secondary">
                  Aproxime-se do destino para auto-confirmar
                </p>
                <button
                  className="btn btn-sm btn-outline btn-block mt-2"
                  onClick={() => setGpsAtivo(false)}
                >
                  Parar Navegação
                </button>
              </>
            )}

            {etapa === 4 && (
              <p className="text-center text-xs mt-2 text-secondary">
                Pressione confirmar apenas após o cliente receber
              </p>
            )}
          </div>
        </div>
      </div>
    </EntregadorLayout>
  );
}
