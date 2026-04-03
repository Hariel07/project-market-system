import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import AdminLayout from './AdminLayout';
import './AdminSistema.css';

export default function AdminSistema() {
  const [nomeApp, setNomeApp] = useState('');
  const [nomeAppTemp, setNomeAppTemp] = useState('');
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Carregar configurações
  useEffect(() => {
    const carregarConfigurações = async () => {
      setLoading(true);
      try {
        // Tentar carregar do backend
        const res = await api.get('/api/config/sistema');
        setNomeApp(res.data.nomeApp || 'Market System');
      } catch (err) {
        // Fallback: usar localStorage
        const savedName = localStorage.getItem('nomeApp') || 'Market System';
        setNomeApp(savedName);
      } finally {
        setLoading(false);
      }
    };

    carregarConfigurações();
  }, []);

  // Sincronizar campo temporário com estado principal
  useEffect(() => {
    setNomeAppTemp(nomeApp);
  }, [nomeApp]);

  const handleSalvarNome = async () => {
    if (!nomeAppTemp.trim()) {
      setMensagem({ tipo: 'erro', texto: 'O nome do site não pode estar vazio!' });
      return;
    }

    setSalvando(true);
    setMensagem(null);

    try {
      // Tentar salvar no backend
      await api.post('/api/config/sistema', { nomeApp: nomeAppTemp });
      setNomeApp(nomeAppTemp);
      localStorage.setItem('nomeApp', nomeAppTemp);
      setMensagem({ tipo: 'sucesso', texto: '✅ Nome do site atualizado com sucesso!' });
      
      // Recarregar a página após 2 segundos para aplicar mudanças
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      // Fallback: salvar apenas no localStorage
      setNomeApp(nomeAppTemp);
      localStorage.setItem('nomeApp', nomeAppTemp);
      setMensagem({ tipo: 'sucesso', texto: '✅ Nome do site atualizado localmente!' });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <AdminLayout title="Configurações do Sistema">
      <div className="admin-sistema animate-fade-in-up">
        
        {/* Configurações Gerais */}
        <div className="admin-sys-card">
          <div className="sys-card-header">
            <h3>⚙️ Configurações Gerais</h3>
            <span className="badge badge-info">Essencial</span>
          </div>
          <p className="sys-desc">Personalize informações básicas que aparecem em todo o sistema.</p>
          
          <div className="config-general">
            <div className="form-group">
              <label htmlFor="nomeApp" className="form-label">Nome do Site/Aplicação</label>
              <div className="input-with-preview">
                <input
                  id="nomeApp"
                  type="text"
                  className="input sys-input"
                  value={nomeAppTemp}
                  onChange={(e) => setNomeAppTemp(e.target.value)}
                  placeholder="ex: Market System"
                  disabled={salvando}
                />
                <div className="preview-info">
                  <span className="preview-label">Atual: <strong>{nomeApp}</strong></span>
                </div>
              </div>
              <p className="input-hint">Este nome aparecerá em: Logo, titulo da página, headers, footers e emails.</p>
            </div>

            {mensagem && (
              <div className={`alert alert-${mensagem.tipo}`} style={{ marginTop: '16px' }}>
                {mensagem.texto}
              </div>
            )}

            <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={handleSalvarNome}
                disabled={salvando || nomeAppTemp === nomeApp}
              >
                {salvando ? '💾 Salvando...' : '💾 Salvar Alterações'}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setNomeAppTemp(nomeApp)}
                disabled={salvando || nomeAppTemp === nomeApp}
              >
                ↶ Cancelar
              </button>
            </div>
          </div>
        </div>
        
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
