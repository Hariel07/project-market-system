import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cpf = process.argv[2];

  if (!cpf) {
    console.error('Por favor, informe o CPF do usuário que será promovido a ADMIN.');
    console.log('Uso: npx ts-node promote_admin.ts 12345678901');
    process.exit(1);
  }

  try {
    const account = await prisma.account.findUnique({
      where: { cpf },
      include: { perfis: true }
    });

    if (!account) {
      console.error(`Conta com CPF ${cpf} não encontrada.`);
      process.exit(1);
    }

    // Verifica se já tem perfil de ADMIN
    const adminProfile = account.perfis.find(p => p.role === Role.ADMIN);

    if (adminProfile) {
      console.log(`O usuário ${account.email} já é um ADMIN.`);
    } else {
      await prisma.user.create({
        data: {
          accountId: account.id,
          nome: 'Administrador Owner',
          role: Role.ADMIN,
          ativo: true
        }
      });
      console.log(`Usuário ${account.email} promovido a ADMIN com sucesso!`);
    }

  } catch (error) {
    console.error('Erro ao promover usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
