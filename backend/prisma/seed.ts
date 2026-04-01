import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ============================================================
  // 0. Configuração da Plataforma
  // ============================================================
  const platformConfig = await prisma.platformConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', assinaturaObrigatoria: false },
  });
  console.log(`⚙️  Config da plataforma: assinaturaObrigatoria = ${platformConfig.assinaturaObrigatoria}`);

  // ============================================================
  // 0.1 Planos de Assinatura
  // ============================================================
  const planosData = [
    {
      nome: 'Grátis', slug: 'gratis', preco: 0,
      descricao: 'Ideal para quem está começando. Sem custos mensais.',
      features: ['Até 50 itens no catálogo', '1 PDV', 'Cardápio Digital', 'Suporte por e-mail'],
      maxItens: 50, maxPdvs: 1, destaque: false, ordem: 0,
    },
    {
      nome: 'Pro', slug: 'pro', preco: 99.90,
      descricao: 'Para negócios em crescimento. Mais recursos e liberdade.',
      features: ['Itens ilimitados', '3 PDVs', 'Gestão de Estoque', 'Relatórios avançados', 'Suporte prioritário'],
      maxItens: null, maxPdvs: 3, destaque: true, ordem: 1,
    },
    {
      nome: 'Enterprise', slug: 'enterprise', preco: 299.90,
      descricao: 'Para grandes operações. Tudo ilimitado + integrações.',
      features: ['Tudo do Pro', 'Multi-lojas', 'Acesso à API', 'Emissão Fiscal NF-e', 'Gerente de conta dedicado'],
      maxItens: null, maxPdvs: null, destaque: false, ordem: 2,
    },
  ];

  const planos: Record<string, string> = {};
  for (const planoData of planosData) {
    const plano = await prisma.subscriptionPlan.upsert({
      where: { slug: planoData.slug },
      update: { preco: planoData.preco, features: planoData.features, maxItens: planoData.maxItens, maxPdvs: planoData.maxPdvs },
      create: planoData,
    });
    planos[planoData.slug] = plano.id;
    console.log(`   💳 Plano "${plano.nome}" — R$ ${plano.preco.toFixed(2)}/mês`);
  }

  // ============================================================
  // 1. Contas (Accounts)
  // ============================================================
  const senhaHash = await bcrypt.hash('123456', 10);

  const masterAccount = await prisma.account.upsert({
    where: { cpf: '11111111111' },
    update: {},
    create: { cpf: '11111111111', email: 'master@teste.com', senha: senhaHash, telefone: '(11) 99999-1111', ativo: true },
  });

  const soloAccount = await prisma.account.upsert({
    where: { cpf: '22222222222' },
    update: {},
    create: { cpf: '22222222222', email: 'maria@teste.com', senha: senhaHash, telefone: '(11) 98888-2222', ativo: true },
  });

  const entregadorAccount = await prisma.account.upsert({
    where: { cpf: '33333333333' },
    update: {},
    create: { cpf: '33333333333', email: 'entregador@teste.com', senha: senhaHash, telefone: '(11) 97777-3333', ativo: true },
  });

  console.log(`\n✅ Contas criadas: Master (${masterAccount.cpf}), Solo (${soloAccount.cpf}), Entregador (${entregadorAccount.cpf})`);

  // ============================================================
  // 2. Usuários (Perfis)
  // ============================================================

  // Conta Solo — apenas Cliente
  const clienteSolo = await prisma.user.findFirst({ where: { accountId: soloAccount.id, role: Role.CLIENTE } });
  const mariaSolo = clienteSolo ?? await prisma.user.create({
    data: { accountId: soloAccount.id, nome: 'Maria Silva', role: Role.CLIENTE, ativo: true },
  });

  // Conta Master — múltiplos perfis
  const clienteMasterExist = await prisma.user.findFirst({ where: { accountId: masterAccount.id, role: Role.CLIENTE } });
  const joaoCliente = clienteMasterExist ?? await prisma.user.create({
    data: { accountId: masterAccount.id, nome: 'João Cliente', role: Role.CLIENTE, ativo: true },
  });

  const entregadorMasterExist = await prisma.user.findFirst({ where: { accountId: masterAccount.id, role: Role.ENTREGADOR } });
  if (!entregadorMasterExist) {
    await prisma.user.create({
      data: { accountId: masterAccount.id, nome: 'João Entregador', role: Role.ENTREGADOR, ativo: true },
    });
  }

  const adminExist = await prisma.user.findFirst({ where: { accountId: masterAccount.id, role: Role.ADMIN } });
  if (!adminExist) {
    await prisma.user.create({
      data: { accountId: masterAccount.id, nome: 'João Admin', role: Role.ADMIN, ativo: true },
    });
  }

  // Entregador Solo
  const entregadorSoloExist = await prisma.user.findFirst({ where: { accountId: entregadorAccount.id, role: Role.ENTREGADOR } });
  if (!entregadorSoloExist) {
    await prisma.user.create({
      data: { accountId: entregadorAccount.id, nome: 'Carlos Entregador', role: Role.ENTREGADOR, ativo: true },
    });
  }

  // Endereços dos clientes
  const endMaria = await prisma.address.findFirst({ where: { userId: mariaSolo.id } });
  if (!endMaria) {
    await prisma.address.create({
      data: {
        userId: mariaSolo.id,
        logradouro: 'Rua das Flores', numero: '123', complemento: 'Apto 42',
        bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01310-100',
        rotulo: 'Casa', icone: '🏠', isPrincipal: true,
        lat: -23.5505, lng: -46.6333,
      },
    });
  }

  const endJoao = await prisma.address.findFirst({ where: { userId: joaoCliente.id } });
  if (!endJoao) {
    await prisma.address.create({
      data: {
        userId: joaoCliente.id,
        logradouro: 'Av. Paulista', numero: '900', complemento: 'Bloco B',
        bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', cep: '01310-200',
        rotulo: 'Casa', icone: '🏠', isPrincipal: true,
        lat: -23.5617, lng: -46.6560,
      },
    });
  }

  console.log('✅ Perfis e endereços de clientes criados');

  // ============================================================
  // 3. Comércios (6 lojas — CNPJs únicos e canonicos)
  // ============================================================

  // Loja 1: Mercado Bom Preço — CNPJ canônico: 11111111000111
  const comercio1 = await prisma.commerce.upsert({
    where: { cnpj: '11111111000111' },
    update: { ativo: true, isOpen: true },
    create: {
      razaoSocial: 'Mercado Bom Preço LTDA', nomeFantasia: 'Mercado Bom Preço',
      cnpj: '11111111000111', segmento: 'Mercados', logoUrl: '🛒',
      ativo: true, planoAtual: 'PRO', planoId: planos['pro'],
      taxaEntrega: 5.99, tempoMedio: '25-35 min',
      isOpen: true, horarioAtendimento: 'Seg. a Sáb. — 07h às 20h',
      usuarios: {
        create: { accountId: masterAccount.id, nome: 'João (Dono Mercado)', role: Role.DONO, ativo: true },
      },
    },
    include: { usuarios: true },
  });

  // Loja 2: Burgão do João — CNPJ canônico: 22222222000122
  const comercio2 = await prisma.commerce.upsert({
    where: { cnpj: '22222222000122' },
    update: { ativo: true, isOpen: true },
    create: {
      razaoSocial: 'Burguer House SA', nomeFantasia: 'Burgão do João',
      cnpj: '22222222000122', segmento: 'Restaurantes', logoUrl: '🍔',
      ativo: true, planoAtual: 'GRATIS', planoId: planos['gratis'],
      taxaEntrega: 3.99, tempoMedio: '30-45 min',
      isOpen: true, horarioAtendimento: 'Ter. a Dom. — 18h às 23h',
      usuarios: {
        create: { accountId: masterAccount.id, nome: 'João (Dono Burgão)', role: Role.DONO, ativo: true },
      },
    },
    include: { usuarios: true },
  });

  // Loja 3: Farmácia Saúde+
  const comercio3 = await prisma.commerce.upsert({
    where: { cnpj: '33333333000133' },
    update: { ativo: true, isOpen: true },
    create: {
      razaoSocial: 'Farmácia Saúde Plus LTDA', nomeFantasia: 'Farmácia Saúde+',
      cnpj: '33333333000133', segmento: 'Farmácias', logoUrl: '💊',
      ativo: true, planoAtual: 'GRATIS', planoId: planos['gratis'],
      taxaEntrega: 4.99, tempoMedio: '20-30 min',
      isOpen: true, horarioAtendimento: '24 Horas',
    },
  });

  // Loja 4: Padaria Pão Quente
  const comercio4 = await prisma.commerce.upsert({
    where: { cnpj: '44444444000144' },
    update: { ativo: true, isOpen: true },
    create: {
      razaoSocial: 'Panificadora Pão Quente LTDA', nomeFantasia: 'Padaria Pão Quente',
      cnpj: '44444444000144', segmento: 'Padarias', logoUrl: '🥖',
      ativo: true, planoAtual: 'GRATIS', planoId: planos['gratis'],
      taxaEntrega: 2.99, tempoMedio: '15-25 min',
      isOpen: true, horarioAtendimento: 'Todos os Dias — 06h às 20h',
    },
  });

  // Loja 5: Hortifruti Natural (fechada para testar overlay)
  const comercio5 = await prisma.commerce.upsert({
    where: { cnpj: '55555555000155' },
    update: { ativo: true, isOpen: false },
    create: {
      razaoSocial: 'Hortifruti Natural SA', nomeFantasia: 'Hortifruti Natural',
      cnpj: '55555555000155', segmento: 'Hortifruti', logoUrl: '🥬',
      ativo: true, planoAtual: 'GRATIS', planoId: planos['gratis'],
      taxaEntrega: 6.99, tempoMedio: '30-40 min',
      isOpen: false, horarioAtendimento: 'Fechado para almoço. Voltamos às 14h!',
    },
  });

  // Loja 6: Distribuidora Geladão
  const comercio6 = await prisma.commerce.upsert({
    where: { cnpj: '66666666000166' },
    update: { ativo: true, isOpen: true },
    create: {
      razaoSocial: 'Bebidas Geladão LTDA', nomeFantasia: 'Distribuidora Geladão',
      cnpj: '66666666000166', segmento: 'Bebidas', logoUrl: '🍺',
      ativo: true, planoAtual: 'GRATIS', planoId: planos['gratis'],
      taxaEntrega: 0, tempoMedio: '35-50 min',
      isOpen: true, horarioAtendimento: '24 Horas',
    },
  });

  // Endereços dos comércios (com coordenadas GPS reais em SP)
  const enderecosComercios = [
    { comercioId: comercio1.id, logradouro: 'Av. Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', cep: '01310-100', lat: -23.5617, lng: -46.6560 },
    { comercioId: comercio2.id, logradouro: 'Rua Vergueiro', numero: '200', bairro: 'Paraíso', cidade: 'São Paulo', estado: 'SP', cep: '04101-000', lat: -23.5708, lng: -46.6433 },
    { comercioId: comercio3.id, logradouro: 'Av. Brigadeiro Faria Lima', numero: '2000', bairro: 'Itaim Bibi', cidade: 'São Paulo', estado: 'SP', cep: '01451-000', lat: -23.5816, lng: -46.6833 },
    { comercioId: comercio4.id, logradouro: 'Rua Augusta', numero: '400', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP', cep: '01305-000', lat: -23.5533, lng: -46.6573 },
    { comercioId: comercio5.id, logradouro: 'Rua Oscar Freire', numero: '900', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP', cep: '01426-001', lat: -23.5614, lng: -46.6739 },
    { comercioId: comercio6.id, logradouro: 'Av. 23 de Maio', numero: '1000', bairro: 'Vila Mariana', cidade: 'São Paulo', estado: 'SP', cep: '04008-001', lat: -23.5855, lng: -46.6417 },
  ];

  for (const end of enderecosComercios) {
    const exists = await prisma.address.findFirst({ where: { comercioId: end.comercioId } });
    if (!exists) {
      await prisma.address.create({ data: { ...end, isPrincipal: true } });
    }
  }

  console.log('✅ 6 comércios e endereços criados');

  // ============================================================
  // 4. Categorias e Produtos — todos os comércios
  // ============================================================

  type ProdutoInput = {
    nome: string; descricao: string; precoVenda: number; precoPromocional?: number;
    unidade?: string; estoque: number; categoriaId: string;
  };

  async function upsertCategoria(nome: string, icone: string, comercioId: string): Promise<string> {
    const existing = await prisma.category.findFirst({ where: { nome, comercioId } });
    if (existing) return existing.id;
    const created = await prisma.category.create({ data: { nome, icone, comercioId } });
    return created.id;
  }

  async function upsertProduto(comercioId: string, prod: ProdutoInput) {
    const existing = await prisma.product.findFirst({ where: { nome: prod.nome, comercioId } });
    if (!existing) {
      await prisma.product.create({ data: { ...prod, comercioId, ativo: true } });
    }
  }

  // — Mercado Bom Preço —
  const catAlimentos = await upsertCategoria('Alimentos', '🍚', comercio1.id);
  const catBebidas1  = await upsertCategoria('Bebidas',   '🥤', comercio1.id);
  const catLaticinios = await upsertCategoria('Laticínios', '🥛', comercio1.id);
  const catLimpeza   = await upsertCategoria('Limpeza',   '🧹', comercio1.id);
  const catHorti1    = await upsertCategoria('Hortifruti','🍌', comercio1.id);

  await upsertProduto(comercio1.id, { nome: 'Arroz Tio João 5kg', descricao: 'Arroz branco tipo 1, grão longo e fino.', precoVenda: 24.90, unidade: 'UN', estoque: 50, categoriaId: catAlimentos });
  await upsertProduto(comercio1.id, { nome: 'Feijão Carioca Kicaldo 1kg', descricao: 'Feijão carioca selecionado, cozimento rápido.', precoVenda: 7.49, precoPromocional: 5.99, unidade: 'UN', estoque: 80, categoriaId: catAlimentos });
  await upsertProduto(comercio1.id, { nome: 'Macarrão Barilla 500g', descricao: 'Espaguete grano duro, textura perfeita.', precoVenda: 6.90, unidade: 'UN', estoque: 60, categoriaId: catAlimentos });
  await upsertProduto(comercio1.id, { nome: 'Coca-Cola 2L', descricao: 'Refrigerante Coca-Cola sabor original.', precoVenda: 9.99, unidade: 'UN', estoque: 120, categoriaId: catBebidas1 });
  await upsertProduto(comercio1.id, { nome: 'Suco Del Valle Laranja 1L', descricao: 'Suco de laranja integral Del Valle.', precoVenda: 8.50, precoPromocional: 6.99, unidade: 'UN', estoque: 40, categoriaId: catBebidas1 });
  await upsertProduto(comercio1.id, { nome: 'Leite Integral Parmalat 1L', descricao: 'Leite UHT integral, embalagem Tetra Pak.', precoVenda: 5.79, precoPromocional: 4.99, unidade: 'UN', estoque: 60, categoriaId: catLaticinios });
  await upsertProduto(comercio1.id, { nome: 'Queijo Mussarela Fatiado 200g', descricao: 'Queijo mussarela fatiado, para lanches e pizzas.', precoVenda: 12.90, unidade: 'UN', estoque: 30, categoriaId: catLaticinios });
  await upsertProduto(comercio1.id, { nome: 'Sabão em Pó OMO 1.6kg', descricao: 'Sabão em pó multiação.', precoVenda: 18.90, unidade: 'UN', estoque: 35, categoriaId: catLimpeza });
  await upsertProduto(comercio1.id, { nome: 'Detergente Ypê 500ml', descricao: 'Detergente líquido concentrado.', precoVenda: 2.99, unidade: 'UN', estoque: 80, categoriaId: catLimpeza });
  await upsertProduto(comercio1.id, { nome: 'Banana Prata (kg)', descricao: 'Banana prata fresca, selecionada.', precoVenda: 5.99, precoPromocional: 4.50, unidade: 'KG', estoque: 200, categoriaId: catHorti1 });
  await upsertProduto(comercio1.id, { nome: 'Tomate Italiano (kg)', descricao: 'Tomate italiano maduro, ideal para molhos.', precoVenda: 8.90, unidade: 'KG', estoque: 50, categoriaId: catHorti1 });

  // — Burgão do João —
  const catLanches  = await upsertCategoria('Lanches',        '🍔', comercio2.id);
  const catCombos   = await upsertCategoria('Combos',         '🍟', comercio2.id);
  const catAcomp    = await upsertCategoria('Acompanhamentos','🧅', comercio2.id);
  const catBebidas2 = await upsertCategoria('Bebidas',        '🥤', comercio2.id);

  await upsertProduto(comercio2.id, { nome: 'Smash Burger Duplo', descricao: 'Dois blends de 90g smash na chapa, queijo cheddar, cebola caramelizada e molho especial.', precoVenda: 32.90, unidade: 'UN', estoque: 999, categoriaId: catLanches });
  await upsertProduto(comercio2.id, { nome: 'Smash Burger Simples', descricao: 'Um blend de 120g, queijo cheddar, alface, tomate e maionese da casa.', precoVenda: 22.90, unidade: 'UN', estoque: 999, categoriaId: catLanches });
  await upsertProduto(comercio2.id, { nome: 'X-Bacon Especial', descricao: 'Hambúrguer artesanal, bacon crocante, cheddar derretido e molho barbecue.', precoVenda: 28.90, unidade: 'UN', estoque: 999, categoriaId: catLanches });
  await upsertProduto(comercio2.id, { nome: 'Combo Família', descricao: '2 Smash Burgers Duplos + 2 Batatas Grandes + 2 Refris 500ml.', precoVenda: 79.90, precoPromocional: 69.90, unidade: 'UN', estoque: 999, categoriaId: catCombos });
  await upsertProduto(comercio2.id, { nome: 'Combo Solo', descricao: '1 Smash Burger + 1 Batata Média + 1 Refri 500ml.', precoVenda: 42.90, precoPromocional: 36.90, unidade: 'UN', estoque: 999, categoriaId: catCombos });
  await upsertProduto(comercio2.id, { nome: 'Batata Frita Grande', descricao: 'Batata frita crocante, porção 300g com sal e temperos.', precoVenda: 19.90, unidade: 'UN', estoque: 999, categoriaId: catAcomp });
  await upsertProduto(comercio2.id, { nome: 'Onion Rings', descricao: 'Anéis de cebola empanados e fritos, crocantes por fora.', precoVenda: 16.90, unidade: 'UN', estoque: 999, categoriaId: catAcomp });
  await upsertProduto(comercio2.id, { nome: 'Milk Shake Ovomaltine 500ml', descricao: 'Milk shake cremoso com Ovomaltine crocante.', precoVenda: 18.90, unidade: 'UN', estoque: 999, categoriaId: catBebidas2 });
  await upsertProduto(comercio2.id, { nome: 'Refrigerante 500ml', descricao: 'Escolha: Coca-Cola, Guaraná ou Sprite.', precoVenda: 7.90, unidade: 'UN', estoque: 999, categoriaId: catBebidas2 });

  // — Farmácia Saúde+ —
  const catMedicamentos = await upsertCategoria('Medicamentos', '💊', comercio3.id);
  const catHigiene      = await upsertCategoria('Higiene',      '🪥', comercio3.id);
  const catBeleza       = await upsertCategoria('Beleza',       '💅', comercio3.id);

  await upsertProduto(comercio3.id, { nome: 'Paracetamol 750mg (20 comp.)', descricao: 'Analgésico e antitérmico, caixa com 20 comprimidos.', precoVenda: 8.90, unidade: 'CX', estoque: 100, categoriaId: catMedicamentos });
  await upsertProduto(comercio3.id, { nome: 'Dipirona 500mg (20 comp.)', descricao: 'Analgésico e antitérmico de referência.', precoVenda: 6.50, unidade: 'CX', estoque: 100, categoriaId: catMedicamentos });
  await upsertProduto(comercio3.id, { nome: 'Vitamina C 1000mg (30 comp.)', descricao: 'Suplemento de Vitamina C efervescente.', precoVenda: 24.90, unidade: 'CX', estoque: 50, categoriaId: catMedicamentos });
  await upsertProduto(comercio3.id, { nome: 'Antisséptico Band-Aid (10 un.)', descricao: 'Curativo adesivo estéril em diferentes tamanhos.', precoVenda: 12.90, unidade: 'CX', estoque: 80, categoriaId: catMedicamentos });
  await upsertProduto(comercio3.id, { nome: 'Shampoo Clear Men 400ml', descricao: 'Shampoo anticaspa, fórmula masculina.', precoVenda: 19.90, unidade: 'UN', estoque: 40, categoriaId: catHigiene });
  await upsertProduto(comercio3.id, { nome: 'Protetor Solar FPS 50 Sundown 120ml', descricao: 'Proteção solar corporal, resistente à água.', precoVenda: 34.90, precoPromocional: 28.90, unidade: 'UN', estoque: 30, categoriaId: catBeleza });

  // — Padaria Pão Quente —
  const catPaes     = await upsertCategoria('Pães',     '🍞', comercio4.id);
  const catBolos    = await upsertCategoria('Bolos',    '🎂', comercio4.id);
  const catSalgados = await upsertCategoria('Salgados', '🥐', comercio4.id);
  const catDoces    = await upsertCategoria('Doces',    '🍮', comercio4.id);

  await upsertProduto(comercio4.id, { nome: 'Pão Francês (un)', descricao: 'Pão francês fresquinho, assado na hora.', precoVenda: 0.80, unidade: 'UN', estoque: 500, categoriaId: catPaes });
  await upsertProduto(comercio4.id, { nome: 'Pão de Forma Integral (500g)', descricao: 'Pão de forma integral, 12 fatias.', precoVenda: 8.90, unidade: 'UN', estoque: 30, categoriaId: catPaes });
  await upsertProduto(comercio4.id, { nome: 'Croissant de Manteiga', descricao: 'Croissant folhado com manteiga premium.', precoVenda: 6.90, unidade: 'UN', estoque: 40, categoriaId: catPaes });
  await upsertProduto(comercio4.id, { nome: 'Bolo de Chocolate (fatia)', descricao: 'Fatia generosa com cobertura cremosa.', precoVenda: 8.90, unidade: 'UN', estoque: 30, categoriaId: catBolos });
  await upsertProduto(comercio4.id, { nome: 'Bolo de Cenoura com Chocolate (fatia)', descricao: 'Clássico bolo de cenoura com calda de chocolate.', precoVenda: 7.90, unidade: 'UN', estoque: 25, categoriaId: catBolos });
  await upsertProduto(comercio4.id, { nome: 'Salgado de Frango (un)', descricao: 'Salgado assado recheado com frango cremoso.', precoVenda: 4.50, unidade: 'UN', estoque: 100, categoriaId: catSalgados });
  await upsertProduto(comercio4.id, { nome: 'Coxinha de Frango (un)', descricao: 'Coxinha crocante recheada com catupiry.', precoVenda: 5.50, unidade: 'UN', estoque: 80, categoriaId: catSalgados });
  await upsertProduto(comercio4.id, { nome: 'Sonho de Creme (un)', descricao: 'Pão doce recheado com creme de baunilha.', precoVenda: 5.90, unidade: 'UN', estoque: 40, categoriaId: catDoces });

  // — Hortifruti Natural —
  const catFrutas   = await upsertCategoria('Frutas',   '🍓', comercio5.id);
  const catVerduras = await upsertCategoria('Verduras', '🥬', comercio5.id);
  const catLegumes  = await upsertCategoria('Legumes',  '🥕', comercio5.id);

  await upsertProduto(comercio5.id, { nome: 'Banana Prata (kg)', descricao: 'Banana prata fresca e madura.', precoVenda: 4.99, unidade: 'KG', estoque: 200, categoriaId: catFrutas });
  await upsertProduto(comercio5.id, { nome: 'Maçã Fuji (kg)', descricao: 'Maçã fuji crocante e adocicada.', precoVenda: 8.99, unidade: 'KG', estoque: 80, categoriaId: catFrutas });
  await upsertProduto(comercio5.id, { nome: 'Uva Itália (kg)', descricao: 'Uva itália sem semente, doce e suculenta.', precoVenda: 14.90, unidade: 'KG', estoque: 30, categoriaId: catFrutas });
  await upsertProduto(comercio5.id, { nome: 'Alface Crespa (maço)', descricao: 'Alface crespa hidropônica, folhas crocantes.', precoVenda: 3.99, unidade: 'UN', estoque: 50, categoriaId: catVerduras });
  await upsertProduto(comercio5.id, { nome: 'Espinafre (maço)', descricao: 'Espinafre fresco, rico em ferro.', precoVenda: 4.50, unidade: 'UN', estoque: 30, categoriaId: catVerduras });
  await upsertProduto(comercio5.id, { nome: 'Cenoura (kg)', descricao: 'Cenoura orgânica, lavada e selecionada.', precoVenda: 5.99, unidade: 'KG', estoque: 60, categoriaId: catLegumes });
  await upsertProduto(comercio5.id, { nome: 'Tomate Salada (kg)', descricao: 'Tomate vermelho firme para saladas.', precoVenda: 7.90, unidade: 'KG', estoque: 70, categoriaId: catLegumes });

  // — Distribuidora Geladão —
  const catCervejas     = await upsertCategoria('Cervejas',      '🍺', comercio6.id);
  const catDestilados   = await upsertCategoria('Destilados',    '🥃', comercio6.id);
  const catRefrigerante = await upsertCategoria('Refrigerantes', '🥤', comercio6.id);
  const catAgua         = await upsertCategoria('Água e Sucos',  '💧', comercio6.id);

  await upsertProduto(comercio6.id, { nome: 'Heineken 350ml (lata)', descricao: 'Cerveja Heineken Premium Puro Malte, lata gelada.', precoVenda: 5.99, unidade: 'UN', estoque: 300, categoriaId: catCervejas });
  await upsertProduto(comercio6.id, { nome: 'Skol 473ml (lata)', descricao: 'Cerveja Skol, lata long neck gelada.', precoVenda: 4.50, unidade: 'UN', estoque: 400, categoriaId: catCervejas });
  await upsertProduto(comercio6.id, { nome: 'Brahma 600ml (garrafa)', descricao: 'Cerveja Brahma, garrafa retornável gelada.', precoVenda: 6.50, unidade: 'UN', estoque: 200, categoriaId: catCervejas });
  await upsertProduto(comercio6.id, { nome: 'Smirnoff Ice 275ml (long neck)', descricao: 'Bebida mista Smirnoff Ice original.', precoVenda: 8.90, unidade: 'UN', estoque: 100, categoriaId: catDestilados });
  await upsertProduto(comercio6.id, { nome: 'Coca-Cola 2L', descricao: 'Refrigerante Coca-Cola sabor original, 2 litros.', precoVenda: 9.99, unidade: 'UN', estoque: 150, categoriaId: catRefrigerante });
  await upsertProduto(comercio6.id, { nome: 'Guaraná Antarctica 2L', descricao: 'Refrigerante Guaraná Antarctica, garrafa PET.', precoVenda: 7.99, unidade: 'UN', estoque: 100, categoriaId: catRefrigerante });
  await upsertProduto(comercio6.id, { nome: 'Água Mineral Crystal 500ml (cx 12)', descricao: 'Caixa com 12 garrafas de água mineral sem gás.', precoVenda: 19.90, unidade: 'CX', estoque: 50, categoriaId: catAgua });
  await upsertProduto(comercio6.id, { nome: 'Energético Monster 473ml', descricao: 'Energético Monster Energy Original.', precoVenda: 11.90, unidade: 'UN', estoque: 80, categoriaId: catAgua });

  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('📋 Contas de Teste:');
  console.log('\n   🌟 CONTA MÚLTIPLOS PERFIS (Master)');
  console.log('      CPF: 111.111.111-11  |  Senha: 123456');
  console.log('      ↳ Cliente, Entregador, Admin, Dono Mercado, Dono Burgão');
  console.log('\n   🙎‍♀️ CONTA CLIENTE (Solo)');
  console.log('      CPF: 222.222.222-22  |  Senha: 123456');
  console.log('\n   🛵 CONTA ENTREGADOR (Solo)');
  console.log('      CPF: 333.333.333-33  |  Senha: 123456');
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
