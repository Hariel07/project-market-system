import { useNavigate } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import './ComercianteConfig.css';

export default function ComercianteConfig() {
  const navigate = useNavigate();

  const menuSections = [
    {
      title: '🏪 Comércio',
      items: [
        { path: '/comerciante/config/perfil', icon: '📝', label: 'Perfil da Loja', desc: 'Dados e Horário de Funcionamento' },
        { path: '#', icon: '📍', label: 'Área de entrega', desc: 'Raio de cobertura e taxas por região' },
      ]
    },
    {
      title: '💳 Financeiro',
      items: [
        { path: '#', icon: '🏦', label: 'Dados bancários', desc: 'Conta para recebimentos' },
        { path: '#', icon: '💰', label: 'Formas de pagamento', desc: 'PIX, cartão, dinheiro' },
        { path: '#', icon: '📊', label: 'Relatórios', desc: 'Vendas, comissões e extratos' },
      ]
    },
    {
      title: '⚙️ Sistema',
      items: [
        { path: '#', icon: '🔔', label: 'Notificações', desc: 'Alertas de pedidos e estoque' },
        { path: '#', icon: '👥', label: 'Funcionários', desc: 'Gerencie acessos (MVP futuro)' },
        { path: '#', icon: '🖨️', label: 'Impressão', desc: 'Configurar impressora de comandas' },
      ]
    },
  ];

  return (
    <ComercianteLayout title="Configurações" subtitle="Gerencie seu comércio">
      <div className="config-sections animate-fade-in-up">
        {menuSections.map(section => (
          <div key={section.title} className="config-section">
            <h3 className="config-section-title">{section.title}</h3>
            <div className="config-menu">
              {section.items.map(item => (
                <button 
                  key={item.label} 
                  className="config-menu-item" 
                  onClick={() => item.path !== '#' && navigate(item.path)}
                >
                  <span className="config-menu-icon">{item.icon}</span>
                  <div className="config-menu-info">
                    <span className="config-menu-label">{item.label}</span>
                    <span className="config-menu-desc">{item.desc}</span>
                  </div>
                  <span className="config-menu-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="btn btn-outline btn-block config-logout" onClick={() => { localStorage.removeItem('@MarketSystem:token'); localStorage.removeItem('@MarketSystem:user'); navigate('/login'); }}>
          🚪 Sair da conta
        </button>
      </div>
    </ComercianteLayout>
  );
}
