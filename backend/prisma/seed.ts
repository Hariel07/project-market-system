import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ============================================================
  // 0. Configuração da Plataforma (singleton)
  // ============================================================
  const platformConfig = await prisma.platformConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      assinaturaObrigatoria: false, // Começa desligado
    },
  });
  console.log(`⚙️  Config da plataforma: assinaturaObrigatoria = ${platformConfig.assinaturaObrigatoria}`);

  // ============================================================
  // 0.1 Planos de Assinatura Padrão
  // ============================================================
  const planosData = [
    {
      nome: 'Grátis',
      slug: 'gratis',
      preco: 0,
      descricao: 'Ideal para quem está começando. Sem custos mensais.',
      features: ['Até 50 itens no catálogo', '1 PDV', 'Cardápio Digital', 'Suporte por e-mail'],
      maxItens: 50,
      maxPdvs: 1,
      destaque: false,
      ordem: 0,
    },
    {
      nome: 'Pro',
      slug: 'pro',
      preco: 99.90,
      descricao: 'Para negócios em crescimento. Mais recursos e liberdade.',
      features: ['Itens ilimitados', '3 PDVs', 'Gestão de Estoque', 'Relatórios avançados', 'Suporte prioritário'],
      maxItens: null,
      maxPdvs: 3,
      destaque: true,
      ordem: 1,
    },
    {
      nome: 'Enterprise',
      slug: 'enterprise',
      preco: 299.90,
      descricao: 'Para grandes operações. Tudo ilimitado + integrações.',
      features: ['Tudo do Pro', 'Multi-lojas', 'Acesso à API', 'Emissão Fiscal NF-e', 'Gerente de conta dedicado'],
      maxItens: null,
      maxPdvs: null,
      destaque: false,
      ordem: 2,
    },
  ];

  const planos: Record<string, string> = {};

  for (const planoData of planosData) {
    const plano = await prisma.subscriptionPlan.upsert({
      where: { slug: planoData.slug },
      update: {
        preco: planoData.preco,
        descricao: planoData.descricao,
        features: planoData.features,
        maxItens: planoData.maxItens,
        maxPdvs: planoData.maxPdvs,
        destaque: planoData.destaque,
        ordem: planoData.ordem,
      },
      create: planoData,
    });
    planos[planoData.slug] = plano.id;
    console.log(`   💳 Plano "${plano.nome}" — R$ ${plano.preco.toFixed(2)}/mês (ID: ${plano.id})`);
  }

  // ============================================================
  // 1. Criação das Contas (Accounts)
  // ============================================================
  const senhaHash = await bcrypt.hash('123456', 10);

  // Conta Mestre (Múltiplos Perfis)
  const masterAccount = await prisma.account.upsert({
    where: { cpf: '11111111111' },
    update: {},
    create: {
      cpf: '11111111111',
      email: 'master@teste.com',
      senha: senhaHash,
      telefone: '(11) 99999-1111',
      ativo: true
    }
  });

  // Conta Solitária (Apenas 1 Perfil - Cliente)
  const soloAccount = await prisma.account.upsert({
    where: { cpf: '22222222222' },
    update: {},
    create: {
      cpf: '22222222222',
      email: 'solo@teste.com',
      senha: senhaHash,
      telefone: '(11) 98888-2222',
      ativo: true
    }
  });

  console.log(`\n✅ Contas base (Accounts) criadas: Master (${masterAccount.cpf}) e Solo (${soloAccount.cpf})`);

  // ============================================================
  // 2. Perfis da Conta Solo (Testar redirecionamento automático)
  // ============================================================
  const clienteSolo = await prisma.user.findFirst({ where: { accountId: soloAccount.id, role: Role.CLIENTE } });
  if (!clienteSolo) {
    await prisma.user.create({
      data: {
        accountId: soloAccount.id,
        nome: 'Maria Silva (Solo)',
        role: Role.CLIENTE,
        ativo: true
      }
    });
  }

  // ============================================================
  // 3. Perfis da Conta Master (Testar tela "Select Profile")
  // ============================================================
  
  // 3.1. Perfil Cliente (Master)
  const clienteMaster = await prisma.user.findFirst({ where: { accountId: masterAccount.id, role: Role.CLIENTE } });
  if (!clienteMaster) {
    await prisma.user.create({
      data: {
        accountId: masterAccount.id,
        nome: 'João (Cliente)',
        role: Role.CLIENTE,
        ativo: true
      }
    });
  }

  // 3.2. Perfil Entregador (Master)
  const entregadorMaster = await prisma.user.findFirst({ where: { accountId: masterAccount.id, role: Role.ENTREGADOR } });
  if (!entregadorMaster) {
    await prisma.user.create({
      data: {
        accountId: masterAccount.id,
        nome: 'João (Entregador Velocista)',
        role: Role.ENTREGADOR,
        ativo: true
      }
    });
  }

  // 3.3. Perfil Admin (Master)
  const adminMaster = await prisma.user.findFirst({ where: { accountId: masterAccount.id, role: Role.ADMIN } });
  if (!adminMaster) {
    await prisma.user.create({
      data: {
        accountId: masterAccount.id,
        nome: 'João (Deus do Sistema)',
        role: Role.ADMIN,
        ativo: true
      }
    });
  }

  // ============================================================
  // 4. Comércios da Conta Master (João é dono de várias empresas)
  // ============================================================
  
  // Loja 1: Mercado Bom Preço
  const comercio1 = await prisma.commerce.upsert({
    where: { cnpj: '12345678000199' },
    update: {},
    create: {
      razaoSocial: 'Mercado Bom Preço LTDA',
      nomeFantasia: 'Mercado Bom Preço',
      cnpj: '12345678000199',
      segmento: 'Mercado',
      ativo: true,
      planoAtual: 'PREMIUM',
      planoId: planos['pro'],
      taxaEntrega: 5.99,
      tempoMedio: '25-35 min',
      usuarios: {
        create: {
          accountId: masterAccount.id,
          nome: 'João (Dono Mercado)',
          role: Role.DONO,
          ativo: true,
        },
      },
    },
    include: { usuarios: true },
  });

  // Loja 2: Lanchonete do João
  const comercio2 = await prisma.commerce.upsert({
    where: { cnpj: '88888888000188' },
    update: {},
    create: {
      razaoSocial: 'Lanches Rapidos LTDA',
      nomeFantasia: 'Burgão do João',
      cnpj: '88888888000188',
      segmento: 'Restaurante',
      ativo: true,
      planoAtual: 'GRATIS',
      planoId: planos['gratis'],
      taxaEntrega: 2.50,
      tempoMedio: '15-20 min',
      usuarios: {
        create: {
          accountId: masterAccount.id,
          nome: 'João (Dono Burgão)',
          role: Role.DONO,
          ativo: true,
        },
      },
    },
    include: { usuarios: true },
  });

  console.log(`\n✅ Perfis Master injetados com sucesso. O Mestre agora é dono de ${comercio1.nomeFantasia} e ${comercio2.nomeFantasia}.`);

  // ============================================================
  // 5. Categorias e Produtos (Apenas Mercado Bom Preço para Mock)
  // ============================================================
  const categoriasData = [
    { nome: 'Alimentos', icone: '🍚' },
    { nome: 'Bebidas', icone: '🥤' },
    { nome: 'Laticínios', icone: '🥛' },
    { nome: 'Limpeza', icone: '🧹' },
    { nome: 'Hortifruti', icone: '🍌' },
  ];

  const categorias: Record<string, string> = {};

  for (const cat of categoriasData) {
    const existing = await prisma.category.findFirst({
      where: { nome: cat.nome, comercioId: comercio1.id },
    });
    if (existing) {
      categorias[cat.nome] = existing.id;
    } else {
      const created = await prisma.category.create({
        data: { ...cat, comercioId: comercio1.id },
      });
      categorias[cat.nome] = created.id;
    }
  }

  const produtosData = [
    { nome: 'Arroz Tio João 5kg', descricao: 'Arroz branco tipo 1, grão longo e fino.', precoVenda: 24.90, unidade: 'UN', estoque: 50, categoriaId: categorias['Alimentos'] },
    { nome: 'Feijão Carioca Kicaldo 1kg', descricao: 'Feijão carioca selecionado, cozimento rápido.', precoVenda: 7.49, precoPromocional: 5.99, unidade: 'UN', estoque: 80, categoriaId: categorias['Alimentos'] },
    { nome: 'Coca-Cola 2L', descricao: 'Refrigerante Coca-Cola sabor original.', precoVenda: 9.99, unidade: 'UN', estoque: 120, categoriaId: categorias['Bebidas'] },
    { nome: 'Leite Integral Parmalat 1L', descricao: 'Leite UHT integral, embalagem Tetra Pak.', precoVenda: 5.79, precoPromocional: 4.99, unidade: 'UN', estoque: 60, categoriaId: categorias['Laticínios'] },
    { nome: 'Sabão em Pó OMO 1.6kg', descricao: 'Sabão em pó multiação.', precoVenda: 18.90, unidade: 'UN', estoque: 35, categoriaId: categorias['Limpeza'] },
  ];

  for (const prod of produtosData) {
    const existing = await prisma.product.findFirst({ where: { nome: prod.nome, comercioId: comercio1.id } });
    if (!existing) {
      await prisma.product.create({ data: { ...prod, comercioId: comercio1.id } });
    }
  }

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Contas de Teste (NOVO FORMATO SSO):');
  console.log('\n   🌟 CONTA MÚLTIPLOS PERFIS (Master)');
  console.log('      CPF:   111.111.111-11');
  console.log('      Senha: 123456');
  console.log('      ↳ Possui Cliente, Entregador, Admin, e 2 Lojas');
  console.log('\n   🙎‍♀️ CONTA PERFIL ÚNICO (Solo Cliente)');
  console.log('      CPF:   222.222.222-22');
  console.log('      Senha: 123456');
  console.log('\n💳 Planos de assinatura: Grátis | Pro | Enterprise');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
