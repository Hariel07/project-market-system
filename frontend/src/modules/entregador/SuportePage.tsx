import { useState } from 'react';
import EntregadorLayout from './EntregadorLayout';
import { useAuthProtected } from '../../lib/useAuth';
import './SuportePage.css';

interface FAQItem {
  id: number;
  pergunta: string;
  resposta: string;
}

export default function SuportePage() {
  useAuthProtected(['ENTREGADOR']);

  const [formularioAberto, setFormularioAberto] = useState(false);
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    assunto: '',
    mensagem: '',
    categoria: 'problema',
  });
  const [enviado, setEnviado] = useState(false);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      pergunta: 'Como começo a fazer entregas?',
      resposta:
        'Para começar, complete seu cadastro com documentos, configure sua conta bancária e aguarde aprovação. Você receberá um email de confirmação quando estiver ativo.',
    },
    {
      id: 2,
      pergunta: 'Qual é a taxa de comissão?',
      resposta:
        'A comissão varia de 15% a 25% dependendo do volume mensal de entregas. Veja detalhes precisos na seção "Meu Plano".',
    },
    {
      id: 3,
      pergunta: 'Como recebo meus ganhos?',
      resposta:
        'Os ganhos são repassados semanalmente via Pix para a chave cadastrada. Você pode acompanhar os repassos na seção "Conta Bancária".',
    },
    {
      id: 4,
      pergunta: 'Qual é meu horário de trabalho?',
      resposta:
        'Você é livre para definir seu próprio horário. Apenas mantenha-se disponível para aceitar entregas quando estiver ativo no app.',
    },
    {
      id: 5,
      pergunta: 'O que fazer se tiver um problema com uma entrega?',
      resposta:
        'Entre em contato com o cliente através do chat integrado. Se precisar de ajuda, abra um ticket de suporte e nossa equipe te ajudará em até 2 horas.',
    },
    {
      id: 6,
      pergunta: 'Como melhorar minha avaliação?',
      resposta:
        'Seja pontual, atender com educação e mantenha seu veículo limpo. Boas avaliações aumentam suas chancesde receber mais entregas premium.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula envio
    console.log('Enviado:', formData);
    setEnviado(true);
    setTimeout(() => {
      setFormularioAberto(false);
      setEnviado(false);
      setFormData({ assunto: '', mensagem: '', categoria: 'problema' });
    }, 2000);
  };

  return (
    <EntregadorLayout title="Suporte">
      <div className="suporte-container animate-fade-in-up">
        {/* Quick Links */}
        <div className="quick-links">
          <a href="#faq" className="quick-link-card">
            <span className="quick-icon">❓</span>
            <span className="quick-text">Perguntas Frequentes</span>
          </a>
          <button
            className="quick-link-card"
            onClick={() => setFormularioAberto(!formularioAberto)}
          >
            <span className="quick-icon">💬</span>
            <span className="quick-text">Fale Conosco</span>
          </button>
          <a href="#termos" className="quick-link-card">
            <span className="quick-icon">📋</span>
            <span className="quick-text">Termos e Políticas</span>
          </a>
        </div>

        {/* Formulário de Contato */}
        {formularioAberto && (
          <div className="form-section animate-slide-down">
            <h2 className="form-title">Entre em Contato</h2>

            {enviado && (
              <div className="alert alert-success">
                ✅ Mensagem enviada com sucesso! Nossa equipe responderá em breve.
              </div>
            )}

            <form onSubmit={handleSubmit} className="suporte-form">
              <div className="form-group">
                <label htmlFor="categoria">Categoria *</label>
                <select
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  required
                >
                  <option value="problema">🚨 Problema Técnico</option>
                  <option value="pagamento">💳 Pagamento/Repasse</option>
                  <option value="entrega">📦 Problema com Entrega</option>
                  <option value="outro">❓ Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assunto">Assunto *</label>
                <input
                  id="assunto"
                  type="text"
                  placeholder="Descreva brevemente o assunto"
                  value={formData.assunto}
                  onChange={(e) =>
                    setFormData({ ...formData, assunto: e.target.value })
                  }
                  required
                  maxLength={100}
                />
                <span className="char-count">
                  {formData.assunto.length}/100
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="mensagem">Mensagem *</label>
                <textarea
                  id="mensagem"
                  placeholder="Descreva seu problema em detalhes..."
                  value={formData.mensagem}
                  onChange={(e) =>
                    setFormData({ ...formData, mensagem: e.target.value })
                  }
                  required
                  maxLength={1000}
                  rows={5}
                ></textarea>
                <span className="char-count">
                  {formData.mensagem.length}/1000
                </span>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setFormularioAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  📤 Enviar Mensagem
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FAQs */}
        <div id="faq" className="faq-section">
          <h2 className="section-title">❓ Perguntas Frequentes</h2>

          <div className="faq-list">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="faq-item"
                onClick={() =>
                  setFaqAberto(faqAberto === item.id ? null : item.id)
                }
              >
                <div className="faq-header">
                  <span className="faq-number">{item.id}</span>
                  <span className="faq-pergunta">{item.pergunta}</span>
                  <span
                    className={`faq-icon ${
                      faqAberto === item.id ? 'open' : ''
                    }`}
                  >
                    ▼
                  </span>
                </div>
                {faqAberto === item.id && (
                  <div className="faq-resposta animate-slide-down">
                    {item.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="contact-section">
          <h2 className="section-title">📞 Contato Direto</h2>

          <div className="contact-list">
            <a href="tel:1133334444" className="contact-item">
              <span className="contact-icon">📱</span>
              <div className="contact-info">
                <span className="contact-label">Telefone</span>
                <span className="contact-value">(11) 3333-4444</span>
              </div>
              <span className="contact-arrow">→</span>
            </a>

            <a href="mailto:suporte@market.com" className="contact-item">
              <span className="contact-icon">📧</span>
              <div className="contact-info">
                <span className="contact-label">Email</span>
                <span className="contact-value">suporte@market.com</span>
              </div>
              <span className="contact-arrow">→</span>
            </a>

            <a href="#chat" className="contact-item">
              <span className="contact-icon">💬</span>
              <div className="contact-info">
                <span className="contact-label">Chat ao Vivo</span>
                <span className="contact-value">Seg-Sex: 9h às 18h</span>
              </div>
              <span className="contact-arrow">→</span>
            </a>
          </div>
        </div>

        {/* Documentação */}
        <div id="termos" className="docs-section">
          <h2 className="section-title">📋 Documentação e Políticas</h2>

          <div className="docs-list">
            <a href="#" className="doc-item">
              <span className="doc-icon">📄</span>
              <div className="doc-info">
                <span className="doc-label">Termos de Serviço</span>
                <span className="doc-desc">Direitos e responsabilidades</span>
              </div>
            </a>

            <a href="#" className="doc-item">
              <span className="doc-icon">🔒</span>
              <div className="doc-info">
                <span className="doc-label">Política de Privacidade</span>
                <span className="doc-desc">Como usamos seus dados</span>
              </div>
            </a>

            <a href="#" className="doc-item">
              <span className="doc-icon">⚖️</span>
              <div className="doc-info">
                <span className="doc-label">Código de Conduta</span>
                <span className="doc-desc">Guia de profissionalismo</span>
              </div>
            </a>

            <a href="#" className="doc-item">
              <span className="doc-icon">💰</span>
              <div className="doc-info">
                <span className="doc-label">Política de Comissões</span>
                <span className="doc-desc">Detalhes sobre ganhos</span>
              </div>
            </a>
          </div>
        </div>

        {/* Status de Suporte */}
        <div className="status-section">
          <h3 className="status-title">🟢 Status do Suporte</h3>
          <div className="status-info">
            <p>
              <strong>Horário de Atendimento:</strong> Segunda a Sexta, 9h às
              18h
            </p>
            <p>
              <strong>Tempo Médio de Resposta:</strong> Até 2 horas em dias
              úteis
            </p>
            <p>
              <strong>Status:</strong> ✅ Todos os sistemas operacionais
            </p>
          </div>
        </div>

        {/* Espaço extra */}
        <div style={{ height: '100px' }}></div>
      </div>
    </EntregadorLayout>
  );
}
