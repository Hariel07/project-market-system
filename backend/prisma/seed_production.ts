import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Setup de Produção...');

  // 1. Configuração Base da Plataforma
  await prisma.platformConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { 
      id: 'singleton', 
      nomeApp: 'Market System',
      assinaturaObrigatoria: false 
    },
  });
  console.log('✅ Configuração da plataforma inicializada.');

  // 2. Planos de Assinatura Reais
  const planosData = [
    {
      nome: 'Plano Grátis', slug: 'gratis', preco: 0,
      descricao: 'Ideal para pequenos comércios começarem.',
      features: ['Até 50 itens', '1 PDV', 'Cardápio Digital'],
      maxItens: 50, maxPdvs: 1, destaque: false, ordem: 0,
    },
    {
      nome: 'Plano Pro', slug: 'pro', preco: 99.90,
      descricao: 'Para negócios em expansão.',
      features: ['Itens ilimitados', '3 PDVs', 'Gestão de Estoque', 'Suporte Prioritário'],
      maxItens: null, maxPdvs: 3, destaque: true, ordem: 1,
    },
    {
      nome: 'Plano Enterprise', slug: 'enterprise', preco: 299.90,
      descricao: 'Foco em grandes operações e redes.',
      features: ['Tudo ilimitado', 'Multi-lojas', 'Emissão de NF-e'],
      maxItens: null, maxPdvs: null, destaque: false, ordem: 2,
    },
  ];

  for (const p of planosData) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: p.slug },
      update: { preco: p.preco, features: p.features, descricao: p.descricao },
      create: p,
    });
  }
  console.log('✅ Planos de assinatura configurados.');

  console.log('\n✨ Sistema pronto para o primeiro acesso!');
  console.log('👉 Acesse a tela de cadastro para criar sua conta de OWNER.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
