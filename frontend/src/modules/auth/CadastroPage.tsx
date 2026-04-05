import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAppConfig } from '../../lib/useAppName';
import './AuthPages.css';

const roles = [
  { id: 'cliente', icon: '👤', label: 'Cliente', desc: 'Compre em mercados e restaurantes' },
  { id: 'comerciante', icon: '🏪', label: 'Comerciante', desc: 'Gerencie seu comércio' },
  { id: 'entregador', icon: '🛵', label: 'Entregador', desc: 'Faça entregas e ganhe' },
];

interface PlanData {
  id: string;
  nome: string;
  slug: string;
  preco: number;
  descricao: string | null;
  features: string[];
  maxItens: number | null;
  maxPdvs: number | null;
  destaque: boolean;
}

export default function CadastroPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const config = useAppConfig();
  
  const initialRole = searchParams.get('role') || '';

  const [step, setStep] = useState(initialRole ? 2 : 1);
  const [role, setRole] = useState(initialRole);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [passwordValidated, setPasswordValidated] = useState(false);

  // Campos adicionais do comerciante
  const [nomeComercio, setNomeComercio] = useState('');
  const [tipoComercio, setTipoComercio] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [plano, setPlano] = useState('gratis');

  // Dados dinâmicos da API
  const [assinaturaObrigatoria, setAssinaturaObrigatoria] = useState(false);
  const [planosDisponiveis, setPlanosDisponiveis] = useState<PlanData[]>([]);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);

  // Carrega config da plataforma e planos ao montar
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [configRes, planosRes, setupRes] = await Promise.all([
          api.get('/api/config/public'),
          api.get('/api/public/planos'),
          api.get('/api/config/setup-check').catch(() => ({ data: { isSetupMode: false } })),
        ]);
        setAssinaturaObrigatoria(configRes.data.assinaturaObrigatoria);
        setPlanosDisponiveis(planosRes.data);
        
        if (setupRes.data?.isSetupMode) {
          setIsSetupMode(true);
          setRole('admin');
          setStep(2);
        }
      } catch (error) {
        console.error('Erro ao carregar config:', error);
      } finally {
        setConfigLoaded(true);
      }
    };
    loadConfig();
  }, []);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = async (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);

    if (formatted.length === 14) {
      try {
        const rawCpf = formatted.replace(/\D/g, '');
        const res = await api.get(`/api/auth/check-cpf/${rawCpf}`);
        setAccountExists(res.data.exists);
        setPasswordValidated(false); // Reseta validação ao mudar CPF
      } catch (err) {
        console.error('Erro ao checar CPF');
      }
    } else {
      setAccountExists(false);
      setPasswordValidated(false);
    }
  };

  const handleValidatePassword = async () => {
    if (!senha) return alert('Por favor, digite sua senha atual para continuar.');
    setLoading(true);
    try {
      const rawCpf = cpf.replace(/\D/g, '');
      const res = await api.post('/api/auth/validate-password', { cpf: rawCpf, senha });
      
      if (res.data.success) {
        const { nome, email, telefone, dataNascimento } = res.data.data;
        setNome(nome);
        setEmail(email);
        setTelefone(telefone);
        if (dataNascimento) setDataNascimento(dataNascimento.split('T')[0]);
        
        setPasswordValidated(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Senha incorreta.');
    } finally {
      setLoading(false);
    }
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    
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

  const showPlanoStep = role === 'comerciante' && assinaturaObrigatoria && planosDisponiveis.length > 0;
  const totalSteps = isSetupMode ? 2 : (role === 'comerciante' ? (showPlanoStep ? 4 : 3) : 2);
  const isLastStep = step === totalSteps;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1 && !isSetupMode) return setStep(2);
    
    // Bloqueia avanço se conta existe mas não validou a senha ainda
    if (step === 2 && accountExists && !passwordValidated) {
      handleValidatePassword();
      return;
    }

    if (step === 2 && role === 'comerciante' && !isSetupMode) return setStep(3);
    if (step === 3 && role === 'comerciante' && showPlanoStep && !isSetupMode) return setStep(4);

    if (!accountExists && senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    setLoading(true);
    
    try {
      const planoFinal = (!assinaturaObrigatoria && role === 'comerciante') ? 'gratis' : plano;
      const guestLocation = localStorage.getItem('@MarketSystem:guestLocation') || '';

      const response = await api.post('/api/auth/cadastro', {
        role: isSetupMode ? 'admin' : role,
        nome,
        cpf: cpf.replace(/\D/g, ''),
        dataNascimento, // Enviando nova informação
        email,
        senha,
        telefone,
        nomeComercio,
        tipoComercio,
        cnpj,
        plano: planoFinal,
        guestLocation
      });

      const { token, user, isSetup } = response.data;
      localStorage.setItem('@MarketSystem:token', token);
      localStorage.setItem('@MarketSystem:user', JSON.stringify(user));

      if (isSetup || user.role === 'ADMIN') {
        alert('🎉 Bem-vindo, Owner! O sistema foi inicializado com sucesso.');
        navigate('/admin');
        return;
      }

      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else {
        if (role === 'comerciante') navigate('/comerciante');
        else if (role === 'entregador') navigate('/entregador');
        else navigate('/cliente');
      }
      
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Erro ao comunicar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const progressSteps = Array.from({ length: totalSteps }, (_, i) => i + 1);

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
            <div className="auth-logo">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              ) : (
                isSetupMode ? '👑' : '🛒'
              )}
            </div>
            <h1 className="auth-title">{isSetupMode ? 'Configuração Mestre' : 'Criar Conta'}</h1>
            <p className="auth-subtitle">
              {isSetupMode ? 'Crie o perfil do Administrador Owner do sistema' :
               step === 1 ? `Como você quer usar o ${config.nomeApp}?` :
               step === 2 ? 'Preencha seus dados' :
               step === 3 && role === 'comerciante' ? 'Dados do seu comércio' :
               'Escolha seu plano'}
            </p>
          </div>

          <div className="register-progress">
            {progressSteps.map(s => (
              <div key={s} className={`progress-step-dot ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`} />
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
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

            {step === 2 && (
              <div className="animate-fade-in-up">
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
                      onChange={e => handleCpfChange(e.target.value)} 
                      maxLength={14} 
                      autoComplete="username"
                      required 
                      disabled={passwordValidated} 
                    />
                  </div>
                  {accountExists && !passwordValidated && (
                    <span className="text-xs text-blue-dark font-bold mt-1 block">
                      💡 Este CPF já possui uma conta. Digite sua senha abaixo para continuar.
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="reg-senha">{accountExists ? 'Sua senha atual' : 'Crie uma senha'}</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔒</span>
                    <input 
                      id="reg-senha" 
                      type="password" 
                      className="input" 
                      placeholder={accountExists ? 'Digite sua senha' : 'Mínimo 8 caracteres'} 
                      value={senha} 
                      onChange={e => setSenha(e.target.value)} 
                      autoComplete={accountExists ? "current-password" : "new-password"}
                      required 
                      minLength={8} 
                      disabled={passwordValidated} 
                    />
                  </div>
                </div>

                {accountExists && !passwordValidated && (
                  <button type="button" className="btn btn-primary btn-block mb-4" onClick={handleValidatePassword} disabled={loading}>
                    {loading ? 'Validando...' : 'Confirmar Identidade'}
                  </button>
                )}

                {(!accountExists || passwordValidated) && (
                  <>
                    <div className="input-group">
                      <label htmlFor="nome">Nome completo</label>
                      <div className="input-with-icon">
                        <span className="input-icon">👤</span>
                        <input id="nome" type="text" className="input" value={nome} onChange={e => setNome(e.target.value)} required disabled={passwordValidated} />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="dataNasc">Data de Nascimento</label>
                      <div className="input-with-icon">
                        <span className="input-icon">📅</span>
                        <input id="dataNasc" type="date" className="input" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required disabled={passwordValidated} />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="reg-email">E-mail</label>
                      <div className="input-with-icon">
                        <span className="input-icon">✉️</span>
                        <input id="reg-email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required disabled={accountExists} />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="telefone">Telefone</label>
                      <div className="input-with-icon">
                        <span className="input-icon">📱</span>
                        <input id="telefone" type="tel" className="input" value={telefone} onChange={e => setTelefone(e.target.value)} required disabled={passwordValidated} />
                      </div>
                    </div>

                    {!accountExists && (
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
                    )}
                  </>
                )}
              </div>
            )}

            {step === 3 && role === 'comerciante' && (
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

            {step === 4 && showPlanoStep && (
              <div className="plan-selection animate-fade-in-up">
                {planosDisponiveis.map(p => (
                  <button 
                    key={p.id} 
                    type="button" 
                    className={`plan-card ${plano === p.slug ? 'active' : ''} ${p.destaque ? 'plan-destaque' : ''}`}
                    onClick={() => setPlano(p.slug)}
                  >
                    {p.destaque && <span className="plan-recommended">⭐ Recomendado</span>}
                    <div className="plan-header-card">
                      <span className="plan-name">{p.nome.toUpperCase()}</span>
                      <span className="plan-price">
                        {p.preco === 0 ? 'R$ 0,00' : `${formatPrice(p.preco)}/mês`}
                      </span>
                    </div>
                    {p.descricao && <p className="plan-desc">{p.descricao}</p>}
                    <ul className="plan-features">
                      {p.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                    </ul>
                  </button>
                ))}
              </div>
            )}

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
                ) : isLastStep ? (accountExists ? 'Adicionar Perfil' : 'Criar conta') : 'Próximo'}
              </button>
            </div>
          </form>

          <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <p>
              Já tem uma conta?{' '}
              <button className="auth-link" onClick={() => navigate('/login')} id="link-login">
                Faça login
              </button>
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
              onClick={() => navigate('/cliente')}
            >
              👀 Continuar como Visitante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
