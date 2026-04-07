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

  for (const planoData of planosData) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: planoData.slug },
      update: { preco: planoData.preco, features: planoData.features, maxItens: planoData.maxItens, maxPdvs: planoData.maxPdvs },
      create: planoData,
    });
    console.log(`   💳 Plano "${planoData.nome}" — R$ ${planoData.preco.toFixed(2)}/mês`);
  }

  console.log('\n✅ Seed básico concluído!');
  console.log('💡 O sistema está pronto para o primeiro acesso (Setup Mode).');
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
