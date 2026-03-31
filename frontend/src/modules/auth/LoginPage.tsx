import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Bate na API de verdade usando Axios
      const response = await api.post('/api/auth/login', { email, senha });
      
      const { token, user } = response.data;
      
      // Armazena a sessão
      localStorage.setItem('@MarketSystem:token', token);
      localStorage.setItem('@MarketSystem:user', JSON.stringify(user));

      // Redireciona baseado no Cargo REAL que vem do PostgreSQL
      switch(user.role) {
        case 'ADMIN': return navigate('/admin');
        case 'DONO': 
        case 'GERENTE':
        case 'ESTOQUE':
        case 'CAIXA': return navigate('/comerciante');
        case 'ENTREGADOR': return navigate('/entregador');
        case 'CLIENTE': 
        default: return navigate('/cliente');
      }
    } catch(error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Erro ao fazer login. Servidor offline?');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    setLoading(true);
    setTimeout(() => {
      navigate(`/${role}`);
      setLoading(false);
    }, 800);
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
            <span>ou acesse como</span>
          </div>

          {/* Demo buttons */}
          <div className="demo-buttons">
            <button className="demo-btn" onClick={() => handleDemoLogin('cliente')} id="demo-cliente">
              <span className="demo-icon">👤</span>
              <span className="demo-label">Cliente</span>
            </button>
            <button className="demo-btn" onClick={() => handleDemoLogin('comerciante')} id="demo-comerciante">
              <span className="demo-icon">🏪</span>
              <span className="demo-label">Comerciante</span>
            </button>
            <button className="demo-btn" onClick={() => handleDemoLogin('entregador')} id="demo-entregador">
              <span className="demo-icon">🛵</span>
              <span className="demo-label">Entregador</span>
            </button>
            <button className="demo-btn" onClick={() => handleDemoLogin('admin')} id="demo-admin">
              <span className="demo-icon">⚙️</span>
              <span className="demo-label">Admin</span>
            </button>
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
