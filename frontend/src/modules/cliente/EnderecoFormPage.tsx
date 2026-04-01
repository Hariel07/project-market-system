import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import TopBar from '../../shared/components/TopBar';
import { api } from '../../lib/api';
import './PerfilPage.css';
import './EnderecosUi.css';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ROTULOS = [
  { id: 'CASA', icone: '🏠', label: 'Casa' },
  { id: 'TRABALHO', icone: '🏢', label: 'Trabalho' },
  { id: 'OUTRO', icone: '📍', label: 'Outro' },
];

function LocationMarker({ position, setPosition, reverseGeocode }: any) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, { animate: true });
    }
  }, [position, map]);

  useMapEvents({
    click(e: any) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      reverseGeocode(newPos.lat, newPos.lng);
    },
  });
  return position === null ? null : (
    <Marker position={[position.lat, position.lng]} icon={customIcon} />
  );
}

export default function EnderecoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchingGeo, setFetchingGeo] = useState(false);

  // Map state
  const [position, setPosition] = useState<{lat: number, lng: number}>({ lat: -23.5505, lng: -46.6333 }); // SP Default
  
  // Form state
  const [form, setForm] = useState({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    pontoReferencia: '',
    rotulo: 'CASA',
    icone: '🏠',
    isPrincipal: false
  });

  // Busca inicial (se for edição ou GPS inicial se for novo)
  useEffect(() => {
    if (isEditing) {
      loadAddress();
    } else {
      // Prepara um fallback visual imediato para não deixar os campos vazios caso o GPS demore ou trave.
      reverseGeocode(-23.5505, -46.6333);

      // Tenta pegar GPS real do celular/desktop com Timeout rigoroso de 5s
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          reverseGeocode(newPos.lat, newPos.lng);
        }, (err) => {
          console.warn('GPS negado ou demorou demais, mantendo SP:', err);
        }, { timeout: 5000, enableHighAccuracy: true, maximumAge: 0 });
      }
    }
  }, [id]);

  const loadAddress = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/perfil/enderecos');
      const address = res.data.find((end: any) => end.id === id);
      if (address) {
        setForm({
          logradouro: address.logradouro || '',
          numero: address.numero || '',
          complemento: address.complemento || '',
          bairro: address.bairro || '',
          cidade: address.cidade || '',
          estado: address.estado || '',
          cep: address.cep || '',
          pontoReferencia: address.pontoReferencia === '⚠️ Favor atualizar este endereço no seu Perfil' ? '' : (address.pontoReferencia || ''),
          rotulo: address.rotulo || 'CASA',
          icone: address.icone || '🏠',
          isPrincipal: address.isPrincipal || false
        });
        if (address.lat && address.lng) {
          setPosition({ lat: address.lat, lng: address.lng });
        }
      } else {
        alert('Endereço não encontrado.');
        navigate('/cliente/enderecos');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setFetchingGeo(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&email=suporte@marketsystem.com`);
      const data = await resp.json();
      
      const addr = data.address;
      if (addr) {
        setForm(prev => ({
          ...prev,
          logradouro: addr.road || addr.street || addr.pedestrian || addr.path || addr.highway || addr.footway || '',
          numero: addr.house_number || prev.numero,
          complemento: addr.building || prev.complemento,
          bairro: addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || addr.residential || addr.hamlet || '',
          cidade: addr.city || addr.town || addr.village || addr.municipality || '',
          estado: addr.state || addr.region || '',
          cep: addr.postcode ? addr.postcode.replace(/\D/g, '').replace(/^(\d{5})(\d{3})/, '$1-$2') : prev.cep
        }));
      } else {
        console.log('Nenhum detalhe de endereço retornado pelo Nominatim:', data);
      }
    } catch (error) {
      console.error('Reverse Geocode falhou (Provável bloqueio de rede/CORS):', error);
    } finally {
      setFetchingGeo(false);
    }
  };

  const handleCepSearch = async (cepValue: string) => {
    const rawCep = cepValue.replace(/\D/g, '');
    if (rawCep.length !== 8) return;

    setFetchingGeo(true);
    try {
      const viaCepRes = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const viaCepData = await viaCepRes.json();

      if (viaCepData && !viaCepData.erro) {
        setForm(prev => ({
          ...prev,
          logradouro: viaCepData.logradouro || '',
          bairro: viaCepData.bairro || '',
          cidade: viaCepData.localidade || '',
          estado: viaCepData.uf || '',
          cep: viaCepData.cep || ''
        }));

        // Buscar cordenadas a partir do logradouro extraído
        const query = `${viaCepData.logradouro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`;
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&email=suporte@marketsystem.com`);
        const nomData = await nomRes.json();

        if (nomData && nomData.length > 0) {
          const lat = parseFloat(nomData[0].lat);
          const lng = parseFloat(nomData[0].lon);
          setPosition({ lat, lng });
        }
      }
    } catch (err) {
      console.error('Fallo no ViaCEP/Geocode:', err);
    } finally {
      setFetchingGeo(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(prev => ({...prev, cep: val}));
    if (val.replace(/\D/g, '').length === 8) {
       handleCepSearch(val);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pontoReferencia.trim()) {
       alert('Por favor, informe um Ponto de Referência detalhado.');
       return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        lat: position.lat,
        lng: position.lng
      };

      if (isEditing) {
        await api.put(`/api/perfil/enderecos/${id}`, payload);
      } else {
        await api.post('/api/perfil/enderecos', payload);
      }
      navigate('/cliente/enderecos');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="perfil-page" style={{ paddingBottom: '90px' }}>
      <TopBar title={isEditing ? "Editar Endereço" : "Novo Endereço"} showBack showCart={false} />
      
      <main className="page-content">
        <div className="container" style={{ padding: '1rem' }}>
          
          <div className="map-premium-wrapper animate-fade-in-up">
            <MapContainer center={[position.lat, position.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} reverseGeocode={reverseGeocode} />
            </MapContainer>
            {fetchingGeo && (
              <div className="map-overlay-badge animate-fade-in-up">
                <span className="spinner" style={{ width: '14px', height: '14px', borderTopColor: 'var(--primary)', borderWidth: '2px' }}/> Localizando...
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ display: 'inline-block', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border)' }}>
              👇 Arraste o mapa ou digite o CEP
            </span>
          </div>

          <form onSubmit={handleSave} className="form-premium-card animate-fade-in-up delay-1">
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group">
                <label>Rua / Avenida *</label>
                <input type="text" className="input-premium" value={form.logradouro} onChange={e => setForm({...form, logradouro: e.target.value})} required readOnly={fetchingGeo} />
              </div>
              <div className="input-group">
                <label>Número *</label>
                <input type="text" className="input-premium" placeholder="Ex: 34" value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} required />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label>Complemento (Opcional)</label>
              <input type="text" className="input-premium" placeholder="Apto, Bloco, etc" value={form.complemento} onChange={e => setForm({...form, complemento: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group">
                <label>Bairro *</label>
                <input type="text" className="input-premium" value={form.bairro} onChange={e => setForm({...form, bairro: e.target.value})} required readOnly={fetchingGeo}/>
              </div>
              <div className="input-group">
                <label>CEP *</label>
                <input 
                  type="text" 
                  className={`input-premium ${!fetchingGeo && 'cep-highlight'}`} 
                  placeholder="00000-000" 
                  value={form.cep} 
                  onChange={handleCepChange} 
                  readOnly={fetchingGeo}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group">
                <label>Cidade *</label>
                <input type="text" className="input-premium" value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})} required readOnly={fetchingGeo}/>
              </div>
              <div className="input-group">
                <label>UF *</label>
                <input type="text" className="input-premium" placeholder="Ex: SP" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} required readOnly={fetchingGeo}/>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label>Ponto de Referência <span style={{color: 'var(--danger)'}}>*</span></label>
              <textarea 
                className="input-premium" 
                rows={2}
                placeholder="Exemplo: Casa amarela com portão preto."
                style={{ resize: 'none' }}
                value={form.pontoReferencia} 
                onChange={e => setForm({...form, pontoReferencia: e.target.value})} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Salvar como</label>
              <div className="rotulo-selector">
                {ROTULOS.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm({...form, rotulo: r.id, icone: r.icone})}
                    className={`btn-rotulo ${form.rotulo === r.id ? 'active' : ''}`}
                  >
                    <span className="icon">{r.icone}</span>
                    <span className="label">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
              <input 
                type="checkbox" 
                id="isPrincipal" 
                checked={form.isPrincipal} 
                onChange={e => setForm({...form, isPrincipal: e.target.checked})} 
                style={{ width: '1.4rem', height: '1.4rem', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="isPrincipal" style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>Usar como Meu Endereço Padrão</label>
            </div>

            <button 
              type="submit" 
              className={`btn-concluir-premium ${loading ? 'loading' : ''}`} 
              disabled={loading}
            >
              {loading ? <span className="btn-loading"><span className="spinner" /> Salvando...</span> : 'Concluir Endereço'}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}
