import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Marcando Lojas Sementes Cópia (Mocks) para diferenciação...');

  // Adicionando um prefixo explícito para o Lojista não confundir a loja dele com a loja Falsa/Mockada
  await prisma.commerce.updateMany({
    where: { cnpj: '11111111000111' },
    data: { nomeFantasia: 'Mercado Falso (Teste)' }
  });

  await prisma.commerce.updateMany({
    where: { cnpj: '22222222000122' },
    data: { nomeFantasia: 'Burguer Falso (Teste)' }
  });

  const comercios = await prisma.commerce.findMany({
    select: { id: true, nomeFantasia: true, isOpen: true }
  });

  console.log('Lojas Atuais no Banco:');
  console.table(comercios);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
