-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DONO', 'GERENTE', 'ESTOQUE', 'CAIXA', 'AJUDANTE_GERAL', 'GARCOM', 'ENTREGADOR', 'CLIENTE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDENTE', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDITO', 'DEBITO', 'DINHEIRO');

-- CreateEnum
CREATE TYPE "TipoMovimentoCaixa" AS ENUM ('ABERTURA', 'VENDA', 'DINHEIRO_ENTRADA', 'SANGRIA', 'SUPRIMENTO', 'DEVOLUCAO', 'AJUSTE', 'FECHAMENTO');

-- CreateEnum
CREATE TYPE "TipoContaFinanceira" AS ENUM ('COMERCIO', 'ENTREGADOR', 'PLATAFORMA');

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('PAGAMENTO_PEDIDO', 'REPASSE_ENTREGADOR', 'PAGAMENTO_ASSINATURA', 'DEPOSITO_CONTA', 'SAQUE', 'ESTORNO', 'AJUSTE_ADMIN');

-- CreateEnum
CREATE TYPE "StatusTransacao" AS ENUM ('PENDENTE', 'PROCESSADO', 'FALHOU', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "StatusPagamentoAssinatura" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "PlatformConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nomeApp" TEXT NOT NULL DEFAULT 'Market System',
    "logoUrl" TEXT,
    "assinaturaObrigatoria" BOOLEAN NOT NULL DEFAULT false,
    "modoManutencao" BOOLEAN NOT NULL DEFAULT false,
    "alertaValidadeDiasPadrao" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "descricao" TEXT,
    "features" TEXT[],
    "maxItens" INTEGER,
    "maxPdvs" INTEGER,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3),
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "isFake" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "nome" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CLIENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "comercioId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "userId" TEXT,
    "comercioId" TEXT,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "pais" TEXT DEFAULT 'BR',
    "cep" TEXT,
    "pontoReferencia" TEXT,
    "rotulo" TEXT NOT NULL DEFAULT 'CASA',
    "icone" TEXT NOT NULL DEFAULT '🏠',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commerce" (
    "id" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "segmento" TEXT NOT NULL,
    "logoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "planoAtual" TEXT NOT NULL DEFAULT 'GRATIS',
    "planoId" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "pais" TEXT DEFAULT 'BR',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "taxaEntrega" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tempoMedio" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "horarioAtendimento" TEXT,
    "alertaValidadeDias" INTEGER NOT NULL DEFAULT 7,
    "estoqueMinimoPadrao" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commerce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "icone" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "comercioId" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "comercioId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "precoVenda" DOUBLE PRECISION NOT NULL,
    "precoPromocional" DOUBLE PRECISION,
    "unidade" TEXT NOT NULL DEFAULT 'UN',
    "imagemUrl" TEXT,
    "estoque" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estoqueMinimo" DOUBLE PRECISION,
    "isCombo" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataValidade" TIMESTAMP(3),
    "alertaValidadeDias" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "comercioId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDENTE',
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "taxaEntrega" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "metodoPagto" "PaymentMethod" NOT NULL,
    "troco" DOUBLE PRECISION,
    "valorPago" DOUBLE PRECISION,
    "observacoes" TEXT,
    "enderecoEntrega" TEXT,
    "transacaoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "precoUnitario" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "entregadorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AGUARDANDO_COLETA',
    "taxaRepasse" DOUBLE PRECISION,
    "assinatura" TEXT,
    "coletadoEm" TIMESTAMP(3),
    "entregueEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryGPS" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "velocidade" DOUBLE PRECISION,
    "precisao" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryGPS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "entregaId" TEXT NOT NULL,
    "entregadorId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "ultimaMensagem" TEXT,
    "ultimaAtividadeEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "enviahoPor" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "icone" TEXT,
    "entregaId" TEXT,
    "dados" TEXT,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "entregaId" TEXT NOT NULL,
    "entregadorId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "estrelas" INTEGER NOT NULL,
    "comentario" TEXT,
    "respostaEntregador" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AberturaCaixa" (
    "id" TEXT NOT NULL,
    "comercioId" TEXT NOT NULL,
    "pdvId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "saldoInicial" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "saldoFinal" DOUBLE PRECISION,
    "responsavelId" TEXT NOT NULL,
    "dataAbertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFechamento" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AberturaCaixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentoCaixa" (
    "id" TEXT NOT NULL,
    "comercioId" TEXT NOT NULL,
    "aberturaCaixaId" TEXT,
    "pdvId" TEXT,
    "tipo" "TipoMovimentoCaixa" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "referencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovimentoCaixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaFinanceira" (
    "id" TEXT NOT NULL,
    "tipo" "TipoContaFinanceira" NOT NULL,
    "comercioId" TEXT,
    "userId" TEXT,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "saldoBloqueado" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransacaoFinanceira" (
    "id" TEXT NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "status" "StatusTransacao" NOT NULL DEFAULT 'PENDENTE',
    "origemId" TEXT,
    "destinoId" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "TransacaoFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoAssinatura" (
    "id" TEXT NOT NULL,
    "comercioId" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "contaId" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" "StatusPagamentoAssinatura" NOT NULL DEFAULT 'PENDENTE',
    "vencimento" TIMESTAMP(3) NOT NULL,
    "pagoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagamentoAssinatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_nome_key" ON "SubscriptionPlan"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_slug_key" ON "SubscriptionPlan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Account_cpf_key" ON "Account"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE INDEX "Address_accountId_idx" ON "Address"("accountId");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Address_comercioId_idx" ON "Address"("comercioId");

-- CreateIndex
CREATE UNIQUE INDEX "Commerce_cnpj_key" ON "Commerce"("cnpj");

-- CreateIndex
CREATE INDEX "Commerce_cidade_idx" ON "Commerce"("cidade");

-- CreateIndex
CREATE INDEX "Commerce_estado_idx" ON "Commerce"("estado");

-- CreateIndex
CREATE INDEX "Commerce_segmento_idx" ON "Commerce"("segmento");

-- CreateIndex
CREATE INDEX "Commerce_ativo_idx" ON "Commerce"("ativo");

-- CreateIndex
CREATE INDEX "Category_comercioId_idx" ON "Category"("comercioId");

-- CreateIndex
CREATE INDEX "Product_comercioId_idx" ON "Product"("comercioId");

-- CreateIndex
CREATE INDEX "Product_categoriaId_idx" ON "Product"("categoriaId");

-- CreateIndex
CREATE INDEX "Product_dataValidade_idx" ON "Product"("dataValidade");

-- CreateIndex
CREATE INDEX "Product_ativo_idx" ON "Product"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "Order_transacaoId_key" ON "Order"("transacaoId");

-- CreateIndex
CREATE INDEX "Order_comercioId_idx" ON "Order"("comercioId");

-- CreateIndex
CREATE INDEX "Order_clienteId_idx" ON "Order"("clienteId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_pedidoId_key" ON "Delivery"("pedidoId");

-- CreateIndex
CREATE INDEX "DeliveryGPS_deliveryId_idx" ON "DeliveryGPS"("deliveryId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_entregaId_key" ON "Chat"("entregaId");

-- CreateIndex
CREATE INDEX "Chat_entregadorId_idx" ON "Chat"("entregadorId");

-- CreateIndex
CREATE INDEX "Chat_clienteId_idx" ON "Chat"("clienteId");

-- CreateIndex
CREATE INDEX "ChatMessage_chatId_idx" ON "ChatMessage"("chatId");

-- CreateIndex
CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_lido_idx" ON "Notification"("lido");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_entregaId_key" ON "Rating"("entregaId");

-- CreateIndex
CREATE INDEX "AberturaCaixa_comercioId_idx" ON "AberturaCaixa"("comercioId");

-- CreateIndex
CREATE INDEX "AberturaCaixa_status_idx" ON "AberturaCaixa"("status");

-- CreateIndex
CREATE INDEX "MovimentoCaixa_comercioId_idx" ON "MovimentoCaixa"("comercioId");

-- CreateIndex
CREATE INDEX "MovimentoCaixa_tipo_idx" ON "MovimentoCaixa"("tipo");

-- CreateIndex
CREATE INDEX "MovimentoCaixa_aberturaCaixaId_idx" ON "MovimentoCaixa"("aberturaCaixaId");

-- CreateIndex
CREATE UNIQUE INDEX "ContaFinanceira_comercioId_key" ON "ContaFinanceira"("comercioId");

-- CreateIndex
CREATE UNIQUE INDEX "ContaFinanceira_userId_key" ON "ContaFinanceira"("userId");

-- CreateIndex
CREATE INDEX "ContaFinanceira_tipo_idx" ON "ContaFinanceira"("tipo");

-- CreateIndex
CREATE INDEX "TransacaoFinanceira_tipo_idx" ON "TransacaoFinanceira"("tipo");

-- CreateIndex
CREATE INDEX "TransacaoFinanceira_status_idx" ON "TransacaoFinanceira"("status");

-- CreateIndex
CREATE INDEX "TransacaoFinanceira_origemId_idx" ON "TransacaoFinanceira"("origemId");

-- CreateIndex
CREATE INDEX "TransacaoFinanceira_destinoId_idx" ON "TransacaoFinanceira"("destinoId");

-- CreateIndex
CREATE INDEX "PagamentoAssinatura_comercioId_idx" ON "PagamentoAssinatura"("comercioId");

-- CreateIndex
CREATE INDEX "PagamentoAssinatura_status_idx" ON "PagamentoAssinatura"("status");

-- CreateIndex
CREATE INDEX "PagamentoAssinatura_vencimento_idx" ON "PagamentoAssinatura"("vencimento");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Commerce"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Commerce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commerce" ADD CONSTRAINT "Commerce_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Commerce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Commerce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Commerce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_transacaoId_fkey" FOREIGN KEY ("transacaoId") REFERENCES "TransacaoFinanceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_entregadorId_fkey" FOREIGN KEY ("entregadorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryGPS" ADD CONSTRAINT "DeliveryGPS_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_entregaId_fkey" FOREIGN KEY ("entregaId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_entregadorId_fkey" FOREIGN KEY ("entregadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_entregaId_fkey" FOREIGN KEY ("entregaId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_entregadorId_fkey" FOREIGN KEY ("entregadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AberturaCaixa" ADD CONSTRAINT "AberturaCaixa_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AberturaCaixa" ADD CONSTRAINT "AberturaCaixa_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Commerce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoCaixa" ADD CONSTRAINT "MovimentoCaixa_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoCaixa" ADD CONSTRAINT "MovimentoCaixa_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Commerce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoCaixa" ADD CONSTRAINT "MovimentoCaixa_aberturaCaixaId_fkey" FOREIGN KEY ("aberturaCaixaId") REFERENCES "AberturaCaixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "ContaFinanceira_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Commerce"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "ContaFinanceira_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransacaoFinanceira" ADD CONSTRAINT "TransacaoFinanceira_origemId_fkey" FOREIGN KEY ("origemId") REFERENCES "ContaFinanceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransacaoFinanceira" ADD CONSTRAINT "TransacaoFinanceira_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "ContaFinanceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransacaoFinanceira" ADD CONSTRAINT "TransacaoFinanceira_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TransacaoFinanceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoAssinatura" ADD CONSTRAINT "PagamentoAssinatura_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Commerce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoAssinatura" ADD CONSTRAINT "PagamentoAssinatura_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoAssinatura" ADD CONSTRAINT "PagamentoAssinatura_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "ContaFinanceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;
