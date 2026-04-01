// Tipos para o sistema de entregas

export interface Entrega {
  id: string;
  pedidoId: string;
  entregadorId?: string;
  status: 'AGUARDANDO_COLETA' | 'A_CAMINHO_COLETA' | 'A_CAMINHO_ENTREGA' | 'ENTREGUE';
  taxaRepasse?: number;
  coletadoEm?: string;
  entregueEm?: string;
  pedido: {
    id: string;
    valorTotal: number;
    status: string;
    enderecoEntrega?: string;
    cliente: {
      id: string;
      nome: string;
      account: {
        telefone?: string;
        email: string;
      };
    };
    comercio: {
      id: string;
      nomeFantasia: string;
      logoUrl?: string;
    };
    itens: Array<{
      id: string;
      quantidade: number;
      precoUnitario: number;
      produto: {
        nome: string;
        imagemUrl?: string;
      };
    }>;
  };
  entregador?: {
    id: string;
    nome: string;
    account: {
      telefone?: string;
    };
  };
}

export interface OportunidadeEntrega {
  id: number | string;
  restaurante: string;
  enderecoColeta: string;
  distanciaColeta: number;
  enderecoEntrega: string;
  distanciaEntrega: number;
  valor: number;
  tempoEstimado: number;
  expiraEm: number;
  latColeta?: number;
  lngColeta?: number;
  latEntrega?: number;
  lngEntrega?: number;
  pedidoId?: string;
}

export interface LocalizacaoGPS {
  latitude: number;
  longitude: number;
  velocidade?: number;
  precisao?: number;
  timestamp: Date;
}
