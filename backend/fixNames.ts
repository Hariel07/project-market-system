import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.commerce.updateMany({
    where: { cnpj: '11111111000111' },
    data: { nomeFantasia: 'Mercado Bom Preço' }
  });

  await prisma.commerce.updateMany({
    where: { cnpj: '22222222000122' },
    data: { nomeFantasia: 'Burgão do João' }
  });

  console.log('Nomes originais restaurados!');
}

main().finally(() => prisma.$disconnect());
