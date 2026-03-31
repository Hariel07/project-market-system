import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ============================================================
  // 1. Comerciante de teste: Mercado Bom Preço
  // ============================================================
  const senhaHash = await bcrypt.hash('123456', 10);

  const comercio = await prisma.commerce.upsert({
    where: { cnpj: '12345678000199' },
    update: {},
    create: {
      razaoSocial: 'Mercado Bom Preço LTDA',
      nomeFantasia: 'Mercado Bom Preço',
      cnpj: '12345678000199',
      segmento: 'Mercado',
      ativo: true,
      planoAtual: 'PREMIUM',
      taxaEntrega: 5.99,
      tempoMedio: '25-35 min',
      usuarios: {
        create: {
          nome: 'João Dono',
          email: 'dono@mercado.com',
          senha: senhaHash,
          telefone: '(11) 99999-0001',
          role: Role.DONO,
          ativo: true,
        },
      },
    },
    include: { usuarios: true },
  });

  console.log(`✅ Comércio criado: ${comercio.nomeFantasia} (ID: ${comercio.id})`);
  console.log(`   👤 Dono: dono@mercado.com / 123456`);

  // ============================================================
  // 2. Categorias do Mercado
  // ============================================================
  const categoriasData = [
    { nome: 'Alimentos', icone: '🍚' },
    { nome: 'Bebidas', icone: '🥤' },
    { nome: 'Laticínios', icone: '🥛' },
    { nome: 'Limpeza', icone: '🧹' },
    { nome: 'Hortifruti', icone: '🍌' },
    { nome: 'Higiene', icone: '🧴' },
  ];

  const categorias: Record<string, string> = {};

  for (const cat of categoriasData) {
    const existing = await prisma.category.findFirst({
      where: { nome: cat.nome, comercioId: comercio.id },
    });

    if (existing) {
      categorias[cat.nome] = existing.id;
    } else {
      const created = await prisma.category.create({
        data: { ...cat, comercioId: comercio.id },
      });
      categorias[cat.nome] = created.id;
    }
  }

  console.log(`   📂 ${Object.keys(categorias).length} categorias criadas`);

  // ============================================================
  // 3. Produtos do Mercado
  // ============================================================
  const produtosData = [
    { nome: 'Arroz Tio João 5kg', descricao: 'Arroz branco tipo 1, grão longo e fino.', precoVenda: 24.90, unidade: 'UN', estoque: 50, categoriaId: categorias['Alimentos'] },
    { nome: 'Feijão Carioca Kicaldo 1kg', descricao: 'Feijão carioca selecionado, cozimento rápido.', precoVenda: 7.49, precoPromocional: 5.99, unidade: 'UN', estoque: 80, categoriaId: categorias['Alimentos'] },
    { nome: 'Coca-Cola 2L', descricao: 'Refrigerante Coca-Cola sabor original.', precoVenda: 9.99, unidade: 'UN', estoque: 120, categoriaId: categorias['Bebidas'] },
    { nome: 'Leite Integral Parmalat 1L', descricao: 'Leite UHT integral, embalagem Tetra Pak.', precoVenda: 5.79, precoPromocional: 4.99, unidade: 'UN', estoque: 60, categoriaId: categorias['Laticínios'] },
    { nome: 'Sabão em Pó OMO 1.6kg', descricao: 'Sabão em pó multiação.', precoVenda: 18.90, unidade: 'UN', estoque: 35, categoriaId: categorias['Limpeza'] },
    { nome: 'Banana Prata (kg)', descricao: 'Banana prata fresca, selecionada.', precoVenda: 5.99, precoPromocional: 4.49, unidade: 'KG', estoque: 200, categoriaId: categorias['Hortifruti'] },
    { nome: 'Água Mineral 500ml', descricao: 'Água mineral sem gás.', precoVenda: 2.49, unidade: 'UN', estoque: 300, categoriaId: categorias['Bebidas'] },
    { nome: 'Detergente Ypê 500ml', descricao: 'Detergente líquido neutro.', precoVenda: 2.99, unidade: 'UN', estoque: 45, categoriaId: categorias['Limpeza'] },
    { nome: 'Queijo Mussarela (kg)', descricao: 'Queijo mussarela fatiado.', precoVenda: 39.90, unidade: 'KG', estoque: 15, categoriaId: categorias['Laticínios'] },
    { nome: 'Tomate Italiano (kg)', descricao: 'Tomate italiano fresco.', precoVenda: 8.99, unidade: 'KG', estoque: 80, categoriaId: categorias['Hortifruti'] },
  ];

  let produtosCriados = 0;
  for (const prod of produtosData) {
    const existing = await prisma.product.findFirst({
      where: { nome: prod.nome, comercioId: comercio.id },
    });
    if (!existing) {
      await prisma.product.create({
        data: { ...prod, comercioId: comercio.id },
      });
      produtosCriados++;
    }
  }

  console.log(`   📦 ${produtosCriados} produtos criados (${produtosData.length - produtosCriados} já existiam)`);

  // ============================================================
  // 4. Cliente de teste
  // ============================================================
  const clienteExiste = await prisma.user.findUnique({ where: { email: 'cliente@teste.com' } });
  if (!clienteExiste) {
    await prisma.user.create({
      data: {
        nome: 'Maria Cliente',
        email: 'cliente@teste.com',
        senha: senhaHash,
        telefone: '(11) 98888-0001',
        role: Role.CLIENTE,
        ativo: true,
      },
    });
    console.log(`\n✅ Cliente criado: cliente@teste.com / 123456`);
  }

  // ============================================================
  // 5. Entregador de teste
  // ============================================================
  const entregadorExiste = await prisma.user.findUnique({ where: { email: 'entregador@teste.com' } });
  if (!entregadorExiste) {
    await prisma.user.create({
      data: {
        nome: 'Carlos Entregador',
        email: 'entregador@teste.com',
        senha: senhaHash,
        telefone: '(11) 97777-0001',
        role: Role.ENTREGADOR,
        ativo: true,
      },
    });
    console.log(`✅ Entregador criado: entregador@teste.com / 123456`);
  }

  // ============================================================
  // 6. Admin de teste
  // ============================================================
  const adminExiste = await prisma.user.findUnique({ where: { email: 'admin@market.com' } });
  if (!adminExiste) {
    await prisma.user.create({
      data: {
        nome: 'Admin Sistema',
        email: 'admin@market.com',
        senha: senhaHash,
        telefone: '(11) 96666-0001',
        role: Role.ADMIN,
        ativo: true,
      },
    });
    console.log(`✅ Admin criado: admin@market.com / 123456`);
  }

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Contas de teste (senha: 123456):');
  console.log('   🏪 Comerciante: dono@mercado.com');
  console.log('   👤 Cliente:     cliente@teste.com');
  console.log('   🛵 Entregador:  entregador@teste.com');
  console.log('   ⚙️  Admin:      admin@market.com');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
