// ============================================================
// Dados Mockados — Telas do Entregador
// ============================================================

export interface OportunidadeEntrega {
  id: number;
  restaurante: string;
  enderecoColeta: string;
  distanciaColeta: number; // em km
  enderecoEntrega: string;
  distanciaEntrega: number; // em km
  valor: number;
  tempoEstimado: number; // em min
  expiraEm: number; // segundos para sumir a oferta
  latColeta?: number;
  lngColeta?: number;
  latEntrega?: number;
  lngEntrega?: number;
}

export interface HistoricoCorrida {
  id: number;
  data: string;
  restaurante: string;
  valorDaCorrida: number;
  caixinha: number;
  distanciaTotal: number;
  status: 'concluida' | 'cancelada';
}

export const entregadorStatsMock = {
  ganhosHoje: 142.50,
  corridasHoje: 8,
  taxaAceitacao: 92, // %
  avaliacao: 4.9,
  saldoSemana: 854.20,
};

export const oportunidadesMock: OportunidadeEntrega[] = [
  {
    id: 401,
    restaurante: 'Burguer House',
    enderecoColeta: 'Av. Paulista, 1000 - Bela Vista',
    distanciaColeta: 1.2,
    enderecoEntrega: 'Rua Augusta, 400 - Consolação',
    distanciaEntrega: 3.5,
    valor: 12.50,
    tempoEstimado: 25,
    expiraEm: 45,
    latColeta: -23.5617,
    lngColeta: -46.6560,
    latEntrega: -23.5533,
    lngEntrega: -46.6573,
  },
  {
    id: 402,
    restaurante: 'Mercado Bom Preço',
    enderecoColeta: 'Rua Vergueiro, 200 - Paraíso',
    distanciaColeta: 0.5,
    enderecoEntrega: 'Av. 23 de Maio, 1000 - Vila Mariana',
    distanciaEntrega: 5.2,
    valor: 18.00,
    tempoEstimado: 35,
    expiraEm: 12,
    latColeta: -23.5708,
    lngColeta: -46.6433,
    latEntrega: -23.5855,
    lngEntrega: -46.6417,
  },
  {
    id: 403,
    restaurante: 'Farmácia Saúde+',
    enderecoColeta: 'Av. Brigadeiro Faria Lima, 2000',
    distanciaColeta: 3.0,
    enderecoEntrega: 'Rua Amauri, 50 - Itaim Bibi',
    distanciaEntrega: 1.5,
    valor: 8.50,
    tempoEstimado: 15,
    expiraEm: 5,
    latColeta: -23.5816,
    lngColeta: -46.6833,
    latEntrega: -23.5858,
    lngEntrega: -46.6800,
  }
];

export const historicoMock: HistoricoCorrida[] = [
  { id: 301, data: 'Hoje, 14:30', restaurante: 'Burguer House', valorDaCorrida: 15.00, caixinha: 5.00, distanciaTotal: 5.2, status: 'concluida' },
  { id: 302, data: 'Hoje, 13:15', restaurante: 'Padaria Pão Quente', valorDaCorrida: 8.50, caixinha: 0, distanciaTotal: 2.1, status: 'concluida' },
  { id: 303, data: 'Hoje, 12:00', restaurante: 'Restaurante Sabor', valorDaCorrida: 12.00, caixinha: 2.00, distanciaTotal: 4.5, status: 'concluida' },
  { id: 304, data: 'Ontem, 20:45', restaurante: 'Pizzaria Napolitana', valorDaCorrida: 22.50, caixinha: 10.00, distanciaTotal: 8.0, status: 'concluida' },
  { id: 305, data: 'Ontem, 19:30', restaurante: 'Sushi Express', valorDaCorrida: 18.00, caixinha: 0, distanciaTotal: 6.2, status: 'concluida' },
  { id: 306, data: 'Ontem, 19:00', restaurante: 'Mercado Bom Preço', valorDaCorrida: 0, caixinha: 0, distanciaTotal: 0, status: 'cancelada' },
];
