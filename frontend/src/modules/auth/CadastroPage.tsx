import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import './AuthPages.css';

const roles = [
  { id: 'cliente', icon: '👤', label: 'Cliente', desc: 'Compre em mercados e restaurantes' },
  { id: 'comerciante', icon: '🏪', label: 'Comerciante', desc: 'Gerencie seu comércio' },
  { id: 'entregador', icon: '🛵', label: 'Entregador', desc: 'Faça entregas e ganhe' },
];

export default function CadastroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  // Campos adicionais do comerciante
  const [nomeComercio, setNomeComercio] = useState('');
  const [tipoComercio, setTipoComercio] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [plano, setPlano] = useState('gratis');

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove não números
    if (value.length > 14) value = value.slice(0, 14);
    
    // Máscara 00.000.000/0000-00
    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4}).*/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{1,3}).*/, '$1.$2');
    }
    setCnpj(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) return setStep(2);
    if (step === 2 && role === 'comerciante') return setStep(3);
    if (step === 3 && role === 'comerciante') return setStep(4);

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Envia os dados verdadeiros para o nosso Banco PostgreSQL!
      const response = await api.post('/api/auth/cadastro', {
        role,
        nome,
        email,
        senha,
        telefone,
        // Só vão ser lidos se for comerciante:
        nomeComercio,
        tipoComercio,
        cnpj,
        plano
      });

      // 2. Salva o passaporte de acesso (JWT) e dados puros do user localmente
      const { token, user } = response.data;
      localStorage.setItem('@MarketSystem:token', token);
      localStorage.setItem('@MarketSystem:user', JSON.stringify(user));

      // 3. Joga o usuário vivo para dentro do Dashboard
      if (role === 'comerciante') navigate('/comerciante');
      else if (role === 'entregador') navigate('/entregador');
      else navigate('/cliente');
      
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Erro ao comunicar com o Banco de Dados. O servidor Backend está rodando?');
    } finally {
      setLoading(false);
    }
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
            <h1 className="auth-title">Criar Conta</h1>
            <p className="auth-subtitle">
              {step === 1 ? 'Como você quer usar o Market System?' :
               step === 2 ? 'Preencha seus dados' :
               step === 3 ? 'Dados do seu comércio' :
               'Escolha seu plano'}
            </p>
          </div>

          {/* Progress */}
          <div className="register-progress">
            {[1, 2, ...(role === 'comerciante' ? [3, 4] : [])].map(s => (
              <div key={s} className={`progress-step-dot ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`} />
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Step 1 — Escolha de perfil */}
            {step === 1 && (
              <div className="role-selection animate-fade-in-up">
                {roles.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    className={`role-card ${role === r.id ? 'active' : ''}`}
                    onClick={() => setRole(r.id)}
                    id={`role-${r.id}`}
                  >
                    <span className="role-icon">{r.icon}</span>
                    <div className="role-info">
                      <span className="role-label">{r.label}</span>
                      <span className="role-desc">{r.desc}</span>
                    </div>
                    <span className="role-check">{role === r.id ? '●' : '○'}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2 — Dados pessoais */}
            {step === 2 && (
              <div className="animate-fade-in-up">
                <div className="input-group">
                  <label htmlFor="nome">Nome completo</label>
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <input id="nome" type="text" className="input" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="reg-email">E-mail</label>
                  <div className="input-with-icon">
                    <span className="input-icon">✉️</span>
                    <input id="reg-email" type="email" className="input" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="telefone">Telefone</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📱</span>
                    <input id="telefone" type="tel" className="input" placeholder="(11) 99999-0000" value={telefone} onChange={e => setTelefone(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="reg-senha">Senha</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔒</span>
                    <input id="reg-senha" type="password" className="input" placeholder="Mínimo 8 caracteres" value={senha} onChange={e => setSenha(e.target.value)} required minLength={8} />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="confirmar-senha">Confirmar senha</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔒</span>
                    <input id="confirmar-senha" type="password" className="input" placeholder="Repita a senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required />
                  </div>
                  {confirmarSenha && senha !== confirmarSenha && (
                    <span className="input-error">As senhas não coincidem</span>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 — Dados do comércio (só comerciante) */}
            {step === 3 && (
              <div className="animate-fade-in-up">
                <div className="input-group">
                  <label htmlFor="nome-comercio">Nome do comércio</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🏪</span>
                    <input id="nome-comercio" type="text" className="input" placeholder="Ex: Mercado Bom Preço" value={nomeComercio} onChange={e => setNomeComercio(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="tipo-comercio">Tipo de comércio</label>
                  <select
                    id="tipo-comercio"
                    className="input select-input"
                    value={tipoComercio}
                    onChange={e => setTipoComercio(e.target.value)}
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="mercado">🛒 Mercado</option>
                    <option value="restaurante">🍔 Restaurante / Lanchonete</option>
                    <option value="farmacia">💊 Farmácia</option>
                    <option value="padaria">🥖 Padaria</option>
                    <option value="bar">🍺 Bar</option>
                    <option value="hortifruti">🥬 Hortifruti</option>
                    <option value="materiais">🔨 Materiais de Construção</option>
                    <option value="servicos">⚙️ Serviços</option>
                    <option value="digital">🎓 Produtos Digitais</option>
                    <option value="outro">📦 Outro</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="cnpj">CNPJ <span className="optional">(opcional)</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">📄</span>
                    <input id="cnpj" type="text" className="input" placeholder="00.000.000/0001-00" value={cnpj} onChange={handleCNPJChange} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Escolha de Plano (só comerciante) */}
            {step === 4 && (
              <div className="plan-selection animate-fade-in-up">
                {[
                  { id: 'gratis', nome: 'GRÁTIS', preco: 'R$ 0,00', features: ['Até 50 itens', '1 PDV', 'Cardápio Digital'] },
                  { id: 'pro', nome: 'PRO', preco: 'R$ 99,90/mês', features: ['Itens Ilimitados', '3 PDVs', 'Gestão de Estoque'] },
                  { id: 'enterprise', nome: 'ENTERPRISE', preco: 'R$ 299,90/mês', features: ['Multi-lojas', 'Acesso à API', 'Emissão Fiscal NF-e'] }
                ].map(p => (
                  <button 
                    key={p.id} 
                    type="button" 
                    className={`plan-card ${plano === p.id ? 'active' : ''}`}
                    onClick={() => setPlano(p.id)}
                  >
                    <div className="plan-header-card">
                      <span className="plan-name">{p.nome}</span>
                      <span className="plan-price">{p.preco}</span>
                    </div>
                    <ul className="plan-features">
                      {p.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                    </ul>
                  </button>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="auth-nav-buttons">
              {step > 1 && (
                <button type="button" className="btn btn-outline" onClick={() => setStep(step - 1)}>
                  ← Voltar
                </button>
              )}
              <button
                type="submit"
                className={`btn btn-primary btn-lg flex-1 ${loading ? 'loading' : ''}`}
                disabled={loading || (step === 1 && !role)}
                id="btn-next"
              >
                {loading ? (
                  <span className="btn-loading"><span className="spinner" /> Criando conta...</span>
                ) : step === 1 ? 'Continuar' :
                  (step === 2 || step === 3) && role === 'comerciante' ? 'Próximo' :
                  'Criar conta'}
              </button>
            </div>
          </form>

          {/* Login link */}
          <p className="auth-footer">
            Já tem uma conta?{' '}
            <button className="auth-link" onClick={() => navigate('/login')} id="link-login">
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
