// ============================================================
// Dados Mockados — Telas do Cliente
// Simula a API do backend até a integração real
// ============================================================

export interface Comercio {
  id: number;
  nome: string;
  tipo: string;
  segmento: string;
  logo: string;
  avaliacao: number;
  distancia: string;
  tempoEntrega: string;
  taxaEntrega: number;
  aberto: boolean;
  categorias: string[];
}

export interface Categoria {
  id: number;
  nome: string;
  emoji: string;
}

export interface Item {
  id: number | string;
  comercioId: number | string;
  nome: string;
  descricao: string;
  tipo: 'simples' | 'composto' | 'servico' | 'combo';
  categoriaId: number | string;
  categoriaNome: string;
  preco: number;
  precoOriginal?: number;
  imagem: string;
  unidadeMedida: string;
  avaliacao: number;
  avaliacoes: number;
  emPromocao: boolean;
  promocaoNome?: string;
  estoque: number;
}

export interface ItemCarrinho {
  item: Item;
  quantidade: number;
  observacao?: string;
}

export interface Pedido {
  id: number;
  numero: string;
  comercioNome: string;
  comercioLogo: string;
  status: 'novo' | 'confirmado' | 'preparando' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado';
  items: { nome: string; quantidade: number; preco: number }[];
  subtotal: number;
  taxaEntrega: number;
  total: number;
  formaPagamento: string;
  enderecoEntrega: string;
  criadoEm: string;
  estimativaEntrega: string;
  entregador?: {
    nome: string;
    telefone: string;
    lat: number;
    lng: number;
  };
}

// ---------- Categorias ----------
export const categoriasMock: Categoria[] = [
  { id: 1, nome: 'Mercado', emoji: '🛒' },
  { id: 2, nome: 'Restaurante', emoji: '🍔' },
  { id: 3, nome: 'Farmácia', emoji: '💊' },
  { id: 4, nome: 'Padaria', emoji: '🥖' },
  { id: 5, nome: 'Bebidas', emoji: '🍺' },
  { id: 6, nome: 'Hortifruti', emoji: '🥬' },
  { id: 7, nome: 'Pet Shop', emoji: '🐾' },
  { id: 8, nome: 'Materiais', emoji: '🔨' },
];

// ---------- Comércios ----------
export const comerciosMock: Comercio[] = [
  {
    id: 1, nome: 'Mercado Bom Preço', tipo: 'mercado', segmento: 'Mercados',
    logo: '🛒', avaliacao: 4.7, distancia: '1.2 km', tempoEntrega: '25-35 min',
    taxaEntrega: 5.99, aberto: true, categorias: ['Alimentos', 'Bebidas', 'Limpeza']
  },
  {
    id: 2, nome: 'Burguer House', tipo: 'restaurante', segmento: 'Restaurantes',
    logo: '🍔', avaliacao: 4.9, distancia: '0.8 km', tempoEntrega: '30-45 min',
    taxaEntrega: 3.99, aberto: true, categorias: ['Lanches', 'Combos', 'Bebidas']
  },
  {
    id: 3, nome: 'Farmácia Saúde+', tipo: 'farmacia', segmento: 'Farmácias',
    logo: '💊', avaliacao: 4.5, distancia: '2.1 km', tempoEntrega: '20-30 min',
    taxaEntrega: 4.99, aberto: true, categorias: ['Medicamentos', 'Higiene', 'Beleza']
  },
  {
    id: 4, nome: 'Padaria Pão Quente', tipo: 'padaria', segmento: 'Padarias',
    logo: '🥖', avaliacao: 4.8, distancia: '0.5 km', tempoEntrega: '15-25 min',
    taxaEntrega: 2.99, aberto: true, categorias: ['Pães', 'Bolos', 'Salgados']
  },
  {
    id: 5, nome: 'Hortifruti Natural', tipo: 'hortifruti', segmento: 'Hortifruti',
    logo: '🥬', avaliacao: 4.6, distancia: '1.8 km', tempoEntrega: '30-40 min',
    taxaEntrega: 6.99, aberto: false, categorias: ['Frutas', 'Verduras', 'Legumes']
  },
  {
    id: 6, nome: 'Distribuidora Geladão', tipo: 'bebidas', segmento: 'Bebidas',
    logo: '🍺', avaliacao: 4.4, distancia: '3.2 km', tempoEntrega: '35-50 min',
    taxaEntrega: 0, aberto: true, categorias: ['Cervejas', 'Refrigerantes', 'Água']
  },
];

// ---------- Itens / Produtos ----------
export const itensMock: Item[] = [
  // Mercado Bom Preço (id: 1)
  {
    id: 1, comercioId: 1, nome: 'Arroz Tio João 5kg', descricao: 'Arroz branco tipo 1, grão longo e fino. Ideal para o dia a dia da família.',
    tipo: 'simples', categoriaId: 1, categoriaNome: 'Alimentos', preco: 24.90,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.8, avaliacoes: 234, emPromocao: false, estoque: 50
  },
  {
    id: 2, comercioId: 1, nome: 'Feijão Carioca Kicaldo 1kg', descricao: 'Feijão carioca selecionado, cozimento rápido.',
    tipo: 'simples', categoriaId: 1, categoriaNome: 'Alimentos', preco: 7.49, precoOriginal: 9.90,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.6, avaliacoes: 189, emPromocao: true, promocaoNome: 'Quinta Verde', estoque: 80
  },
  {
    id: 3, comercioId: 1, nome: 'Coca-Cola 2L', descricao: 'Refrigerante Coca-Cola sabor original, garrafa PET 2 litros.',
    tipo: 'simples', categoriaId: 1, categoriaNome: 'Bebidas', preco: 9.99,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.9, avaliacoes: 412, emPromocao: false, estoque: 120
  },
  {
    id: 4, comercioId: 1, nome: 'Leite Integral Parmalat 1L', descricao: 'Leite UHT integral, embalagem Tetra Pak.',
    tipo: 'simples', categoriaId: 1, categoriaNome: 'Laticínios', preco: 5.79, precoOriginal: 6.99,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.5, avaliacoes: 156, emPromocao: true, promocaoNome: 'Oferta do Dia', estoque: 60
  },
  {
    id: 5, comercioId: 1, nome: 'Sabão em Pó OMO 1.6kg', descricao: 'Sabão em pó multiação, lavagem perfeita.',
    tipo: 'simples', categoriaId: 1, categoriaNome: 'Limpeza', preco: 18.90,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.7, avaliacoes: 98, emPromocao: false, estoque: 35
  },
  {
    id: 6, comercioId: 1, nome: 'Banana Prata (kg)', descricao: 'Banana prata fresca, selecionada. Preço por quilograma.',
    tipo: 'simples', categoriaId: 1, categoriaNome: 'Hortifruti', preco: 5.99, precoOriginal: 7.99,
    imagem: '', unidadeMedida: 'kg', avaliacao: 4.3, avaliacoes: 67, emPromocao: true, promocaoNome: 'Quinta Verde', estoque: 200
  },

  // Burguer House (id: 2)
  {
    id: 7, comercioId: 2, nome: 'Smash Burger Duplo', descricao: 'Dois blends de 90g smash na chapa, queijo cheddar, cebola caramelizada, pickles e molho especial no pão brioche.',
    tipo: 'composto', categoriaId: 2, categoriaNome: 'Lanches', preco: 32.90,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.9, avaliacoes: 567, emPromocao: false, estoque: 999
  },
  {
    id: 8, comercioId: 2, nome: 'Combo Família', descricao: '2 Smash Burgers Duplos + 2 Batatas Grandes + 2 Refris 500ml. Ideal para compartilhar!',
    tipo: 'combo', categoriaId: 2, categoriaNome: 'Combos', preco: 79.90, precoOriginal: 99.70,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.8, avaliacoes: 234, emPromocao: true, promocaoNome: 'Combo Especial', estoque: 999
  },
  {
    id: 9, comercioId: 2, nome: 'Batata Frita Grande', descricao: 'Batata frita crocante, porção de 300g com sal e temperos.',
    tipo: 'simples', categoriaId: 2, categoriaNome: 'Acompanhamentos', preco: 19.90,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.7, avaliacoes: 345, emPromocao: false, estoque: 999
  },
  {
    id: 10, comercioId: 2, nome: 'Milk Shake Ovomaltine 500ml', descricao: 'Milk shake cremoso com Ovomaltine crocante.',
    tipo: 'simples', categoriaId: 2, categoriaNome: 'Bebidas', preco: 18.90,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.9, avaliacoes: 189, emPromocao: false, estoque: 999
  },

  // Padaria Pão Quente (id: 4)
  {
    id: 11, comercioId: 4, nome: 'Pão Francês (un)', descricao: 'Pão francês fresquinho, assado na hora.',
    tipo: 'composto', categoriaId: 4, categoriaNome: 'Pães', preco: 0.80,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.9, avaliacoes: 890, emPromocao: false, estoque: 500
  },
  {
    id: 12, comercioId: 4, nome: 'Bolo de Chocolate Fatia', descricao: 'Fatia generosa de bolo de chocolate com cobertura cremosa.',
    tipo: 'composto', categoriaId: 4, categoriaNome: 'Bolos', preco: 8.90,
    imagem: '', unidadeMedida: 'un', avaliacao: 4.8, avaliacoes: 234, emPromocao: false, estoque: 30
  },
];

// ---------- Pedidos ----------
export const pedidosMock: Pedido[] = [
  {
    id: 1, numero: '#2847', comercioNome: 'Burguer House', comercioLogo: '🍔',
    status: 'saiu_entrega',
    items: [
      { nome: 'Smash Burger Duplo', quantidade: 2, preco: 32.90 },
      { nome: 'Batata Frita Grande', quantidade: 1, preco: 19.90 },
      { nome: 'Coca-Cola 500ml', quantidade: 2, preco: 7.90 },
    ],
    subtotal: 101.50, taxaEntrega: 3.99, total: 105.49,
    formaPagamento: 'Cartão de Crédito', enderecoEntrega: 'Rua das Flores, 123 - Centro',
    criadoEm: '28/03/2026 14:30', estimativaEntrega: '15:15',
    entregador: { nome: 'Carlos Silva', telefone: '(11) 99999-0001', lat: -23.5505, lng: -46.6333 }
  },
  {
    id: 2, numero: '#2845', comercioNome: 'Mercado Bom Preço', comercioLogo: '🛒',
    status: 'entregue',
    items: [
      { nome: 'Arroz Tio João 5kg', quantidade: 1, preco: 24.90 },
      { nome: 'Feijão Carioca 1kg', quantidade: 2, preco: 7.49 },
      { nome: 'Coca-Cola 2L', quantidade: 1, preco: 9.99 },
    ],
    subtotal: 49.87, taxaEntrega: 5.99, total: 55.86,
    formaPagamento: 'PIX', enderecoEntrega: 'Rua das Flores, 123 - Centro',
    criadoEm: '27/03/2026 10:15', estimativaEntrega: '10:50'
  },
  {
    id: 3, numero: '#2840', comercioNome: 'Padaria Pão Quente', comercioLogo: '🥖',
    status: 'entregue',
    items: [
      { nome: 'Pão Francês', quantidade: 10, preco: 0.80 },
      { nome: 'Bolo de Chocolate Fatia', quantidade: 2, preco: 8.90 },
    ],
    subtotal: 25.80, taxaEntrega: 2.99, total: 28.79,
    formaPagamento: 'Dinheiro', enderecoEntrega: 'Rua das Flores, 123 - Centro',
    criadoEm: '26/03/2026 07:45', estimativaEntrega: '08:10'
  },
];

// ---------- Helpers ----------
export function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getStatusLabel(status: Pedido['status']): string {
  const labels: Record<Pedido['status'], string> = {
    novo: 'Novo',
    confirmado: 'Confirmado',
    preparando: 'Preparando',
    pronto: 'Pronto',
    saiu_entrega: 'Saiu para entrega',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
  };
  return labels[status];
}

export function getStatusColor(status: Pedido['status']): string {
  const colors: Record<Pedido['status'], string> = {
    novo: 'badge-warning',
    confirmado: 'badge-info',
    preparando: 'badge-warning',
    pronto: 'badge-accent',
    saiu_entrega: 'badge-primary',
    entregue: 'badge-accent',
    cancelado: 'badge-danger',
  };
  return colors[status];
}
