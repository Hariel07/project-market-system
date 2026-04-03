import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EntregadorLayout from './EntregadorLayout';
import { useAuthProtected, useAuthUser } from '../../lib/useAuth';
import { api } from '../../lib/api';
import './ContaBancariaPage.css';

interface ContaBancaria {
  id: string;
  banco: string;
  titular: string;
  chave_pix: string;
  tipo_pix: 'cpf' | 'email' | 'telefone' | 'aleatoria';
}

interface Repasse {
  id: string;
  data: string;
  valor: number;
  status: 'pendente' | 'processando' | 'concluido' | 'falhou';
  banco: string;
  chave_pix: string;
}

export default function ContaBancariaPage() {
  const navigate = useNavigate();
  useAuthProtected(['ENTREGADOR']);
  const { userId } = useAuthUser();

  const [conta, setConta] = useState<ContaBancaria | null>(null);
  const [repassos, setRepassos] = useState<Repasse[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    banco: '',
    titular: '',
    chave_pix: '',
    tipo_pix: 'cpf' as const,
  });

  // Simular carregamento de dados (seria da API)
  useEffect(() => {
    setTimeout(() => {
      // Mock data
      setConta({
        id: '1',
        banco: 'Banco do Brasil',
        titular: 'João da Silva',
        chave_pix: '123.456.789-00',
        tipo_pix: 'cpf',
      });

      // Mock repassos
      const hoje = new Date();
      setRepassos([
        {
          id: '1',
          data: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          valor: 250.00,
          status: 'concluido',
          banco: 'Banco do Brasil',
          chave_pix: '123.456.789-00',
        },
        {
          id: '2',
          data: new Date(hoje.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          valor: 320.50,
          status: 'concluido',
          banco: 'Banco do Brasil',
          chave_pix: '123.456.789-00',
        },
        {
          id: '3',
          data: new Date(hoje.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          valor: 180.00,
          status: 'processando',
          banco: 'Banco do Brasil',
          chave_pix: '123.456.789-00',
        },
      ]);

      // Saldo disponível (seria calculado pela API)
      setSaldo(450.75);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddConta = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui iria chamar a API para salvar a conta
    console.log('Salvando conta:', formData);
    setShowForm(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; emoji: string; color: string }> = {
      pendente: { label: 'Pendente', emoji: '⏳', color: '#ffc107' },
      processando: { label: 'Processando', emoji: '🔄', color: '#17a2b8' },
      concluido: { label: 'Concluído', emoji: '✅', color: '#28a745' },
      falhou: { label: 'Falhou', emoji: '❌', color: '#dc3545' },
    };
    const info = statusMap[status] || statusMap.pendente;
    return { ...info };
  };

  if (loading) {
    return (
      <EntregadorLayout title="Conta Bancária">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Carregando dados...</p>
        </div>
      </EntregadorLayout>
    );
  }

  return (
    <EntregadorLayout title="Conta Bancária">
      <div className="conta-bancaria-container animate-fade-in-up">
        {/* Saldo Disponível */}
        <div className="saldo-card">
          <div className="saldo-label">Saldo Disponível</div>
          <div className="saldo-valor">{formatCurrency(saldo)}</div>
          <button className="btn btn-sm btn-primary mt-3">
            💸 Sacar Agora
          </button>
        </div>

        {/* Conta Bancária */}
        <div className="section mt-4">
          <div className="section-header">
            <h3>Conta para Repasse</h3>
            {conta && (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setShowForm(true)}
              >
                ✏️
              </button>
            )}
          </div>

          {!conta ? (
            <div className="empty-state">
              <p>Nenhuma conta bancária cadastrada</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => setShowForm(true)}
              >
                ➕ Adicionar Conta
              </button>
            </div>
          ) : (
            <div className="conta-info">
              <div className="info-item">
                <span className="info-label">Banco</span>
                <span className="info-value">{conta.banco}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Titular</span>
                <span className="info-value">{conta.titular}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Chave Pix</span>
                <span className="info-value">{conta.chave_pix}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tipo Pix</span>
                <span className="info-value">
                  {conta.tipo_pix === 'cpf' && '📱 CPF'}
                  {conta.tipo_pix === 'email' && '📧 Email'}
                  {conta.tipo_pix === 'telefone' && '☎️ Telefone'}
                  {conta.tipo_pix === 'aleatoria' && '🎲 Aleatória'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Histórico de Repassos */}
        <div className="section mt-4">
          <h3>Histórico de Repassos</h3>
          {repassos.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum repasse realizado ainda</p>
            </div>
          ) : (
            <div className="repassos-list">
              {repassos.map((repasse) => {
                const status = getStatusBadge(repasse.status);
                return (
                  <div key={repasse.id} className="repasse-item">
                    <div className="repasse-left">
                      <div className="repasse-info">
                        <div className="repasse-valor">{formatCurrency(repasse.valor)}</div>
                        <div className="repasse-data">{formatDate(repasse.data)}</div>
                      </div>
                    </div>
                    <div className="repasse-status" style={{ backgroundColor: status.color + '20' }}>
                      <span style={{ color: status.color }}>
                        {status.emoji} {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Adicionar Conta */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Adicionar Conta Bancária</h3>
                <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <form onSubmit={handleAddConta} className="modal-form">
                <div className="form-group">
                  <label>Banco</label>
                  <select
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                    required
                  >
                    <option value="">Selecione um banco</option>
                    <option value="Banco do Brasil">Banco do Brasil</option>
                    <option value="Caixa Econômica">Caixa Econômica</option>
                    <option value="Bradesco">Bradesco</option>
                    <option value="Itaú">Itaú</option>
                    <option value="Nu Pagamentos">Nu Pagamentos</option>
                    <option value="Nubank">Nubank</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Titular da Conta</label>
                  <input
                    type="text"
                    value={formData.titular}
                    onChange={(e) => setFormData({ ...formData, titular: e.target.value })}
                    placeholder="Nome do titular"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Chave Pix</label>
                  <select
                    value={formData.tipo_pix}
                    onChange={(e) => setFormData({ ...formData, tipo_pix: e.target.value as any })}
                  >
                    <option value="cpf">CPF</option>
                    <option value="email">Email</option>
                    <option value="telefone">Telefone</option>
                    <option value="aleatoria">Chave Aleatória</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Chave Pix</label>
                  <input
                    type="text"
                    value={formData.chave_pix}
                    onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                    placeholder={
                      formData.tipo_pix === 'cpf'
                        ? '123.456.789-00'
                        : formData.tipo_pix === 'email'
                        ? 'seu@email.com'
                        : '(11) 99999-9999'
                    }
                    required
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Salvar Conta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </EntregadorLayout>
  );
}
