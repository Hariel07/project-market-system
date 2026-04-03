import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAppName } from '../../lib/useAppName';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nomeApp = useAppName();
  
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para seleção de perfil
  const [selectMode, setSelectMode] = useState(false);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [tempToken, setTempToken] = useState('');

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'ADMIN': return navigate('/admin');
      case 'DONO':
      case 'GERENTE':
      case 'ESTOQUE':
      case 'CAIXA': return navigate('/comerciante');
      case 'ENTREGADOR': return navigate('/entregador');
      case 'CLIENTE':
      default: return navigate('/cliente');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const plainCpf = cpf.replace(/\D/g, ''); // Limpa pontuação
      const response = await api.post('/api/auth/login', { cpf: plainCpf, senha });
      
      const redirect = searchParams.get('redirect');
      const isBuying = redirect && redirect.includes('/cliente');

      if (response.data.status === 'SELECT_PROFILE') {
        if (isBuying) {
          const clientProfile = response.data.perfis.find((p: any) => p.role === 'CLIENTE');
          if (clientProfile) {
            // Auto login no perfil do cliente
            const resSel = await api.post('/api/auth/select-profile', { 
              tempToken: response.data.tempToken, 
              perfilId: clientProfile.id 
            });
            localStorage.setItem('token', resSel.data.token);
            localStorage.setItem('userId', resSel.data.user.id);
            localStorage.setItem('userRole', resSel.data.user.role);
            localStorage.setItem('userName', resSel.data.user.nome);
            localStorage.setItem('@MarketSystem:token', resSel.data.token);
            localStorage.setItem('@MarketSystem:user', JSON.stringify(resSel.data.user));
            navigate(redirect);
            return;
          } else {
            alert('Sua conta ainda não possui um perfil de Cliente para realizar compras!');
            navigate(`/cadastro?role=cliente&redirect=${encodeURIComponent(redirect)}`);
            return;
          }
        }

        setPerfis(response.data.perfis);
        setTempToken(response.data.tempToken);
        setSelectMode(true);
      } else {
        // Login direto (conta com 1 perfil)
        const { token, user } = response.data;
        
        if (isBuying && user.role !== 'CLIENTE') {
          alert('Apenas Clientes podem comprar produtos. Ative o seu perfil agora!');
          navigate(`/cadastro?role=cliente&redirect=${encodeURIComponent(redirect)}`);
          return;
        }

        // Salvar token e dados do usuário no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.nome);
        localStorage.setItem('@MarketSystem:token', token);
        localStorage.setItem('@MarketSystem:user', JSON.stringify(user));

        if (redirect) navigate(redirect);
        else redirectByRole(user.role);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Erro ao fazer login. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (perfilId: string) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/select-profile', { tempToken, perfilId });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.nome);
      localStorage.setItem('@MarketSystem:token', token);
      localStorage.setItem('@MarketSystem:user', JSON.stringify(user));

      const redirect = searchParams.get('redirect');
      if (redirect) navigate(redirect);
      else redirectByRole(user.role);
    } catch (error: any) {
      console.error(error);
      alert('Sessão expirada. Faça login novamente.');
      setSelectMode(false);
      setCpf('');
      setSenha('');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // TELA DE SELEÇÃO DE PERFIL
  // ------------------------------------------------------------------
  if (selectMode) {
    return (
      <div className="auth-page">
        <div className="auth-bg">
          <div className="auth-bg-circle circle-1" />
          <div className="auth-bg-circle circle-2" />
          <div className="auth-bg-circle circle-3" />
        </div>
        <div className="auth-container">
          <div className="auth-card animate-fade-in-up">
            <div className="auth-header">
              <div className="auth-logo">🔄</div>
              <h1 className="auth-title">Escolha seu painel</h1>
              <p className="auth-subtitle">Sua conta possui acesso a vários painéis.</p>
            </div>

            <div className="profile-selection-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {perfis.map(p => {
                let icon = '👤';
                let label = 'Cliente';
                if (p.role === 'DONO') { icon = '🏪'; label = p.comercio?.nomeFantasia || 'Comerciante'; }
                if (p.role === 'ENTREGADOR') { icon = '🛵'; label = 'Entregador'; }
                if (p.role === 'ADMIN') { icon = '⚙️'; label = 'Administrador'; }

                return (
                  <button
                    key={p.id}
                    className="demo-btn"
                    onClick={() => handleSelectProfile(p.id)}
                    disabled={loading}
                    style={{ textAlign: 'left' }}
                  >
                    <span className="demo-icon">{icon}</span>
                    <span className="demo-label">{p.nome}</span>
                    <span className="demo-sublabel">{label}</span>
                  </button>
                )
              })}
            </div>

            <button
              className="btn btn-ghost btn-block"
              style={{ marginTop: '1.5rem' }}
              onClick={() => setSelectMode(false)}
            >
              ← Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // TELA NORMAL DE LOGIN
  // ------------------------------------------------------------------
  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-circle circle-1" />
        <div className="auth-bg-circle circle-2" />
        <div className="auth-bg-circle circle-3" />
      </div>

      <div className="auth-container">
        <div className="auth-card animate-fade-in-up">
          <div className="auth-header">
            <div className="auth-logo">🛒</div>
            <h1 className="auth-title">{nomeApp}</h1>
            <p className="auth-subtitle">Entre na sua conta centralizada</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="cpf">CPF</label>
              <div className="input-with-icon">
                <span className="input-icon">🆔</span>
                <input
                  id="cpf"
                  type="text"
                  className="input"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={e => setCpf(formatCPF(e.target.value))}
                  maxLength={14}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="senha">Senha</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox" defaultChecked />
                <span>Lembrar de mim</span>
              </label>
              <button type="button" className="auth-link">Esqueci minha senha</button>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg btn-block auth-submit ${loading ? 'loading' : ''}`}
              disabled={loading || cpf.length < 14}
              id="btn-login"
            >
              {loading ? (
                <span className="btn-loading"><span className="spinner" /> Processando...</span>
              ) : (
                'Entrar na Plataforma'
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline btn-lg btn-block"
              style={{ marginTop: '0.75rem' }}
              onClick={() => navigate('/cliente')}
            >
              👀 Continuar como Visitante
            </button>
          </form>

          <p className="auth-footer">
            Não tem uma conta?{' '}
            <button 
              className="auth-link" 
              onClick={() => {
                const redirect = searchParams.get('redirect');
                let target = '/cadastro';
                if (redirect) {
                  // Se estava indo p/ cliente/checkout, forçar role=cliente no cadastro
                  target += `?redirect=${encodeURIComponent(redirect)}`;
                  if (redirect.includes('/cliente')) target += '&role=cliente';
                }
                navigate(target);
              }} 
              id="link-cadastro"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
