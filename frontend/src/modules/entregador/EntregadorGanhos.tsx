import { useEffect, useState } from 'react';
import EntregadorLayout from './EntregadorLayout';
import { api } from '../../lib/api';
import { useAuthProtected } from '../../lib/useAuth';
import './EntregadorHistorico.css';

type PeriodoFiltro = 'hoje' | 'semana' | 'mes' | 'ano';

interface GanhosData {
  periodo: string;
  totalGanho: number;
  totalEntregas: number;
  avaliacao: number;
  meses: { mes: string; valor: number }[];
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function EntregadorGanhos() {
  useAuthProtected(['ENTREGADOR']);

  const [filtro, setFiltro] = useState<PeriodoFiltro>('mes');
  const [ganhosData, setGanhosData] = useState<GanhosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErro(null);
    api.get(`financeiro/ganhos?periodo=${filtro}`)
      .then(r => setGanhosData(r.data))
      .catch(() => setErro('Não foi possível carregar os ganhos.'))
      .finally(() => setLoading(false));
  }, [filtro]);

  const maxValor = ganhosData ? Math.max(...ganhosData.meses.map(m => m.valor), 1) : 1;

  if (loading) {
    return (
      <EntregadorLayout title="Meus Ganhos">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>⏳ Carregando dados financeiros...</p>
        </div>
      </EntregadorLayout>
    );
  }

  if (erro) {
    return (
      <EntregadorLayout title="Meus Ganhos">
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <p style={{ fontSize: '2rem' }}>😕</p>
          <p>{erro}</p>
        </div>
      </EntregadorLayout>
    );
  }

  return (
    <EntregadorLayout title="Meus Ganhos">
      <div className="ent-historico" style={{ paddingBottom: '80px' }}>
        {/* Filtros de Período */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
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
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Ganho Total</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>
                  {formatPrice(ganhosData.totalGanho)}
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
                {ganhosData.meses.map((item, idx) => (
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
                {ganhosData.totalEntregas > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>💵 Ganho Médio / Entrega</span>
                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                      {formatPrice(ganhosData.totalGanho / ganhosData.totalEntregas)}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>⭐ Avaliação Média</span>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#ffc107' }}>
                    {ganhosData.avaliacao > 0 ? `⭐ ${ganhosData.avaliacao.toFixed(2)}` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {ganhosData.totalEntregas === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#999', marginTop: '16px' }}>
                <p style={{ fontSize: '2rem' }}>🛵</p>
                <p>Nenhuma entrega finalizada neste período.</p>
              </div>
            )}
          </>
        )}
      </div>
    </EntregadorLayout>
  );
}
