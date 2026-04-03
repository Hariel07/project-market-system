import { useEffect, useState } from 'react';
import EntregadorLayout from './EntregadorLayout';
import { formatPrice } from '../../data/mockData';
import { api } from '../../lib/api';
import { useAuthProtected, useAuthUser } from '../../lib/useAuth';
import './EntregadorHistorico.css';

type PeriodoFiltro = 'hoje' | 'semana' | 'mes' | 'ano';

interface GanhosPeriodo {
  periodo: string;
  totalGanho: number;
  totalEntregas: number;
  distanciaTotal: number;
  avaliacao: number;
}

export default function EntregadorGanhos() {
  useAuthProtected(['ENTREGADOR']);
  const { userId } = useAuthUser();

  const [filtro, setFiltro] = useState<PeriodoFiltro>('mes');
  const [ganhosData, setGanhosData] = useState<GanhosPeriodo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saldoDisponivel] = useState(2548.70);
  const [totalTransferido] = useState(5420.00);

  // Dados mock para ganhos por período
  const ganhosMock = {
    hoje: {
      periodo: 'Hoje',
      totalGanho: 245.80,
      totalEntregas: 8,
      distanciaTotal: 42.5,
      avaliacao: 4.9,
    },
    semana: {
      periodo: 'Esta Semana',
      totalGanho: 1420.50,
      totalEntregas: 48,
      distanciaTotal: 285.0,
      avaliacao: 4.85,
    },
    mes: {
      periodo: 'Este Mês',
      totalGanho: 5680.30,
      totalEntregas: 195,
      distanciaTotal: 1200.0,
      avaliacao: 4.8,
    },
    ano: {
      periodo: 'Este Ano',
      totalGanho: 68540.00,
      totalEntregas: 2400,
      distanciaTotal: 14400.0,
      avaliacao: 4.75,
    },
  };

  useEffect(() => {
    const carregarGanhos = async () => {
      setLoading(true);
      try {
        if (!userId) {
          setGanhosData(null);
          return;
        }

        // Por enquanto usando mock, futuramente conectar à API
        const data = ganhosMock[filtro];
        setGanhosData(data);
      } catch (error) {
        console.error('Erro ao carregar ganhos:', error);
        const data = ganhosMock[filtro];
        setGanhosData(data);
      } finally {
        setLoading(false);
      }
    };

    carregarGanhos();
  }, [filtro, userId]);

  const getTotaisPorMes = () => {
    // Mock de dados para 12 meses (para gráfico)
    return [
      { mes: 'Jan', valor: 4200 },
      { mes: 'Fev', valor: 5100 },
      { mes: 'Mar', valor: 6200 },
      { mes: 'Abr', valor: 5680 },
      { mes: 'Mai', valor: 7100 },
      { mes: 'Jun', valor: 6800 },
      { mes: 'Jul', valor: 7500 },
      { mes: 'Ago', valor: 8200 },
      { mes: 'Set', valor: 6900 },
      { mes: 'Out', valor: 7600 },
      { mes: 'Nov', valor: 8100 },
      { mes: 'Dez', valor: 0 },
    ];
  };

  const maxValor = Math.max(...getTotaisPorMes().map(d => d.valor));

  if (loading) {
    return (
      <EntregadorLayout title="Meus Ganhos">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>⏳ Carregando dados financeiros...</p>
        </div>
      </EntregadorLayout>
    );
  }

  return (
    <EntregadorLayout title="Meus Ganhos">
      <div className="ent-historico" style={{ paddingBottom: '80px' }}>
        {/* Saldo Principal */}
        <div className="ent-balanco-card animate-fade-in-up">
          <span className="balanco-subtitle">💰 Saldo Disponível</span>
          <h2 className="balanco-title">{formatPrice(saldoDisponivel)}</h2>
          <div className="balanco-actions">
            <button
              className="btn btn-primary balance-btn"
              onClick={() => alert('Redirecionando para Pix...')}
            >
              💸 Transferir via Pix
            </button>
            <button
              className="btn btn-outline"
              style={{
                background: 'white',
                border: '2px solid #ff6b35',
                color: '#ff6b35',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => alert('Extrato: Total transferido R$ ' + totalTransferido)}
            >
              📊 Ver Extrato
            </button>
          </div>
        </div>

        {/* Filtros de Período */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '20px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '8px',
          }}
        >
          {(['hoje', 'semana', 'mes', 'ano'] as const).map((periodo) => (
            <button
              key={periodo}
              onClick={() => setFiltro(periodo)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: filtro === periodo ? '#ff6b35' : '#f0f0f0',
                color: filtro === periodo ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: filtro === periodo ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s',
              }}
            >
              {periodo === 'hoje' && '📅 Hoje'}
              {periodo === 'semana' && '📊 Esta Semana'}
              {periodo === 'mes' && '📈 Este Mês'}
              {periodo === 'ano' && '📉 Este Ano'}
            </button>
          ))}
        </div>

        {ganhosData && (
          <>
            {/* Cards de Resumo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total de Entregas</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b35' }}>
                  {ganhosData.totalEntregas}
                </div>
              </div>
              <div
                style={{
                  background: '#e8f5e9',
                  border: '1px solid #4caf50',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Distância Total</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                  {ganhosData.distanciaTotal.toFixed(1)} km
                </div>
              </div>
            </div>

            {/* Gráfico de Ganhos por Mês */}
            <div
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold' }}>
                📊 Ganhos por Mês
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-around',
                  gap: '4px',
                  height: '150px',
                }}
              >
                {getTotaisPorMes().map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      textAlign: 'center',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${(item.valor / maxValor) * 100}%`,
                        background: item.valor > 0 ? '#ff6b35' : '#ddd',
                        borderRadius: '4px 4px 0 0',
                        minHeight: '4px',
                        transition: 'all 0.2s',
                      }}
                      title={formatPrice(item.valor)}
                    />
                    <div style={{ fontSize: '10px', marginTop: '4px', color: '#666' }}>{item.mes}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informações Detalhadas */}
            <div
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
                📋 Resumo de {ganhosData.periodo}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>💰 Ganho Total</span>
                  <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{formatPrice(ganhosData.totalGanho)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>🛵 Total de Corridas</span>
                  <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{ganhosData.totalEntregas}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>📍 Distância Rodada</span>
                  <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{ganhosData.distanciaTotal.toFixed(1)} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>⭐ Avaliação Média</span>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#ffc107' }}>
                    ⭐ {ganhosData.avaliacao.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Histórico de Transferências */}
            <div
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
                💳 Últimas Transferências
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Transferência Pix</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>02/04/2026 às 14:30</div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#4caf50' }}>
                    +{formatPrice(500)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Transferência Pix</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>01/04/2026 às 18:15</div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#4caf50' }}>
                    +{formatPrice(1200)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Transferência Pix</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>31/03/2026 às 10:45</div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#4caf50' }}>
                    +{formatPrice(800)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </EntregadorLayout>
  );
}
