// ============================================================
// Dados Mockados — Telas do Comerciante (Dono)
// ============================================================

export interface PedidoComercio {
  id: number;
  numero: string;
  clienteNome: string;
  status: 'novo' | 'confirmado' | 'preparando' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado';
  items: { nome: string; quantidade: number; preco: number }[];
  total: number;
  formaPagamento: string;
  criadoEm: string;
  tempoDecorrido: string;
}

export interface EstoqueMovimento {
  id: number;
  itemNome: string;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  motivo: string;
  data: string;
  responsavel: string;
}

export interface DashboardStats {
  vendasHoje: number;
  pedidosHoje: number;
  ticketMedio: number;
  itensEstoqueBaixo: number;
  pedidosPendentes: number;
  faturamentoMes: number;
  crescimento: number;
}

export const dashboardStatsMock: DashboardStats = {
  vendasHoje: 2847.50,
  pedidosHoje: 34,
  ticketMedio: 83.75,
  itensEstoqueBaixo: 5,
  pedidosPendentes: 3,
  faturamentoMes: 67420.00,
  crescimento: 12.4,
};

export const vendasSemana = [
  { dia: 'Seg', valor: 2100 },
  { dia: 'Ter', valor: 2450 },
  { dia: 'Qua', valor: 1890 },
  { dia: 'Qui', valor: 3200 },
  { dia: 'Sex', valor: 3800 },
  { dia: 'Sáb', valor: 4500 },
  { dia: 'Dom', valor: 2847 },
];

export const pedidosComercioMock: PedidoComercio[] = [
  {
    id: 101, numero: '#2850', clienteNome: 'Maria Santos', status: 'novo',
    items: [
      { nome: 'Arroz Tio João 5kg', quantidade: 2, preco: 24.90 },
      { nome: 'Feijão Carioca 1kg', quantidade: 3, preco: 7.49 },
    ],
    total: 72.27, formaPagamento: 'PIX', criadoEm: '14:52', tempoDecorrido: '2 min'
  },
  {
    id: 102, numero: '#2849', clienteNome: 'João Silva', status: 'novo',
    items: [
      { nome: 'Coca-Cola 2L', quantidade: 4, preco: 9.99 },
      { nome: 'Leite Integral 1L', quantidade: 6, preco: 5.79 },
    ],
    total: 74.70, formaPagamento: 'Cartão Crédito', criadoEm: '14:48', tempoDecorrido: '6 min'
  },
  {
    id: 103, numero: '#2848', clienteNome: 'Ana Costa', status: 'preparando',
    items: [
      { nome: 'Banana Prata (kg)', quantidade: 2, preco: 5.99 },
      { nome: 'Sabão OMO 1.6kg', quantidade: 1, preco: 18.90 },
    ],
    total: 30.88, formaPagamento: 'Débito', criadoEm: '14:30', tempoDecorrido: '24 min'
  },
  {
    id: 104, numero: '#2847', clienteNome: 'Carlos Lima', status: 'saiu_entrega',
    items: [
      { nome: 'Arroz 5kg', quantidade: 1, preco: 24.90 },
      { nome: 'Coca 2L', quantidade: 2, preco: 9.99 },
    ],
    total: 50.87, formaPagamento: 'PIX', criadoEm: '13:55', tempoDecorrido: '59 min'
  },
  {
    id: 105, numero: '#2846', clienteNome: 'Fernanda Rocha', status: 'entregue',
    items: [{ nome: 'Leite 1L', quantidade: 12, preco: 5.79 }],
    total: 75.47, formaPagamento: 'Crédito', criadoEm: '12:10', tempoDecorrido: ''
  },
  {
    id: 106, numero: '#2845', clienteNome: 'Pedro Alves', status: 'entregue',
    items: [{ nome: 'Sabão OMO', quantidade: 3, preco: 18.90 }],
    total: 62.69, formaPagamento: 'Dinheiro', criadoEm: '11:30', tempoDecorrido: ''
  },
];

export const movimentosEstoqueMock: EstoqueMovimento[] = [
  { id: 1, itemNome: 'Arroz Tio João 5kg', tipo: 'entrada', quantidade: 100, motivo: 'NF Fornecedor #4821', data: '28/03 09:00', responsavel: 'João' },
  { id: 2, itemNome: 'Coca-Cola 2L', tipo: 'saida', quantidade: 4, motivo: 'Pedido #2849', data: '28/03 14:48', responsavel: 'Sistema' },
  { id: 3, itemNome: 'Leite Integral 1L', tipo: 'saida', quantidade: 6, motivo: 'Pedido #2849', data: '28/03 14:48', responsavel: 'Sistema' },
  { id: 4, itemNome: 'Feijão Carioca 1kg', tipo: 'ajuste', quantidade: -3, motivo: 'Avaria — embalagem danificada', data: '28/03 08:30', responsavel: 'Maria' },
  { id: 5, itemNome: 'Banana Prata (kg)', tipo: 'entrada', quantidade: 50, motivo: 'Compra fornecedor local', data: '27/03 07:00', responsavel: 'João' },
];

export const alertasMock = [
  { id: 1, tipo: 'estoque', icon: '📦', msg: 'Feijão Carioca 1kg — estoque em 12 un (mín: 20)', tempo: '2h atrás' },
  { id: 2, tipo: 'estoque', icon: '📦', msg: 'Leite Integral 1L — estoque em 8 un (mín: 15)', tempo: '3h atrás' },
  { id: 3, tipo: 'pedido', icon: '🔔', msg: '2 pedidos novos aguardando confirmação', tempo: 'agora' },
  { id: 4, tipo: 'validade', icon: '⚠️', msg: 'Iogurte Natural — vence em 3 dias (Lote A42)', tempo: '5h atrás' },
  { id: 5, tipo: 'estoque', icon: '📦', msg: 'Sabão OMO 1.6kg — estoque em 5 un (mín: 10)', tempo: '6h atrás' },
];
