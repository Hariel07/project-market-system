/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ============================================================
  // 0. Configuração da Plataforma
  // ============================================================
  await prisma.platformConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', assinaturaObrigatoria: false, nomeApp: 'Market System' },
  });
  console.log('⚙️  Config da plataforma criada');

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

  for (const p of planosData) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: p.slug },
      update: { preco: p.preco, features: p.features },
      create: p,
    });
  }
  console.log('💳 Planos de assinatura criados');

  const senha = await bcrypt.hash('senha123', 10);

  // ============================================================
  // 1. Admin
  // ============================================================
  const adminAccount = await prisma.account.upsert({
    where: { cpf: '00000000000' },
    update: {},
    create: {
      cpf: '00000000000',
      email: 'admin@marketsystem.com',
      senha,
      nomeCompleto: 'Administrador',
      telefone: '(11) 99000-0000',
      ativo: true,
    },
  });

  await prisma.user.upsert({
    where: { id: 'seed-admin-user' },
    update: {},
    create: {
      id: 'seed-admin-user',
      accountId: adminAccount.id,
      role: 'ADMIN',
      nome: 'Administrador',
      ativo: true,
    },
  });
  console.log('👑 Admin criado — CPF: 000.000.000-00 / senha: senha123');

  // ============================================================
  // 2. Comércio + Dono
  // ============================================================
  const planoGratis = await prisma.subscriptionPlan.findUnique({ where: { slug: 'gratis' } });

  const comercio = await prisma.commerce.upsert({
    where: { cnpj: '12345678000100' },
    update: {},
    create: {
      id: 'seed-comercio-1',
      razaoSocial: 'Mercado Teste LTDA',
      nomeFantasia: 'Mercado Teste',
      cnpj: '12345678000100',
      segmento: 'Mercado',
      ativo: true,
      isOpen: false,
      taxaEntrega: 5.00,
      tempoMedio: '30-45 min',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5617,
      lng: -46.6560,
      planoAtual: 'GRATIS',
      planoId: planoGratis?.id,
    },
  });

  const donoAccount = await prisma.account.upsert({
    where: { cpf: '11111111111' },
    update: {},
    create: {
      cpf: '11111111111',
      email: 'dono@marketsystem.com',
      senha,
      nomeCompleto: 'João Dono',
      telefone: '(11) 91111-1111',
      ativo: true,
    },
  });

  await prisma.user.upsert({
    where: { id: 'seed-dono-user' },
    update: {},
    create: {
      id: 'seed-dono-user',
      accountId: donoAccount.id,
      role: 'DONO',
      nome: 'João Dono',
      ativo: true,
      comercioId: comercio.id,
    },
  });
  console.log('🏪 Comerciante (DONO) criado — CPF: 111.111.111-11 / senha: senha123');

  // ============================================================
  // 2.1 Categorias do comércio
  // ============================================================
  const categorias = [
    { id: 'seed-cat-alimentos', nome: 'Alimentos', icone: '🍚', ordem: 1 },
    { id: 'seed-cat-bebidas', nome: 'Bebidas', icone: '🥤', ordem: 2 },
    { id: 'seed-cat-laticinios', nome: 'Laticínios', icone: '🥛', ordem: 3 },
    { id: 'seed-cat-higiene', nome: 'Higiene', icone: '🧼', ordem: 4 },
    { id: 'seed-cat-hortifruti', nome: 'Hortifruti', icone: '🥦', ordem: 5 },
  ];

  for (const cat of categorias) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: { ...cat, comercioId: comercio.id, ativo: true },
    });
  }
  console.log('🗂️  Categorias criadas');

  // ============================================================
  // 2.2 Produtos
  // ============================================================
  const produtos = [
    {
      id: 'seed-prod-1', nome: 'Arroz Branco 5kg', descricao: 'Arroz tipo 1, longo e soltinho.',
      precoVenda: 22.90, unidade: 'PCT', estoque: 50, estoqueMinimo: 10,
      categoriaId: 'seed-cat-alimentos',
    },
    {
      id: 'seed-prod-2', nome: 'Feijão Carioca 1kg', descricao: 'Feijão selecionado, grãos de tamanho uniforme.',
      precoVenda: 8.50, unidade: 'PCT', estoque: 40, estoqueMinimo: 8,
      categoriaId: 'seed-cat-alimentos',
    },
    {
      id: 'seed-prod-3', nome: 'Macarrão Espaguete 500g', descricao: 'Macarrão de sêmola de trigo.',
      precoVenda: 4.90, unidade: 'PCT', estoque: 60, estoqueMinimo: 15,
      categoriaId: 'seed-cat-alimentos',
    },
    {
      id: 'seed-prod-4', nome: 'Refrigerante Cola 2L', descricao: 'Refrigerante gelado 2 litros.',
      precoVenda: 9.90, precoPromocional: 7.90, unidade: 'UN', estoque: 30, estoqueMinimo: 5,
      categoriaId: 'seed-cat-bebidas',
    },
    {
      id: 'seed-prod-5', nome: 'Água Mineral 500ml', descricao: 'Água mineral sem gás.',
      precoVenda: 2.50, unidade: 'UN', estoque: 100, estoqueMinimo: 20,
      categoriaId: 'seed-cat-bebidas',
    },
    {
      id: 'seed-prod-6', nome: 'Leite Integral 1L', descricao: 'Leite UHT integral.',
      precoVenda: 5.90, unidade: 'UN', estoque: 45, estoqueMinimo: 10,
      categoriaId: 'seed-cat-laticinios',
    },
    {
      id: 'seed-prod-7', nome: 'Queijo Mussarela 200g', descricao: 'Queijo mussarela fatiado.',
      precoVenda: 12.90, unidade: 'PCT', estoque: 20, estoqueMinimo: 5,
      categoriaId: 'seed-cat-laticinios',
    },
    {
      id: 'seed-prod-8', nome: 'Sabonete Glicerina', descricao: 'Sabonete com glicerina, hidratante.',
      precoVenda: 3.50, unidade: 'UN', estoque: 35, estoqueMinimo: 10,
      categoriaId: 'seed-cat-higiene',
    },
    {
      id: 'seed-prod-9', nome: 'Banana Prata (kg)', descricao: 'Banana prata fresca, selecionada.',
      precoVenda: 4.90, unidade: 'KG', estoque: 25, estoqueMinimo: 5,
      categoriaId: 'seed-cat-hortifruti',
    },
    {
      id: 'seed-prod-10', nome: 'Tomate Italiano (kg)', descricao: 'Tomate italiano maduro.',
      precoVenda: 6.90, unidade: 'KG', estoque: 15, estoqueMinimo: 5,
      categoriaId: 'seed-cat-hortifruti',
    },
  ];

  for (const prod of produtos) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: { ...prod, comercioId: comercio.id, ativo: true },
    });
  }
  console.log('📦 Produtos criados (10 produtos)');

  // ============================================================
  // 3. Cliente
  // ============================================================
  const clienteAccount = await prisma.account.upsert({
    where: { cpf: '22222222222' },
    update: {},
    create: {
      cpf: '22222222222',
      email: 'cliente@marketsystem.com',
      senha,
      nomeCompleto: 'Maria Cliente',
      telefone: '(11) 92222-2222',
      ativo: true,
    },
  });

  await prisma.user.upsert({
    where: { id: 'seed-cliente-user' },
    update: {},
    create: {
      id: 'seed-cliente-user',
      accountId: clienteAccount.id,
      role: 'CLIENTE',
      nome: 'Maria Cliente',
      ativo: true,
    },
  });
  console.log('🛒 Cliente criado — CPF: 222.222.222-22 / senha: senha123');

  // ============================================================
  // 4. Entregador
  // ============================================================
  const entregadorAccount = await prisma.account.upsert({
    where: { cpf: '33333333333' },
    update: {},
    create: {
      cpf: '33333333333',
      email: 'entregador@marketsystem.com',
      senha,
      nomeCompleto: 'Carlos Entregador',
      telefone: '(11) 93333-3333',
      ativo: true,
    },
  });

  await prisma.user.upsert({
    where: { id: 'seed-entregador-user' },
    update: {},
    create: {
      id: 'seed-entregador-user',
      accountId: entregadorAccount.id,
      role: 'ENTREGADOR',
      nome: 'Carlos Entregador',
      ativo: true,
    },
  });
  console.log('🛵 Entregador criado — CPF: 333.333.333-33 / senha: senha123');

  console.log('\n✅ Seed concluído!');
  console.log('\n📋 Credenciais de teste (senha: senha123):');
  console.log('   👑 Admin     — CPF: 000.000.000-00');
  console.log('   🏪 Dono      — CPF: 111.111.111-11');
  console.log('   🛒 Cliente   — CPF: 222.222.222-22');
  console.log('   🛵 Entregador — CPF: 333.333.333-33');
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
