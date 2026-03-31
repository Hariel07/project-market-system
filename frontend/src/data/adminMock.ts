// ============================================================
// Dados Mockados — Telas do Administrador da Plataforma
// ============================================================

export interface ComercioGlobal {
  id: number;
  nome: string;
  segmento: string;
  dono: string;
  email: string;
  dataCadastro: string;
  status: 'ativo' | 'analise' | 'bloqueado';
  plano: 'gratis' | 'pro' | 'enterprise';
  faturamentoMes: number;
  pedidosMes: number;
}

export const adminStatsMock = {
  comerciosAtivos: 142,
  novosCadastros: 12, // nesta semana
  gmvMensal: 1450230.50, // Gross Merchandise Volume (Volume Total Transacionado)
  mensalidades: 18500.00, // MRR se houver planos pagos
  usuariosAtivos: 8540,
  taxaCrescimento: 15.4, // %
};

export const comerciosGlobalMock: ComercioGlobal[] = [
  {
    id: 1,
    nome: 'Burguer House',
    segmento: 'Restaurante',
    dono: 'Carlos Silva',
    email: 'carlos@burguerhouse.com',
    dataCadastro: '12/01/2026',
    status: 'ativo',
    plano: 'pro',
    faturamentoMes: 45000.00,
    pedidosMes: 850,
  },
  {
    id: 2,
    nome: 'Mercado Bom Preço',
    segmento: 'Mercado',
    dono: 'Maria Fernanda',
    email: 'contato@bompreco.com.br',
    dataCadastro: '05/02/2026',
    status: 'ativo',
    plano: 'enterprise',
    faturamentoMes: 125000.00,
    pedidosMes: 3200,
  },
  {
    id: 3,
    nome: 'Farmácia Saúde+',
    segmento: 'Farmácia',
    dono: 'Roberto Almeida',
    email: 'roberto.farmacia@gmail.com',
    dataCadastro: '20/03/2026',
    status: 'analise',
    plano: 'gratis',
    faturamentoMes: 0,
    pedidosMes: 0,
  },
  {
    id: 4,
    nome: 'Padaria Pão Quente',
    segmento: 'Padaria',
    dono: 'Seu João',
    email: 'joao.paoquente@outlook.com',
    dataCadastro: '15/11/2025',
    status: 'bloqueado',
    plano: 'gratis',
    faturamentoMes: 0,
    pedidosMes: 0,
  },
  {
    id: 5,
    nome: 'Depósito ConstruRápido',
    segmento: 'Materiais de Construção',
    dono: 'Ana Costa',
    email: 'vendas@construrapido.com',
    dataCadastro: '28/02/2026',
    status: 'ativo',
    plano: 'pro',
    faturamentoMes: 80000.00,
    pedidosMes: 140,
  }
];

// Dados para o gráfico global do Admin (GMV dos últimos 6 meses)
export const adminChartMock = [
  { mes: 'Out', gmv: 850000 },
  { mes: 'Nov', gmv: 980000 },
  { mes: 'Dez', gmv: 1200000 },
  { mes: 'Jan', gmv: 1100000 },
  { mes: 'Fev', gmv: 1350000 },
  { mes: 'Mar', gmv: 1450230 },
];
