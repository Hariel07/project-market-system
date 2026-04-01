import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Semeando dados iniciais de Comércio (MockData)...');

  const comercios = [
    {
      nomeFantasia: 'Mercado Bom Preço',
      razaoSocial: 'Mercado Bom Preço LTDA',
      cnpj: '11111111000111',
      segmento: 'Mercados',
      logoUrl: '🛒',
      ativo: true,
      taxaEntrega: 5.99,
      tempoMedio: '25-35 min',
      isOpen: true,
      horarioAtendimento: 'Seg. a Sáb. - 07h às 20h',
    },
    {
      nomeFantasia: 'Burgão do João',
      razaoSocial: 'Burguer House SA',
      cnpj: '22222222000122',
      segmento: 'Restaurantes',
      logoUrl: '🍔',
      ativo: true,
      taxaEntrega: 3.99,
      tempoMedio: '30-45 min',
      isOpen: true,
      horarioAtendimento: 'Ter. a Dom. - 18h às 23h',
    },
    {
      nomeFantasia: 'Farmácia Saúde+',
      razaoSocial: 'Farmácia Saúde Plus',
      cnpj: '33333333000133',
      segmento: 'Farmácias',
      logoUrl: '💊',
      ativo: true,
      taxaEntrega: 4.99,
      tempoMedio: '20-30 min',
      isOpen: true,
      horarioAtendimento: '24 Horas',
    },
    {
      nomeFantasia: 'Padaria Pão Quente',
      razaoSocial: 'Panificadora Quente',
      cnpj: '44444444000144',
      segmento: 'Padarias',
      logoUrl: '🥖',
      ativo: true,
      taxaEntrega: 2.99,
      tempoMedio: '15-25 min',
      isOpen: true,
      horarioAtendimento: 'Todos os Dias - 06h às 20h',
    },
    {
      nomeFantasia: 'Hortifruti Natural',
      razaoSocial: 'Hortifruti SA',
      cnpj: '55555555000155',
      segmento: 'Hortifruti',
      logoUrl: '🥬',
      ativo: true,
      taxaEntrega: 6.99,
      tempoMedio: '30-40 min',
      isOpen: false, // FECHADO PARA TESTE VISUAL GRÁFICO
      horarioAtendimento: 'Fechado para almoço. Voltamos às 14h!',
    },
    {
      nomeFantasia: 'Distribuidora Geladão',
      razaoSocial: 'Bebidas Geladão',
      cnpj: '66666666000166',
      segmento: 'Bebidas',
      logoUrl: '🍺',
      ativo: true,
      taxaEntrega: 0,
      tempoMedio: '35-50 min',
      isOpen: true,
      horarioAtendimento: '24 Horas',
    },
  ];

  for (const c of comercios) {
    const exists = await prisma.commerce.findUnique({ where: { cnpj: c.cnpj } });
    if (!exists) {
      await prisma.commerce.create({ data: c });
      console.log(`✅ Adicionado: ${c.nomeFantasia}`);
    } else {
      // Atualiza para garantir que todos estão ativos/com os dados certos
      await prisma.commerce.update({
        where: { cnpj: c.cnpj },
        data: { ativo: true, isOpen: c.isOpen, horarioAtendimento: c.horarioAtendimento }
      });
      console.log(`✅ Atualizado: ${c.nomeFantasia}`);
    }
  }

  console.log('✅ Banco populado com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
