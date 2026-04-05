import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import AdminLayout from './AdminLayout';
import './AdminSistema.css';

export default function AdminSistema() {
  const [nomeApp, setNomeApp] = useState('');
  const [nomeAppTemp, setNomeAppTemp] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUrlTemp, setLogoUrlTemp] = useState('');
  const [modoManutencao, setModoManutencao] = useState(false); // Novo estado
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Carregar configurações
  useEffect(() => {
    const carregarConfigurações = async () => {
      setLoading(true);
      try {
        const res = await api.get('config/sistema');
        setNomeApp(res.data.nomeApp || 'Market System');
        setLogoUrl(res.data.logoUrl || '');
        setLogoUrlTemp(res.data.logoUrl || '');
        setModoManutencao(res.data.modoManutencao || false);
      } catch (err) {
        const savedName = localStorage.getItem('nomeApp') || 'Market System';
        setNomeApp(savedName);
      } finally {
        setLoading(false);
      }
    };

    carregarConfigurações();
  }, []);

  // ... (nomeAppTemp sync)

  const handleSalvarConfig = async () => {
    if (!nomeAppTemp.trim()) {
      setMensagem({ tipo: 'erro', texto: 'O nome do site não pode estar vazio!' });
      return;
    }

    setSalvando(true);
    setMensagem(null);

    try {
      await api.post('config/sistema', { 
        nomeApp: nomeAppTemp,
        logoUrl: logoUrlTemp,
        modoManutencao // Envia o status atual
      });
      setNomeApp(nomeAppTemp);
      setLogoUrl(logoUrlTemp);
      localStorage.setItem('nomeApp', nomeAppTemp);
      setMensagem({ tipo: 'sucesso', texto: '✅ Configurações atualizadas com sucesso!' });
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: '❌ Falha ao salvar no servidor.' });
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleManutencao = async () => {
    const novoStatus = !modoManutencao;
    const acao = novoStatus ? 'ATIVAR' : 'DESATIVAR';
    
    if (!window.confirm(`Deseja ${acao} o Modo Manutenção?`)) return;

    setSalvando(true);
    try {
      await api.post('config/sistema', { modoManutencao: novoStatus });
      setModoManutencao(novoStatus);
      // Feedback imediato e recarregamento para limpar caches de middleware
      alert(`✅ Modo Manutenção ${novoStatus ? 'ATIVADO' : 'DESATIVADO'} com sucesso!`);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert('Falha ao alterar modo manutenção. Verifique se você ainda está logado como Admin.');
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
              <input
                id="nomeApp"
                type="text"
                className="input sys-input"
                value={nomeAppTemp}
                onChange={(e) => setNomeAppTemp(e.target.value)}
                placeholder="ex: Market System"
                disabled={salvando}
              />
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Identidade Visual (Logo)</label>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <input
                    type="file"
                    id="logo-upload-v2"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Imagem muito grande! Limite de 5MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLogoUrlTemp(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => document.getElementById('logo-upload-v2')?.click()}
                  >
                    🖼️ Escolher Logo do Computador
                  </button>

                  {logoUrlTemp && (
                    <button 
                      type="button"
                      className="btn btn-ghost text-danger"
                      onClick={() => setLogoUrlTemp('')}
                    >
                      🗑 Remover
                    </button>
                  )}
                </div>

                {logoUrlTemp && (
                  <div className="logo-preview-card p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center gap-6">
                    <div className="logo-img-preview" style={{ 
                      width: '100px', 
                      height: '100px', 
                      background: 'white', 
                      borderRadius: '12px', 
                      padding: '8px', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img src={logoUrlTemp} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-700">Preview da Logo</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Esta imagem será exibida no cabeçalho de todas as páginas para seus clientes e no topo deste painel.</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="input-hint">Formatos suportados: PNG, JPG, SVG (recomendado PNG transparente).</p>
            </div>

            {mensagem && (
              <div className={`alert alert-${mensagem.tipo}`} style={{ marginTop: '16px' }}>
                {mensagem.texto}
              </div>
            )}

            <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={handleSalvarConfig}
                disabled={salvando || (nomeAppTemp === nomeApp && logoUrlTemp === logoUrl)}
              >
                {salvando ? '💾 Salvando...' : '💾 Salvar Alterações'}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setNomeAppTemp(nomeApp);
                  setLogoUrlTemp(logoUrl);
                }}
                disabled={salvando || (nomeAppTemp === nomeApp && logoUrlTemp === logoUrl)}
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
              <strong>Reinicializar Sistema (Modo de Fábrica)</strong>
              <span>Isso apagará ABSOLUTAMENTE TUDO (Usuários, Lojas, Pedidos e sua própria conta). O sistema voltará ao estado de "Programa Novo".</span>
            </div>
            <button 
              className="btn btn-outline btn-danger"
              onClick={async () => {
                if (window.confirm('ATENÇÃO: Isso apagará todo o banco de dados, incluindo sua conta. Deseja continuar?')) {
                  const senha = window.prompt('Por segurança, digite sua senha de OWNER para confirmar a reinicialização:');
                  if (!senha) return;

                  try {
                    await api.post('admin/system/factory-reset', { senha });
                    alert('🔥 Sistema reinicializado! O banco de dados está limpo.');
                    localStorage.clear();
                    window.location.href = '/cadastro';
                  } catch (err: any) {
                    alert(err.response?.data?.error || 'Erro ao reinicializar o sistema. Senha incorreta?');
                  }
                }
              }}
            >
              🚀 Reinicializar para Modo Fábrica
            </button>
          </div>
          <div className="danger-actions mt-4">
            <div className="danger-info">
              <strong>Modo Manutenção {modoManutencao ? '(ATIVADO 🔴)' : '(DESATIVADO 🟢)'}</strong>
              <span>Derruba a plataforma para todos (Tela de "Voltamos já").</span>
            </div>
            <button 
              className={`btn btn-outline ${modoManutencao ? 'btn-success' : 'btn-danger'}`}
              onClick={handleToggleManutencao}
              disabled={salvando}
            >
              {modoManutencao ? '🔓 Desativar Manutenção' : '🔒 Ativar Modo Manutenção'}
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
