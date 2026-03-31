import AdminLayout from './AdminLayout';
import './AdminSistema.css';

export default function AdminSistema() {
  return (
    <AdminLayout title="Configurações do Sistema">
      <div className="admin-sistema animate-fade-in-up">
        
        {/* API & Webhooks */}
        <div className="admin-sys-card">
          <div className="sys-card-header">
            <h3>🔌 Integrações e APIs Ocultas</h3>
            <span className="badge badge-warning">Apenas Admin</span>
          </div>
          <p className="sys-desc">Gerencie as chaves de integração global que servem para toda a plataforma Market System.</p>
          
          <div className="api-keys-list">
            <div className="api-key-item">
              <div className="api-key-info">
                <strong>Focus NF-e (Provedor Fiscal)</strong>
                <span>Ambiente: Produção</span>
              </div>
              <div className="input-group-inline">
                <input type="password" value="sk_live_h93f0b2n293hf902bf" readOnly className="input sys-input" />
                <button className="btn btn-outline btn-sm">Revelar</button>
              </div>
            </div>

            <div className="api-key-item mt-4">
              <div className="api-key-info">
                <strong>n8n Webhook Base URL</strong>
                <span>Para disparos de E-mail e WhatsApp</span>
              </div>
              <div className="input-group-inline">
                <input type="text" value="https://n8n.marketsystem.com.br/webhook/" readOnly className="input sys-input" />
                <button className="btn btn-outline btn-sm">Copiar</button>
              </div>
            </div>
          </div>
        </div>

        {/* Backups Bancos de Dados */}
        <div className="admin-sys-card delay-1 animate-fade-in-up">
          <div className="sys-card-header">
            <h3>💾 Backups do Banco de Dados PostgreSQL</h3>
          </div>
          <p className="sys-desc">Rotina diária agendada via Cronjob (03:00 AM). Frequência de espelhamento: Tempo real.</p>
          
          <table className="admin-table mt-4">
            <thead>
              <tr>
                <th>Data do Snapshot</th>
                <th>Tamanho</th>
                <th>Tabelas</th>
                <th>Status</th>
                <th className="text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Hoje, 03:00 AM</strong></td>
                <td>4.2 GB</td>
                <td>48 tabelas</td>
                <td><span className="text-accent">✅ Completo</span></td>
                <td className="text-right"><button className="btn btn-sm btn-outline">Baixar SQL</button></td>
              </tr>
              <tr>
                <td>Ontem, 03:00 AM</td>
                <td>4.1 GB</td>
                <td>48 tabelas</td>
                <td><span className="text-accent">✅ Completo</span></td>
                <td className="text-right"><button className="btn btn-sm btn-outline">Baixar SQL</button></td>
              </tr>
              <tr>
                <td>26/03/2026, 03:00 AM</td>
                <td>3.9 GB</td>
                <td>48 tabelas</td>
                <td><span className="text-warning-dark">⚠️ Alerta AWS S3</span></td>
                <td className="text-right"><button className="btn btn-sm btn-outline" disabled>Indisponível</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Zona de Perigo */}
        <div className="admin-sys-card danger-zone delay-2 animate-fade-in-up">
          <div className="sys-card-header text-danger">
            <h3>⚠️ Zona de Perigo System-Wide</h3>
          </div>
          <div className="danger-actions">
            <div className="danger-info">
              <strong>Modo Manutenção</strong>
              <span>Derruba a plataforma para todos (Tela de "Voltamos já"). O painel Admin continuará online.</span>
            </div>
            <button className="btn btn-outline btn-danger">🗑 Ativar Modo Manutenção</button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
