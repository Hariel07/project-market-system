# 🛒 Project Market System

Plataforma multi-segmento para gestão completa de negócios do setor alimentício, varejo, serviços e B2C. Cobre do cadastro de produtos e serviços até pedidos, entregas, estoque, fornecedores, impostos e atendimento inteligente.

> 💡 **Este projeto é uma base de conhecimento.**
> Construído seguindo o processo completo de Engenharia de Software — do briefing até o código — servindo como porta de entrada e referência para projetos futuros.

---

## 🎯 Segmentos Atendidos

O sistema é **agnóstico ao segmento**. O comerciante configura seu negócio e o sistema se adapta:

| Segmento | Exemplos de uso |
|---|---|
| 🍔 Restaurantes e Lanchonetes | Cardápio digital, comandas, modo garçom, QR Code de mesa |
| 🍺 Bares | Comandas por mesa, controle de bebidas, happy hour |
| 🛒 Mercados pequeno/médio porte | Catálogo, estoque, reposição por fornecedor |
| 💊 Farmácias | Produtos com lote, validade e impostos específicos |
| 🥖 Padarias | Receitas, produção diária, controle de perdas |
| 🔨 Materiais de Construção | Kits, composição de materiais, venda por medida |
| ⚙️ Serviços | Planos, pacotes, combos de serviços com precificação livre |
| 🛍️ Varejo B2C | Qualquer produto com categorias personalizadas e impostos |

---

## 🎯 Metodologia de Desenvolvimento

```
1. Instalação e Configuração  →  Ambiente pronto (Docker, Node, pgAdmin)
2. Briefing e Requisitos      →  O que o sistema precisa fazer
3. Design de Telas (Figma)    →  Como o sistema vai parecer
4. Modelagem UML              →  Entidades, funções e relacionamentos
5. Arquitetura C4 Model       →  Visão macro até micro do sistema
6. Banco de Dados             →  Estrutura e scripts SQL
7. Código                     →  Modular, simplificado e comentado
```

---

## 🧱 Conceito Central — Sistema de Composição de Itens

Este é o coração técnico do sistema. Todo item — produto, serviço, receita ou combo — segue a mesma estrutura base. Um item pode **ser composto por outros itens**, de forma recursiva, com nome livre, unidade de medida e precificação independente.

### Tipos de Item

```
┌──────────────────────────────────────────────────────────────────────┐
│                       SISTEMA DE ITENS                               │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  ITEM SIMPLES   │  │ ITEM COMPOSTO   │  │    SERVIÇO      │     │
│  │                 │  │  (Receita/BOM)  │  │                 │     │
│  │  Produto ou     │  │                 │  │  Trabalho,      │     │
│  │  insumo base    │  │  Feito de       │  │  consultoria,   │     │
│  │  indivisível    │  │  outros itens   │  │  mão de obra    │     │
│  │                 │  │                 │  │                 │     │
│  │  Ex: Ovo        │  │  Ex: Pão de     │  │  Ex: Instalação │     │
│  │  Ex: Farinha    │  │  Hambúrguer     │  │  Ex: Suporte    │     │
│  │  Ex: Cimento    │  │  Ex: Massa pron.│  │  Ex: Consultoria│     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                     │              │
│           └────────────────────┼─────────────────────┘              │
│                                ▼                                     │
│                  ┌─────────────────────────┐                        │
│                  │          COMBO          │                        │
│                  │                         │                        │
│                  │  Agrupa qualquer mix     │                        │
│                  │  de itens com nome livre │                        │
│                  │  e preço próprio         │                        │
│                  │                         │                        │
│                  │  Ex: ServiçoCinquentão   │                        │
│                  │  Ex: Kit Churrasco       │                        │
│                  │  Ex: Combo Família       │                        │
│                  └─────────────────────────┘                        │
│                                                                      │
│  ✅ Qualquer item pode ser componente de qualquer outro item         │
│  ✅ Nome 100% livre — o comerciante chama do que quiser              │
│  ✅ Unidade de medida configurável (g, kg, ml, un, h, m², etc.)     │
│  ✅ Custo calculado automaticamente a partir dos componentes         │
└──────────────────────────────────────────────────────────────────────┘
```

### Exemplos Reais por Segmento

**Restaurante — Pão de Hambúrguer (item composto / receita)**
```
Nome: Pão de Hambúrguer
Tipo: Composto
Rendimento: 10 unidades
Componentes:
  → 500 g    Farinha de trigo      (item simples)
  → 2 un     Ovos                  (item simples)
  → 10 g     Sal                   (item simples)
  → 15 g     Fermento biológico    (item simples)
  → 200 ml   Leite                 (item simples)
Custo calculado: R$ 3,20 total → R$ 0,32 por unidade
Preço de venda:  R$ 0,80 por unidade
Margem bruta:    150%
```

**Materiais de Construção — Massa Pronta Cimento (combo)**
```
Nome: Massa Pronta Cimento
Tipo: Combo
Componentes:
  → 0,5 saco  Areia fina           (item simples)
  → 1 un      Brita nº 1           (item simples)
  → 1 saco    Cimento 10 kg        (item simples)
Custo calculado: R$ 28,00
Preço de venda:  R$ 45,00
Margem bruta:    60,7%
```

**Serviços — Planos com nome livre e composição recursiva**
```
Nome: ServiçoCinquentão
Tipo: Combo
Componentes:
  → 1 un   Configuração inicial    (serviço)
  → 1 un   Treinamento básico      (serviço)
  → 1 un   Suporte 30 dias         (serviço)
Preço de venda: R$ 50,00

Nome: ServiçoCemzão
Tipo: Combo
Componentes:
  → 1 un   ServiçoCinquentão       (combo — composição recursiva!)
  → 1 un   Suporte premium 60 dias (serviço)
  → 2 h    Horas de consultoria    (serviço)
Preço de venda: R$ 100,00
```

**Farmácia — Produto com imposto e lote**
```
Nome: Dipirona 500mg (cx 20 comp)
Tipo: Simples
Unidade: caixa
Categoria: Medicamento OTC
Impostos: ICMS 12% + PIS 0,65% + COFINS 3%
Lote: 2024-A1   Validade: 12/2026
Custo nota: R$ 4,80   Preço de venda: R$ 9,90
Margem líquida (após impostos): 54%
```

---

## 📦 Gestão de Estoque e Fornecedores

### Entrada de Estoque — Nota Branca vs NF Simplificada

| Modo | Quando usar | Dados registrados |
|---|---|---|
| **Nota Branca** | Compras informais, feiras, atacadão sem NF | Fornecedor, data, itens, qtd, valores |
| **NF Simplificada** | Compras com documento fiscal | Número NF, CNPJ, itens, NCM, valores, impostos |

### Cálculo de Custo e Margem

```
Custo do Item Simples:
  = Preço da última entrada + Impostos não recuperáveis

Custo do Item Composto:
  = Σ (custo de cada componente × quantidade usada)
  + Mão de obra (se aplicável)
  + Overhead configurável (energia, embalagem, etc.)

Margem Bruta  = (Preço de Venda − Custo Total) / Preço de Venda × 100
Margem Líquida = Margem Bruta − Impostos sobre venda

Preço Sugerido = Custo Total / (1 − Margem Desejada%)
```

Quando o custo de um insumo é atualizado, o sistema **recalcula em cascata** o custo de todos os itens compostos que o utilizam, notificando o comerciante se alguma margem cair abaixo do mínimo configurado.

---

## 🏷️ Categorias e Impostos Personalizados

### Categorias Livres

O comerciante cria suas próprias categorias com nome totalmente livre:
- Restaurante: "Entradas", "Pratos do chef", "Combos", "Bebidas geladas"
- Serviços: "Planos mensais", "Avulso", "Mirabolante"
- Farmácia: "Medicamentos OTC", "Higiene", "Suplementos"

### Impostos — Configuração em 3 níveis (herança)

```
Nível 1 — Padrão do comerciante  →  fallback geral
    ↓ herda se não configurado
Nível 2 — Por categoria          →  todos os itens da categoria
    ↓ herda se não configurado
Nível 3 — Por item               →  configuração individual
```

Impostos suportados: ICMS, PIS, COFINS, ISS, Simples Nacional, ou "sem imposto" (nota branca).

---

## 🍽️ Modo Restaurante — Atendimento Multi-Modal

Ativado para os segmentos: Restaurante, Lanchonete, Bar.
O comerciante pode ativar **um ou mais métodos simultaneamente**.

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  🧾 Garçom       │  │  📱 QR Code      │  │  🏪 Balcão       │
│  por Mesa        │  │  por Mesa        │  │  Retirada        │
│  Garçom anota    │  │  Cliente escaneia│  │  Cliente pede    │
│  na mesa com     │  │  e pede pelo     │  │  e retira por    │
│  número          │  │  próprio celular │  │  senha           │
└──────────────────┘  └──────────────────┘  └──────────────────┘
✅ Pode ativar 1, 2 ou os 3 ao mesmo tempo
```

- Mesas cadastradas com número, capacidade e status em tempo real (WebSocket/SSE)
- QR Code por mesa gera URL pública `/cardapio/{slug}/mesa/{num}` — sem app, sem login
- Comandas acumulam pedidos por mesa durante toda a sessão
- Painel de balcão com geração de senha e chamada automática

---

## 📋 Requisitos Funcionais (RF)

### Plataforma Geral

- **RF01** — Cadastro e login com roles: cliente, comerciante, entregador, garçom, admin
- **RF02** — Autenticação via JWT + OAuth
- **RF03** — Mapa de entregas com rastreamento em tempo real via gRPC
- **RF04** — Eventos de pedido via Kafka
- **RF05** — E-mail de confirmação de pedido via n8n
- **RF06** — Alerta de estoque baixo via n8n
- **RF07** — Relatório diário de vendas via n8n
- **RF08** — Atendimento via WhatsApp com IA + escalonamento humano
- **RF09** — Suporte a múltiplos comércios (multi-tenant)

### Sistema de Composição de Itens

- **RF10** — Cadastro de item simples (produto ou serviço) com nome livre e unidade de medida
- **RF11** — Cadastro de item composto (receita/BOM) com componentes e quantidades
- **RF12** — Cadastro de combo agrupando qualquer mix de itens (simples, compostos, serviços, outros combos)
- **RF13** — Composição recursiva — um combo pode conter outro combo como componente
- **RF14** — Cálculo automático de custo a partir dos componentes (bottom-up)
- **RF15** — Cálculo automático de margem bruta, margem líquida e preço sugerido
- **RF16** — Unidades de medida configuráveis por item (g, kg, ml, L, un, cx, saco, h, m², etc.)
- **RF17** — Atributos variáveis por item via JSONB (sabor, cor, lote, validade, etc.)
- **RF18** — Baixa automática de insumos ao produzir ou vender item composto
- **RF19** — Controle de rendimento de receita (ex: 500g farinha → 10 pães)
- **RF20** — Registro de perda e desperdício por item

### Categorias e Impostos

- **RF21** — Criação de categorias com nome livre pelo comerciante
- **RF22** — Configuração de impostos por item, por categoria ou como padrão do comerciante
- **RF23** — Suporte a ICMS, PIS, COFINS, ISS, Simples Nacional e "sem imposto"
- **RF24** — Cálculo de margem líquida (após impostos) e margem bruta separados
- **RF25** — Recálculo automático em cascata ao atualizar custo de insumo
- **RF26** — Alerta quando margem cair abaixo do mínimo configurado após recálculo

### Estoque e Fornecedores

- **RF27** — Cadastro de fornecedores
- **RF28** — Entrada de estoque via nota branca (informal)
- **RF29** — Entrada de estoque via NF simplificada
- **RF30** — Atualização automática do custo unitário ao registrar nova entrada
- **RF31** — Histórico de compras por fornecedor e por item
- **RF32** — Estoque mínimo com alerta automático
- **RF33** — Sugestão de reposição por histórico de consumo
- **RF34** — Controle de lote e validade

### Modo Restaurante

- **RF35** — Modo Restaurante ativado por tipo de comerciante
- **RF36** — Configuração de 1 a 3 métodos de atendimento simultâneos
- **RF37** — Cadastro e gerenciamento de mesas
- **RF38** — Geração de QR Code único por mesa
- **RF39** — Cardápio público via QR Code sem login (PWA)
- **RF40** — Comandas por mesa com acumulação de pedidos
- **RF41** — Painel do garçom com mapa visual e status em tempo real
- **RF42** — Modo balcão com senha e painel de chamada
- **RF43** — Notificação de pedido pronto adaptada ao método ativo

---

## 🚫 Requisitos Não Funcionais (RNF)

- **RNF01** — Infraestrutura completa em Docker
- **RNF02** — Backend modular por domínio
- **RNF03** — REST API como comunicação principal
- **RNF04** — gRPC exclusivo para stream de localização
- **RNF05** — WebSocket/SSE para status de mesas em tempo real
- **RNF06** — TypeScript no frontend e backend
- **RNF07** — Código comentado para fins didáticos
- **RNF08** — Cardápio QR Code carrega em menos de 2s em 4G (PWA)
- **RNF09** — Composição recursiva de itens deve detectar e bloquear dependências circulares
- **RNF10** — Alteração de custo de insumo deve disparar recálculo em cascata em todos os compostos

---

## 🧩 Modelagem — Entidades Principais

```
Item (universal)
---------------------------------
- id, comercioId, categoriaId
- nome: String              ← nome livre
- tipo: simples|composto|servico|combo
- unidadeMedida: String     ← g, kg, ml, un, h, m², pitada, saco...
- precoVenda: Numeric
- custoCalculado: Numeric   ← calculado automaticamente
- margemBruta: Numeric      ← gerada automaticamente
- margemLiquida: Numeric    ← após impostos
- impostos: JSONB
- attributes: JSONB         ← atributos livres
- estoque, estoqueMinimo
- rendimento, rendimentoUn  ← para receitas (ex: 10 pães)

ComponenteItem (BOM recursivo)
---------------------------------
- itemPaiId → Item
- itemComponenteId → Item
- quantidade, unidadeMedida
- observacao

Categoria
---------------------------------
- nome: String              ← livre
- impostosPadrao: JSONB     ← herança para os itens

Fornecedor
---------------------------------
- nome, cnpjCpf, telefone, email

EntradaEstoque
---------------------------------
- fornecedorId
- tipo: nota_branca | nf_simplificada
- numeroNota (opcional)
- itens: EntradaItem[]

Comercio
---------------------------------
- tipo: mercado|restaurante|lanchonete|bar|farmacia|padaria|materiais|servicos|outro
- modoRestaurante: boolean
- metodosAtendimento: JSONB ← { garcom, qrcode, balcao }
- impostoPadrao: JSONB

Mesa, Comanda (Modo Restaurante)
```

---

## 🏗️ Arquitetura C4 — Nível 2 (Containers)

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Project Market System                           │
│                                                                      │
│  [React Frontend] ──── REST ────► [Nginx] ───► [Backend Node.js]    │
│  [Cardápio QR PWA] ─── REST ────► [Nginx] ───► [Backend Node.js]    │
│                                                      │               │
│                             gRPC (localização)       │               │
│  [Mapa Entregas] ◄───────────────────────────────────┘               │
│                                                      │               │
│                             WebSocket/SSE (mesas)    │               │
│  [Painel Garçom] ◄───────────────────────────────────┘               │
│                                                      │               │
│                                    ┌─────────────────┴──────────┐    │
│                                    │  PostgreSQL 16 (JSONB)      │    │
│                                    │  Redis (cache + JWT)        │    │
│                                    │  Kafka (eventos)            │    │
│                                    └────────────────────────────┘    │
│  [n8n] ◄──── Kafka ──── [Backend]                                    │
│  [WhatsApp] → [n8n] → [Gemini/GPT] → resposta automática             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript |
| Cardápio QR Code | React PWA (público, sem login) |
| Backend | Node.js + Express + TypeScript |
| Comunicação principal | REST API |
| Localização em tempo real | gRPC |
| Status mesas em tempo real | WebSocket ou SSE |
| Mensageria | Apache Kafka |
| Banco de Dados | PostgreSQL 16 (JSONB) |
| Cache / Sessão | Redis |
| Autenticação | JWT + OAuth |
| Automações | n8n |
| Atendimento IA | n8n + Gemini/GPT + WhatsApp |
| Proxy | Nginx |
| Infraestrutura | Docker + Docker Compose |
| Design | Figma (telas) + FigJam (fluxos) |
| Modelagem | Draw.io (UML + C4) |

---

## 🗄️ Banco de Dados — Tabelas Principais

```sql
CREATE TABLE items (
    id               SERIAL PRIMARY KEY,
    comercio_id      INTEGER NOT NULL REFERENCES comercios(id),
    categoria_id     INTEGER REFERENCES categorias(id),
    nome             VARCHAR(200) NOT NULL,
    descricao        TEXT,
    tipo             VARCHAR(20) NOT NULL
                     CHECK (tipo IN ('simples','composto','servico','combo')),
    unidade_medida   VARCHAR(20) NOT NULL DEFAULT 'un',
    preco_venda      NUMERIC(12,4) NOT NULL DEFAULT 0,
    custo_calculado  NUMERIC(12,4) NOT NULL DEFAULT 0,
    margem_bruta     NUMERIC(6,2) GENERATED ALWAYS AS (
                       CASE WHEN preco_venda > 0
                       THEN ROUND(((preco_venda - custo_calculado) / preco_venda) * 100, 2)
                       ELSE 0 END
                     ) STORED,
    impostos         JSONB NOT NULL DEFAULT '{}',
    attributes       JSONB NOT NULL DEFAULT '{}',
    estoque          NUMERIC(12,4) NOT NULL DEFAULT 0,
    estoque_minimo   NUMERIC(12,4) NOT NULL DEFAULT 0,
    rendimento       NUMERIC(12,4) DEFAULT 1,
    rendimento_un    VARCHAR(20) DEFAULT 'un',
    ativo            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE item_componentes (
    id                  SERIAL PRIMARY KEY,
    item_pai_id         INTEGER NOT NULL REFERENCES items(id),
    item_componente_id  INTEGER NOT NULL REFERENCES items(id),
    quantidade          NUMERIC(12,4) NOT NULL,
    unidade_medida      VARCHAR(20) NOT NULL,
    observacao          VARCHAR(300),
    CHECK (item_pai_id <> item_componente_id)
);

CREATE TABLE categorias (
    id               SERIAL PRIMARY KEY,
    comercio_id      INTEGER NOT NULL REFERENCES comercios(id),
    nome             VARCHAR(150) NOT NULL,
    descricao        TEXT,
    impostos_padrao  JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE fornecedores (
    id          SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL REFERENCES comercios(id),
    nome        VARCHAR(200) NOT NULL,
    cnpj_cpf    VARCHAR(20),
    telefone    VARCHAR(20),
    email       VARCHAR(150)
);

CREATE TABLE entradas_estoque (
    id            SERIAL PRIMARY KEY,
    comercio_id   INTEGER NOT NULL REFERENCES comercios(id),
    fornecedor_id INTEGER REFERENCES fornecedores(id),
    tipo          VARCHAR(20) NOT NULL CHECK (tipo IN ('nota_branca','nf_simplificada')),
    numero_nota   VARCHAR(50),
    data_entrada  DATE NOT NULL DEFAULT CURRENT_DATE,
    total         NUMERIC(12,2) NOT NULL DEFAULT 0,
    observacao    TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE entradas_estoque_itens (
    id              SERIAL PRIMARY KEY,
    entrada_id      INTEGER NOT NULL REFERENCES entradas_estoque(id),
    item_id         INTEGER NOT NULL REFERENCES items(id),
    quantidade      NUMERIC(12,4) NOT NULL,
    unidade_medida  VARCHAR(20) NOT NULL,
    custo_unitario  NUMERIC(12,4) NOT NULL,
    impostos        JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE comercios (
    id                   SERIAL PRIMARY KEY,
    user_id              INTEGER NOT NULL REFERENCES users(id),
    nome                 VARCHAR(200) NOT NULL,
    tipo                 VARCHAR(50) NOT NULL,
    segmento             VARCHAR(200),
    modo_restaurante     BOOLEAN DEFAULT FALSE,
    metodos_atendimento  JSONB DEFAULT '{"garcom":false,"qrcode":false,"balcao":false}',
    imposto_padrao       JSONB DEFAULT '{}',
    created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE mesas (
    id          SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL REFERENCES comercios(id),
    numero      INTEGER NOT NULL,
    capacidade  INTEGER NOT NULL DEFAULT 4,
    status      VARCHAR(30) NOT NULL DEFAULT 'livre',
    qr_code_url TEXT,
    UNIQUE (comercio_id, numero)
);

CREATE TABLE comandas (
    id          SERIAL PRIMARY KEY,
    mesa_id     INTEGER NOT NULL REFERENCES mesas(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'aberta',
    total       NUMERIC(12,2) DEFAULT 0,
    abertura_em TIMESTAMP NOT NULL DEFAULT NOW(),
    fechamento  TIMESTAMP
);
```

---

## 🤖 Automações com n8n

```
1. Confirmação de pedido
   Kafka (pedido.criado) → n8n → e-mail ao cliente

2. Alerta de estoque baixo
   Kafka (item.estoque_baixo) → n8n → e-mail/Telegram ao comerciante

3. Recálculo de custo em cascata
   Kafka (item.custo_atualizado) → n8n → API recalcula compostos dependentes
                                 → alerta se margem cair abaixo do mínimo

4. Relatório diário de vendas
   Schedule (08:00) → n8n → consulta API → e-mail ao comerciante

5. Notificação pedido pronto (Modo Restaurante)
   Kafka (pedido.pronto) → n8n → QR Code: WebSocket na tela do cliente
                               → Balcão: atualiza painel de senhas
                               → Garçom: push no painel do garçom

6. Atendimento IA via WhatsApp
   WhatsApp → n8n → IA (cardápio, status, preços)
                  → caso complexo → humano
```

---

## 📁 Estrutura do Projeto

```
project-market-system/
├── docker-compose.yml
├── README.md
├── nginx/
├── backend/src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── comercios/
│   │   ├── categorias/
│   │   ├── items/                  ← Sistema de composição (BOM recursivo)
│   │   │   ├── item.service.ts     ← Cálculo de custo bottom-up + detecção de loop
│   │   │   └── item.routes.ts
│   │   ├── componentes/            ← Relacionamento item ↔ componente
│   │   ├── estoque/                ← Entradas, notas, fornecedores
│   │   ├── fornecedores/
│   │   ├── impostos/               ← Regras e cálculo de impostos
│   │   ├── orders/
│   │   ├── deliveries/
│   │   │   └── delivery.grpc.ts    ← Stream localização via gRPC
│   │   └── restaurant/             ← Modo Restaurante
│   │       ├── mesa.service.ts
│   │       ├── comanda.service.ts
│   │       ├── qrcode.service.ts
│   │       └── mesa.gateway.ts     ← WebSocket status mesas
│   └── shared/
│       ├── database/, redis/, kafka/, grpc/
└── frontend/src/
    ├── modules/
    │   ├── items/                  ← Cadastro + montagem de composição
    │   ├── estoque/
    │   ├── fornecedores/
    │   ├── impostos/
    │   ├── deliveries/
    │   └── restaurant/
    ├── cardapio-qr/                ← PWA público sem login
    └── shared/
```

---

## 📌 Roadmap

### ✅ Fase 0 — Instalação
- [x] Docker + PostgreSQL 16 + Redis + Kafka + n8n

### 🎨 Fase 1 — Design (Figma + FigJam)
- [ ] Navigation Flow — Cliente, Comércio, Garçom, Entregador
- [ ] Wireframes e Mockups de todas as telas
- [ ] Mockup do Cadastro de Item com montagem de composição
- [ ] Mockup Cardápio QR Code (PWA)

### 🧩 Fase 2 — Modelagem (UML + C4)
- [ ] Diagrama de Casos de Uso
- [ ] Diagrama de Classes (foco na composição recursiva)
- [ ] Diagrama de Sequência (pedido QR, composição de item, entrada de estoque)
- [ ] C4 Model — Níveis 1, 2 e 3

### 🗄️ Fase 3 — Banco de Dados
- [x] Tabela `items` com JSONB
- [ ] Tabela `item_componentes` (BOM recursivo)
- [ ] Tabela `categorias` com impostos padrão
- [ ] Tabela `fornecedores`, `entradas_estoque`, `entradas_estoque_itens`
- [ ] Tabela `comercios`, `mesas`, `comandas`
- [ ] Trigger para recálculo de custo em cascata

### ⚙️ Fase 4 — Backend
- [ ] Módulo `items` com cálculo recursivo e detecção de dependência circular
- [ ] Módulo `componentes` (CRUD de composição)
- [ ] Módulo `estoque` (nota branca + NF simplificada)
- [ ] Módulo `impostos` (cálculo e herança por categoria)
- [ ] Módulo Modo Restaurante (mesas, comandas, QR, WebSocket)
- [ ] Autenticação JWT + OAuth
- [ ] Eventos Kafka + gRPC

### 🖥️ Fase 5 — Frontend
- [ ] Telas de Auth (todos os atores)
- [ ] Cadastro de Item (simples, composto, serviço, combo)
- [ ] Interface de montagem de composição (BOM visual)
- [ ] Gestão de Estoque e Fornecedores
- [ ] Configuração de Categorias e Impostos
- [ ] Dashboard com margens, alertas e análise de custo
- [ ] Modo Restaurante completo (mesas, comandas, QR, balcão)
- [ ] Cardápio QR Code (PWA público)
- [ ] Mapa de Entregas (gRPC)

### 🤖 Fase 6 — Automações n8n
- [ ] E-mail confirmação de pedido
- [ ] Alerta de estoque baixo
- [ ] Recálculo de custo em cascata com alerta de margem
- [ ] Relatório diário de vendas
- [ ] Notificação pedido pronto (multi-método)
- [ ] Atendimento IA via WhatsApp

---

## 🐳 Comandos Docker Úteis

```bash
docker-compose up -d               # Subir tudo
docker-compose up -d postgres redis # Subir só o banco e cache
docker-compose down                # Parar tudo
docker-compose down -v             # Parar e apagar dados ⚠️
docker logs market-backend         # Logs do backend
docker-compose up -d --build backend # Rebuild após mudança
```

---

## 📚 Conceitos Aplicados

- **BOM Recursivo (Bill of Materials)** — composição de itens em múltiplos níveis com cálculo de custo bottom-up automático
- **Detecção de dependência circular** — algoritmo de DFS para bloquear composições que gerariam loop infinito
- **JSONB** — atributos livres, impostos e configurações sem schema rígido
- **Trigger PostgreSQL** — recálculo em cascata do custo ao atualizar insumos
- **Multi-tenant** — múltiplos comércios com isolamento de dados
- **PWA** — cardápio QR Code acessível sem app e sem login
- **gRPC** — stream de localização de entrega em tempo real
- **WebSocket/SSE** — status de mesas em tempo real
- **Kafka** — eventos assíncronos entre módulos
- **n8n** — automações, alertas e atendimento IA
- **JWT + OAuth** — autenticação stateless multi-role
- **Docker Compose** — orquestração completa do ambiente
