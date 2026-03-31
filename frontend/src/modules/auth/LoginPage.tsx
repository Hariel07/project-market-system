import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import './AuthPages.css';

// Contas de teste pré-cadastradas pelo seed
const DEMO_ACCOUNTS: Record<string, { email: string; senha: string; redirect: string }> = {
  cliente:     { email: 'cliente@teste.com',     senha: '123456', redirect: '/cliente' },
  comerciante: { email: 'dono@mercado.com',      senha: '123456', redirect: '/comerciante' },
  entregador:  { email: 'entregador@teste.com',  senha: '123456', redirect: '/entregador' },
  admin:       { email: 'admin@market.com',       senha: '123456', redirect: '/admin' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const doLogin = async (loginEmail: string, loginSenha: string): Promise<boolean> => {
    try {
      const response = await api.post('/api/auth/login', { email: loginEmail, senha: loginSenha });
      const { token, user } = response.data;

      // Armazena a sessão
      localStorage.setItem('@MarketSystem:token', token);
      localStorage.setItem('@MarketSystem:user', JSON.stringify(user));

      return true;
    } catch (error: any) {
      console.error('Erro no login:', error);
      return false;
    }
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
      const response = await api.post('/api/auth/login', { email, senha });
      const { token, user } = response.data;

      localStorage.setItem('@MarketSystem:token', token);
      localStorage.setItem('@MarketSystem:user', JSON.stringify(user));

      redirectByRole(user.role);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Erro ao fazer login. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    const account = DEMO_ACCOUNTS[role];
    if (!account) return;

    setDemoLoading(role);

    const success = await doLogin(account.email, account.senha);
    if (success) {
      navigate(account.redirect);
    } else {
      alert(
        `Não foi possível entrar como ${role}.\n\n` +
        `Verifique se:\n` +
        `1. O servidor backend está rodando (npm run dev)\n` +
        `2. O seed foi executado (npm run seed)\n\n` +
        `Credenciais: ${account.email} / ${account.senha}`
      );
    }

    setDemoLoading(null);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-circle circle-1" />
        <div className="auth-bg-circle circle-2" />
        <div className="auth-bg-circle circle-3" />
      </div>

      <div className="auth-container">
        <div className="auth-card animate-fade-in-up">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">🛒</div>
            <h1 className="auth-title">Market System</h1>
            <p className="auth-subtitle">Entre na sua conta para continuar</p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                <input type="checkbox" className="checkbox" />
                <span>Lembrar de mim</span>
              </label>
              <button type="button" className="auth-link">Esqueci minha senha</button>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg btn-block auth-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
              id="btn-login"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>acesso rápido (contas de teste)</span>
          </div>

          {/* Demo buttons — agora fazem login real */}
          <div className="demo-buttons">
            {[
              { key: 'cliente', icon: '👤', label: 'Cliente', sublabel: 'cliente@teste.com' },
              { key: 'comerciante', icon: '🏪', label: 'Comerciante', sublabel: 'dono@mercado.com' },
              { key: 'entregador', icon: '🛵', label: 'Entregador', sublabel: 'entregador@teste.com' },
              { key: 'admin', icon: '⚙️', label: 'Admin', sublabel: 'admin@market.com' },
            ].map(demo => (
              <button
                key={demo.key}
                className={`demo-btn ${demoLoading === demo.key ? 'loading' : ''}`}
                onClick={() => handleDemoLogin(demo.key)}
                disabled={!!demoLoading}
                id={`demo-${demo.key}`}
              >
                {demoLoading === demo.key ? (
                  <span className="demo-icon"><span className="spinner" /></span>
                ) : (
                  <span className="demo-icon">{demo.icon}</span>
                )}
                <span className="demo-label">{demo.label}</span>
                <span className="demo-sublabel">
                  {demo.sublabel}
                </span>
              </button>
            ))}
          </div>

          {/* Register link */}
          <p className="auth-footer">
            Não tem uma conta?{' '}
            <button className="auth-link" onClick={() => navigate('/cadastro')} id="link-cadastro">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
