import { useAppConfig } from '../../lib/useAppName';
import './MaintenancePage.css';

export default function MaintenancePage() {
  const config = useAppConfig();

  return (
    <div className="maintenance-page">
      <div className="maintenance-content animate-fade-in-up">
        <div className="maintenance-logo">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="maintenance-img" />
          ) : (
            <span className="maintenance-icon">🚧</span>
          )}
        </div>
        
        <h1 className="maintenance-title">Voltamos em instantes!</h1>
        <p className="maintenance-desc">
          O <strong>{config.nomeApp}</strong> está passando por uma manutenção programada para trazer novidades e melhorias para você.
        </p>
        
        <div className="maintenance-status-card">
          <div className="pulse-dot"></div>
          <span>Estamos trabalhando duro nos bastidores...</span>
        </div>

        <p className="maintenance-footer">
          Agradecemos a sua paciência.
        </p>
      </div>
    </div>
  );
}
