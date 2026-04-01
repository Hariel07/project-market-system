import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cpfAlvo = '11111111111';
  
  // Acha a conta pelo CPF
  const account = await prisma.account.findUnique({
    where: { cpf: cpfAlvo }
  });

  if (!account) {
    console.log(`Conta com CPF ${cpfAlvo} não encontrada.`);
    return;
  }

  // Acha o Burgão do João (O MOCK)
  const burgao = await prisma.commerce.findUnique({
    where: { cnpj: '22222222000122' }
  });

  if (!burgao) {
    console.log('Comércio Burgão do João não encontrado no banco!');
    return;
  }

  // Atualiza os usuários atrelados a essa conta
  const users = await prisma.user.updateMany({
    where: { accountId: account.id },
    data: { comercioId: burgao.id }
  });

  console.log(`Sucesso: ${users.count} usuários da conta ${cpfAlvo} foram ligados ao comércio "${burgao.nomeFantasia}"!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
