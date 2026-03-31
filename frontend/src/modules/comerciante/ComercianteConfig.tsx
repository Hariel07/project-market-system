import { useNavigate } from 'react-router-dom';
import ComercianteLayout from './ComercianteLayout';
import './ComercianteConfig.css';

export default function ComercianteConfig() {
  const navigate = useNavigate();

  const menuSections = [
    {
      title: '🏪 Comércio',
      items: [
        { icon: '📝', label: 'Dados do comércio', desc: 'Nome, segmento, endereço, contato' },
        { icon: '🕐', label: 'Horário de funcionamento', desc: 'Defina os dias/horários de abertura' },
        { icon: '📍', label: 'Área de entrega', desc: 'Raio de cobertura e taxas por região' },
        { icon: '🚚', label: 'Taxas e prazos', desc: 'Configure taxa de entrega e tempo estimado' },
      ]
    },
    {
      title: '💳 Financeiro',
      items: [
        { icon: '🏦', label: 'Dados bancários', desc: 'Conta para recebimentos' },
        { icon: '💰', label: 'Formas de pagamento', desc: 'PIX, cartão, dinheiro' },
        { icon: '📊', label: 'Relatórios', desc: 'Vendas, comissões e extratos' },
      ]
    },
    {
      title: '⚙️ Sistema',
      items: [
        { icon: '🔔', label: 'Notificações', desc: 'Alertas de pedidos e estoque' },
        { icon: '👥', label: 'Funcionários', desc: 'Gerencie acessos (MVP futuro)' },
        { icon: '🖨️', label: 'Impressão', desc: 'Configurar impressora de comandas' },
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
                <button key={item.label} className="config-menu-item" id={`config-${item.label.toLowerCase().replace(/ /g,'-')}`}>
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

        <button className="btn btn-outline btn-block config-logout" onClick={() => navigate('/login')}>
          🚪 Sair da conta
        </button>
      </div>
    </ComercianteLayout>
  );
}
