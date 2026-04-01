import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const comercios = await prisma.commerce.findMany({
    select: {
      id: true,
      nomeFantasia: true,
      razaoSocial: true,
      ativo: true,
      isOpen: true,
    }
  });

  console.log("Comércios cadastrados no banco de dados:");
  console.log(JSON.stringify(comercios, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
