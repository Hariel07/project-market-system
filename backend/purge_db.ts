import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Iniciando limpeza Robusta do banco de dados...');

  // Lista de modelos a serem limpos na ordem de dependência reversa
  const models = [
    'movimentoCaixa', 'aberturaCaixa', 'rating', 'chatMessage', 'chat',
    'notification', 'deliveryGPS', 'delivery', 'orderItem', 'order',
    'product', 'category', 'address', 'user', 'commerce', 'account'
  ];

  for (const model of models) {
    try {
      // @ts-ignore - Dinâmico para ignorar erros de tipos se a tabela não existir
      if (prisma[model]) {
        console.log(` - Limpando tabela ${model}...`);
        // @ts-ignore
        await prisma[model].deleteMany();
      }
    } catch (e: any) {
      if (e.code === 'P2021') {
        console.warn(` ⚠️ Tabela ${model} não existe no banco. Pulando...`);
      } else {
        console.error(` ❌ Erro ao limpar ${model}:`, e.message);
      }
    }
  }

  try {
    await prisma.platformConfig.upsert({
      where: { id: 'singleton' },
      update: { nomeApp: 'Market System', logoUrl: null },
      create: { id: 'singleton', nomeApp: 'Market System', logoUrl: null },
    });
    console.log('\n✨ Configuração global resetada!');
  } catch (e) {}

  console.log('\n✅ PROCESSO DE LIMPEZA CONCLUÍDO!');
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
