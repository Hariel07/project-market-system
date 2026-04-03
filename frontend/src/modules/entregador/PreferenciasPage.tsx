import { useState, useEffect } from 'react';
import EntregadorLayout from './EntregadorLayout';
import { useAuthProtected } from '../../lib/useAuth';
import './PreferenciasPage.css';

interface Preferencias {
  notificacoes: {
    entregas: boolean;
    mensagens: boolean;
    avaliacoes: boolean;
    ofertas: boolean;
  };
  tema: 'claro' | 'escuro' | 'auto';
  mapa: 'google_maps' | 'waze' | 'apple_maps';
  som: boolean;
  vibracao: boolean;
}

export default function PreferenciasPage() {
  useAuthProtected(['ENTREGADOR']);

  const [prefs, setPrefs] = useState<Preferencias>(() => {
    const saved = localStorage.getItem('preferencias_entregador');
    return saved
      ? JSON.parse(saved)
      : {
          notificacoes: {
            entregas: true,
            mensagens: true,
            avaliacoes: true,
            ofertas: false,
          },
          tema: 'claro',
          mapa: 'google_maps',
          som: true,
          vibracao: true,
        };
  });

  const [salvo, setSalvo] = useState(false);

  // Salvar preferências automaticamente
  useEffect(() => {
    localStorage.setItem('preferencias_entregador', JSON.stringify(prefs));
    setSalvo(true);
    const timer = setTimeout(() => setSalvo(false), 2000);
    return () => clearTimeout(timer);
  }, [prefs]);

  const toggleNotificacao = (tipo: keyof Preferencias['notificacoes']) => {
    setPrefs({
      ...prefs,
      notificacoes: {
        ...prefs.notificacoes,
        [tipo]: !prefs.notificacoes[tipo],
      },
    });
  };

  return (
    <EntregadorLayout title="Preferências">
      <div className="preferencias-container animate-fade-in-up">
        {salvo && (
          <div className="alert alert-success">
            ✅ Preferências salvas!
          </div>
        )}

        {/* Notificações */}
        <div className="pref-section">
          <h3 className="pref-section-title">🔔 Notificações</h3>
          <div className="pref-list">
            <div className="pref-item toggle-item">
              <div className="pref-info">
                <span className="pref-label">Novas Entregas</span>
                <span className="pref-desc">Receba alertas de novas oportunidades</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={prefs.notificacoes.entregas}
                  onChange={() => toggleNotificacao('entregas')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="pref-item toggle-item">
              <div className="pref-info">
                <span className="pref-label">Mensagens</span>
                <span className="pref-desc">Alertas de novos mensagens de clientes</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={prefs.notificacoes.mensagens}
                  onChange={() => toggleNotificacao('mensagens')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="pref-item toggle-item">
              <div className="pref-info">
                <span className="pref-label">Avaliações</span>
                <span className="pref-desc">Quando clientes deixam comentários</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={prefs.notificacoes.avaliacoes}
                  onChange={() => toggleNotificacao('avaliacoes')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="pref-item toggle-item">
              <div className="pref-info">
                <span className="pref-label">Ofertas e Promoções</span>
                <span className="pref-desc">Descontos e ofertas exclusivas</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={prefs.notificacoes.ofertas}
                  onChange={() => toggleNotificacao('ofertas')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Áudio e Vibração */}
        <div className="pref-section">
          <h3 className="pref-section-title">🔊 Som e Vibração</h3>
          <div className="pref-list">
            <div className="pref-item toggle-item">
              <div className="pref-info">
                <span className="pref-label">Som de Notificações</span>
                <span className="pref-desc">Toque ao receber alertas</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={prefs.som}
                  onChange={() => setPrefs({ ...prefs, som: !prefs.som })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="pref-item toggle-item">
              <div className="pref-info">
                <span className="pref-label">Vibração</span>
                <span className="pref-desc">Vibre ao receber notificações</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={prefs.vibracao}
                  onChange={() => setPrefs({ ...prefs, vibracao: !prefs.vibracao })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Aparência */}
        <div className="pref-section">
          <h3 className="pref-section-title">🌙 Aparência</h3>
          <div className="pref-list">
            <div className="pref-item">
              <div className="pref-info">
                <span className="pref-label">Tema</span>
                <span className="pref-desc">Escolha o tema do aplicativo</span>
              </div>
              <select
                className="pref-select"
                value={prefs.tema}
                onChange={(e) => setPrefs({ ...prefs, tema: e.target.value as any })}
              >
                <option value="claro">☀️ Claro</option>
                <option value="escuro">🌙 Escuro</option>
                <option value="auto">🔄 Automático</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mapas */}
        <div className="pref-section">
          <h3 className="pref-section-title">🗺️ Navegação</h3>
          <div className="pref-list">
            <div className="pref-item">
              <div className="pref-info">
                <span className="pref-label">App de Mapas Padrão</span>
                <span className="pref-desc">Qual app usar para navegação</span>
              </div>
              <select
                className="pref-select"
                value={prefs.mapa}
                onChange={(e) => setPrefs({ ...prefs, mapa: e.target.value as any })}
              >
                <option value="google_maps">🗺️ Google Maps</option>
                <option value="waze">🚗 Waze</option>
                <option value="apple_maps">🍎 Apple Maps</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="pref-section info-section">
          <h3 className="pref-section-title">ℹ️ Informações</h3>
          <div className="pref-list">
            <div className="pref-item">
              <div className="pref-info">
                <span className="pref-label">Versão do App</span>
                <span className="pref-value">1.0.0</span>
              </div>
            </div>

            <div className="pref-item">
              <div className="pref-info">
                <span className="pref-label">Dados Salvos Localmente</span>
                <span className="pref-value">~2.5 MB</span>
              </div>
            </div>

            <button className="pref-item btn-clear">
              <div className="pref-info">
                <span className="pref-label" style={{ color: '#dc3545' }}>
                  🗑️ Limpar Cache
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Espaço extra para não colar no BottomNav */}
        <div style={{ height: '100px' }}></div>
      </div>
    </EntregadorLayout>
  );
}
