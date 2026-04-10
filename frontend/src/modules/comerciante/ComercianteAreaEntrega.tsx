import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import MapaEntrega from '../../shared/components/MapaEntrega';
import { api } from '../../lib/api';

interface FormState {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  lat: string;
  lng: string;
  raioEntregaKm: number;
}

export default function ComercianteAreaEntrega() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [detectandoGps, setDetectandoGps] = useState(false);
  const [msgCep, setMsgCep] = useState('');

  const [form, setForm] = useState<FormState>({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    lat: '',
    lng: '',
    raioEntregaKm: 5,
  });

  useEffect(() => {
    api.get('comercios/me').then(({ data }) => {
      setForm(f => ({
        ...f,
        cidade: data.cidade || '',
        estado: data.estado || '',
        lat: data.lat != null ? String(data.lat) : '',
        lng: data.lng != null ? String(data.lng) : '',
        raioEntregaKm: data.raioEntregaKm ?? 5,
        // Try to get address from enderecos[]
        logradouro: data.enderecos?.[0]?.logradouro || '',
        numero: data.enderecos?.[0]?.numero || '',
        complemento: data.enderecos?.[0]?.complemento || '',
        bairro: data.enderecos?.[0]?.bairro || '',
        cep: data.enderecos?.[0]?.cep || '',
      }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // ─── CEP lookup (ViaCEP) ───────────────────────────────────────────────
  const buscarCep = async () => {
    const cep = form.cep.replace(/\D/g, '');
    if (cep.length !== 8) { setMsgCep('CEP deve ter 8 dígitos.'); return; }
    setBuscandoCep(true);
    setMsgCep('');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) { setMsgCep('CEP não encontrado.'); return; }
      const novaLat = form.lat;
      const novaLng = form.lng;
      setForm(f => ({
        ...f,
        logradouro: data.logradouro || f.logradouro,
        bairro: data.bairro || f.bairro,
        cidade: data.localidade || f.cidade,
        estado: data.uf || f.estado,
        complemento: data.complemento || f.complemento,
      }));
      setMsgCep('✅ Endereço encontrado!');
      // If no lat/lng yet, try to geocode the city via Nominatim
      if (!novaLat || !novaLng) {
        buscarCoordenadas(data.localidade, data.uf);
      }
    } catch {
      setMsgCep('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setBuscandoCep(false);
    }
  };

  // ─── Geocode city via Nominatim ───────────────────────────────────────
  const buscarCoordenadas = async (cidade: string, estado: string) => {
    try {
      const q = encodeURIComponent(`${cidade}, ${estado}, Brasil`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`);
      const data = await res.json();
      if (data[0]) {
        setForm(f => ({ ...f, lat: data[0].lat, lng: data[0].lon }));
      }
    } catch {}
  };

  // ─── Auto GPS detect ──────────────────────────────────────────────────
  const detectarGps = () => {
    if (!navigator.geolocation) { alert('Geolocalização não suportada neste navegador.'); return; }
    setDetectandoGps(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        const lat = String(latitude.toFixed(6));
        const lng = String(longitude.toFixed(6));
        setForm(f => ({ ...f, lat, lng }));
        // Reverse geocode
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt`);
          const data = await res.json();
          const cidade = data.address?.city || data.address?.town || data.address?.village || '';
          const estado = data.address?.state_code || data.address?.state || '';
          const cep = (data.address?.postcode || '').replace(/\D/g, '');
          const bairro = data.address?.suburb || data.address?.neighbourhood || '';
          setForm(f => ({
            ...f,
            cidade: cidade || f.cidade,
            estado: estado.length <= 3 ? estado.toUpperCase() : f.estado,
            cep: cep || f.cep,
            bairro: bairro || f.bairro,
          }));
        } catch {}
        setDetectandoGps(false);
      },
      () => { alert('Não foi possível obter sua localização.'); setDetectandoGps(false); },
      { timeout: 10000 }
    );
  };

  // ─── Map preview ──────────────────────────────────────────────────────
  const hasCoords = form.lat && form.lng;
  const lat = parseFloat(form.lat);
  const lng = parseFloat(form.lng);

  // ─── Save ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('comercios/me', {
        cidade: form.cidade,
        estado: form.estado,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        raioEntregaKm: form.raioEntregaKm,
      });
      alert('Área de entrega atualizada!');
      navigate('/comerciante/config');
    } catch {
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <ComercianteLayout title="Área de Entrega" subtitle="Carregando">
      <p>Carregando...</p>
    </ComercianteLayout>
  );

  return (
    <ComercianteLayout title="Área de Entrega" subtitle="Localização e raio de cobertura da sua loja">
      <div className="config-sections animate-fade-in-up delay-1">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ── GPS Auto-detect ─────────────────────────────────────── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>📍 Detectar minha localização</h3>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Usa o GPS do dispositivo para preencher cidade, estado e coordenadas automaticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={detectarGps}
                disabled={detectandoGps}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: '#dbeafe', color: '#1e3a8a',
                  border: '2px solid #3b82f6', borderRadius: '14px',
                  padding: '0.65rem 1.2rem', cursor: 'pointer', fontWeight: 700,
                  fontSize: '0.9rem', opacity: detectandoGps ? 0.6 : 1,
                }}
              >
                {detectandoGps ? '⏳ Detectando...' : '🎯 Usar minha localização'}
              </button>
            </div>
          </div>

          {/* ── CEP lookup ──────────────────────────────────────────── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>📮 Buscar por CEP</h3>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: 1, minWidth: 160, margin: 0 }}>
                <label>CEP</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: 68230000"
                  value={form.cep}
                  maxLength={9}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                    const fmt = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
                    setForm(f => ({ ...f, cep: fmt }));
                    setMsgCep('');
                  }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), buscarCep())}
                />
              </div>
              <button
                type="button"
                onClick={buscarCep}
                disabled={buscandoCep}
                style={{
                  background: buscandoCep ? '#94a3b8' : '#1d4ed8',
                  color: '#ffffff',
                  border: 'none', borderRadius: '14px',
                  padding: '0.75rem 1.4rem',
                  cursor: buscandoCep ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: '0.95rem',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  boxShadow: buscandoCep ? 'none' : '0 3px 10px rgba(29,78,216,0.3)',
                }}
                onMouseOver={e => { if (!buscandoCep) e.currentTarget.style.background = '#1e40af'; }}
                onMouseOut={e => { if (!buscandoCep) e.currentTarget.style.background = '#1d4ed8'; }}
              >
                {buscandoCep
                  ? <><span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Buscando...</>
                  : <><span style={{ fontSize: '1rem' }}>🔍</span> Buscar CEP</>}
              </button>
            </div>
            {msgCep && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: msgCep.startsWith('✅') ? '#16a34a' : '#dc2626' }}>
                {msgCep}
              </p>
            )}

            {/* Address fields auto-filled from CEP */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Logradouro</label>
                <input type="text" className="input" value={form.logradouro}
                  onChange={e => setForm(f => ({ ...f, logradouro: e.target.value }))} placeholder="Rua, Av., Travessa..." />
              </div>
              <div className="input-group">
                <label>Número</label>
                <input type="text" className="input" value={form.numero}
                  onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} placeholder="Ex: 123" />
              </div>
              <div className="input-group">
                <label>Complemento</label>
                <input type="text" className="input" value={form.complemento}
                  onChange={e => setForm(f => ({ ...f, complemento: e.target.value }))} placeholder="Sala, Bloco..." />
              </div>
              <div className="input-group">
                <label>Bairro</label>
                <input type="text" className="input" value={form.bairro}
                  onChange={e => setForm(f => ({ ...f, bairro: e.target.value }))} />
              </div>
              <div className="input-group">
                <label>Cidade <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" className="input" value={form.cidade}
                  onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} placeholder="Ex: Rurópolis" required />
              </div>
              <div className="input-group">
                <label>Estado (UF) <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" className="input" value={form.estado}
                  onChange={e => setForm(f => ({ ...f, estado: e.target.value.toUpperCase().slice(0, 2) }))}
                  placeholder="PA" maxLength={2} required />
              </div>
            </div>

            <button
              type="button"
              onClick={() => buscarCoordenadas(form.cidade, form.estado)}
              disabled={!form.cidade}
              style={{
                marginTop: '0.75rem', background: 'none',
                border: '1px solid var(--border)', borderRadius: '12px',
                padding: '0.5rem 1rem', cursor: form.cidade ? 'pointer' : 'not-allowed',
                fontSize: '0.85rem', color: 'var(--text-secondary)',
              }}
            >
              🗺️ Atualizar coordenadas pela cidade
            </button>
          </div>

          {/* ── Coordinates + Map ───────────────────────────────────── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>🌐 Coordenadas GPS</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label>Latitude</label>
                <input type="text" className="input" value={form.lat}
                  onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                  placeholder="-4.123456" />
              </div>
              <div className="input-group">
                <label>Longitude</label>
                <input type="text" className="input" value={form.lng}
                  onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                  placeholder="-54.654321" />
              </div>
            </div>

            {hasCoords && !isNaN(lat) && !isNaN(lng) ? (
              <div style={{ marginTop: '1rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <MapaEntrega lat={lat} lng={lng} raioKm={form.raioEntregaKm} height={300} />
                <p style={{ margin: 0, padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
                  📌 {lat.toFixed(4)}, {lng.toFixed(4)} — {form.cidade}{form.estado ? `, ${form.estado}` : ''} · <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Abrir no mapa ↗</a>
                </p>
              </div>
            ) : (
              <div style={{ marginTop: '1rem', padding: '2rem', textAlign: 'center', background: 'var(--color-surface, #f8fafc)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  🗺️ Use o GPS ou busque pelo CEP para ver o mapa
                </p>
              </div>
            )}
          </div>

          {/* ── Raio de entrega ─────────────────────────────────────── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>🚚 Raio de Entrega</h3>
            <div className="input-group">
              <label>Raio de cobertura: <strong>{form.raioEntregaKm} km</strong></label>
              <input
                type="range" min="1" max="50" step="0.5"
                value={form.raioEntregaKm}
                onChange={e => setForm(f => ({ ...f, raioEntregaKm: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Clientes a mais de <strong>{form.raioEntregaKm} km</strong> de distância não verão sua loja nos resultados de entrega.
            </p>
          </div>

          {/* ── Actions ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', padding: '0.25rem 0 0.5rem' }}>
            <button
              type="button"
              onClick={() => navigate('/comerciante/config')}
              style={{
                flex: 1, minWidth: 120,
                padding: '0.9rem 1.2rem',
                borderRadius: '14px',
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                color: '#374151',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                transition: 'background 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseOut={e => (e.currentTarget.style.background = '#f8fafc')}
            >
              ← Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2, minWidth: 200,
                padding: '0.9rem 1.5rem',
                borderRadius: '14px',
                border: 'none',
                background: saving ? '#94a3b8' : '#1d4ed8',
                color: '#ffffff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: saving ? 'none' : '0 4px 12px rgba(29,78,216,0.35)',
                transition: 'background 0.15s, box-shadow 0.15s',
              }}
              onMouseOver={e => { if (!saving) e.currentTarget.style.background = '#1e40af'; }}
              onMouseOut={e => { if (!saving) e.currentTarget.style.background = '#1d4ed8'; }}
            >
              {saving
                ? <><span style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Salvando...</>
                : <>💾 Salvar Área de Entrega</>}
            </button>
          </div>

        </form>
      </div>
    </ComercianteLayout>
  );
}
