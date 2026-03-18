# 🛒 Project Market System

Plataforma multi-segmento para gestão completa de negócios do setor alimentício, varejo, serviços e B2C. Cobre do cadastro de produtos e serviços compostos até pedidos, entregas, estoque, fornecedores, impostos, cardápio digital e atendimento inteligente com IA.

> 💡 **Este projeto é uma base de conhecimento.**
> Foi construído seguindo um processo completo de Engenharia de Software — do briefing até o código — servindo como porta de entrada e referência para projetos futuros.

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

Este projeto segue um processo estruturado, passando por todas as etapas de Engenharia de Software antes de escrever qualquer linha de código:

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
│  │  Produto ou     │  │  Feito de       │  │  Trabalho,      │     │
│  │  insumo base    │  │  outros itens   │  │  consultoria,   │     │
│  │  indivisível    │  │  com rendimento │  │  mão de obra    │     │
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
Tipo: Composto | Rendimento: 10 unidades
Componentes:
  → 500 g    Farinha de trigo       (item simples)
  → 2 un     Ovos                   (item simples)
  → 10 g     Sal                    (item simples)
  → 15 g     Fermento biológico     (item simples)
  → 200 ml   Leite                  (item simples)
Custo calculado: R$ 3,20 total → R$ 0,32 por unidade
Preço de venda:  R$ 0,80 por unidade | Margem bruta: 150%
```

**Materiais de Construção — Massa Pronta Cimento (combo)**
```
Nome: Massa Pronta Cimento
Tipo: Combo
Componentes:
  → 0,5 saco  Areia fina            (item simples)
  → 1 un      Brita nº 1            (item simples)
  → 1 saco    Cimento 10 kg         (item simples)
Custo calculado: R$ 28,00 | Preço de venda: R$ 45,00 | Margem: 60,7%
```

**Serviços — Planos com nome livre e composição recursiva**
```
Nome: ServiçoCinquentão
Tipo: Combo
Componentes:
  → 1 un   Configuração inicial     (serviço)
  → 1 un   Treinamento básico       (serviço)
  → 1 un   Suporte 30 dias          (serviço)
Preço de venda: R$ 50,00

Nome: ServiçoCemzão
Tipo: Combo
Componentes:
  → 1 un   ServiçoCinquentão        (combo — composição recursiva!)
  → 1 un   Suporte premium 60 dias  (serviço)
  → 2 h    Horas de consultoria     (serviço)
Preço de venda: R$ 100,00
```

**Farmácia — Produto com imposto e lote**
```
Nome: Dipirona 500mg (cx 20 comp)
Tipo: Simples | Unidade: caixa
Impostos: ICMS 12% + PIS 0,65% + COFINS 3%
Lote: 2024-A1 | Validade: 12/2026
Custo nota: R$ 4,80 | Preço de venda: R$ 9,90 | Margem líquida: 54%
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

Margem Bruta   = (Preço de Venda − Custo Total) / Preço de Venda × 100
Margem Líquida = Margem Bruta − Impostos sobre venda
Preço Sugerido = Custo Total / (1 − Margem Desejada%)
```

Quando o custo de um insumo é atualizado, o sistema **recalcula em cascata** o custo de todos os itens compostos que o utilizam, notificando o comerciante se alguma margem cair abaixo do mínimo configurado.

---

## 🏷️ Categorias e Impostos Personalizados

O comerciante cria suas próprias categorias com nome totalmente livre. Os impostos seguem herança em 3 níveis:

```
Nível 1 — Padrão do comerciante  →  fallback geral
    ↓ herda se não configurado
Nível 2 — Por categoria          →  todos os itens da categoria
    ↓ herda se não configurado
Nível 3 — Por item               →  configuração individual
```

Impostos suportados: **ICMS**, **PIS**, **COFINS**, **ISS**, **Simples Nacional** e opção "sem imposto" (nota branca informal).

---

## 🍽️ Modo Restaurante — Atendimento Multi-Modal

Ativado automaticamente para os segmentos: Restaurante, Lanchonete, Bar.
O comerciante pode ativar **um ou mais métodos simultaneamente**.

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  🧾 Garçom       │  │  📱 QR Code      │  │  🏪 Balcão       │
│  por Mesa        │  │  por Mesa        │  │  Retirada        │
│  Garçom anota    │  │  Cliente escaneia│  │  Cliente pede,   │
│  na mesa com     │  │  e pede pelo     │  │  paga e retira   │
│  número          │  │  próprio celular │  │  por senha       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
✅ Pode ativar 1, 2 ou os 3 ao mesmo tempo
```

- Mesas cadastradas com número, capacidade e status em tempo real (WebSocket/SSE)
- QR Code por mesa gera URL pública `/cardapio/{slug}/mesa/{num}` — sem app, sem login
- Comandas acumulam pedidos por mesa durante toda a sessão
- Painel de balcão com geração de senha e chamada automática quando pedido pronto

---

## 📐 Fase 1 — Briefing e Engenharia de Requisitos

Antes de qualquer código ou tela, definimos **o que o sistema precisa fazer**.

### Documento de Visão do Produto

| Campo | Descrição |
|---|---|
| **Nome** | Project Market System |
| **Objetivo** | Plataforma adaptável para qualquer negócio do setor de varejo, alimentação e serviços gerenciar produtos compostos, estoque, fornecedores, impostos, pedidos, entregas e atendimento |
| **Público-alvo** | Micro e pequenos empreendedores de qualquer segmento, clientes, entregadores, garçons e administradores |
| **Problema central** | Centralizar composição livre de produtos/serviços, gestão de estoque com fornecedor, cálculo de custo/imposto/margem, pedidos, entregas e atendimento inteligente em uma única plataforma |

### Requisitos Funcionais (RF)

#### Plataforma Geral

- **RF01** — O sistema deve permitir cadastro e login de usuários com roles (cliente, comerciante, entregador, garçom, admin)
- **RF02** — O sistema deve autenticar usuários via JWT com suporte a OAuth
- **RF03** — O sistema deve exibir mapa de entregas com rastreamento em tempo real via gRPC
- **RF04** — O sistema deve emitir eventos ao criar/atualizar pedidos via Kafka
- **RF05** — O sistema deve enviar e-mail de confirmação ao criar um pedido
- **RF06** — O sistema deve alertar quando o estoque de um item estiver baixo
- **RF07** — O sistema deve enviar relatório diário de vendas por e-mail
- **RF08** — O sistema deve responder dúvidas via WhatsApp com IA (Gemini/GPT), encaminhando casos complexos para humano
- **RF09** — O sistema deve suportar múltiplos comércios (marketplace multi-tenant)

#### Sistema de Composição de Itens

- **RF10** — O sistema deve permitir cadastro de item simples (produto ou serviço) com nome livre e unidade de medida
- **RF11** — O sistema deve permitir cadastro de item composto (receita/BOM) com lista de componentes e quantidades
- **RF12** — O sistema deve permitir cadastro de combo agrupando qualquer mix de itens (simples, compostos, serviços e outros combos)
- **RF13** — O sistema deve suportar composição recursiva — um combo pode conter outro combo como componente
- **RF14** — O sistema deve calcular automaticamente o custo de cada item a partir dos componentes (bottom-up)
- **RF15** — O sistema deve calcular automaticamente margem bruta, margem líquida e preço sugerido de venda
- **RF16** — O sistema deve suportar unidades de medida configuráveis por item (g, kg, ml, L, un, cx, saco, h, m², pitada, etc.)
- **RF17** — Itens devem suportar atributos variáveis via JSONB (sabor, cor, lote, validade, etc.)
- **RF18** — O sistema deve realizar baixa automática de insumos ao produzir ou vender item composto
- **RF19** — O sistema deve suportar controle de rendimento de receita (ex: 500g farinha → 10 pães)
- **RF20** — O sistema deve permitir registro de perda e desperdício por item

#### Categorias e Impostos

- **RF21** — O comerciante deve poder criar categorias com nome totalmente livre
- **RF22** — O sistema deve suportar configuração de impostos por item, por categoria e como padrão do comerciante (herança em 3 níveis)
- **RF23** — O sistema deve suportar ICMS, PIS, COFINS, ISS, Simples Nacional e opção sem imposto
- **RF24** — O sistema deve exibir separadamente margem bruta e margem líquida (após impostos)
- **RF25** — O sistema deve recalcular automaticamente em cascata o custo de compostos ao atualizar custo de insumo
- **RF26** — O sistema deve alertar o comerciante quando margem cair abaixo do mínimo configurado após recálculo

#### Estoque e Fornecedores

- **RF27** — O sistema deve permitir cadastro de fornecedores
- **RF28** — O sistema deve suportar entrada de estoque via nota branca (registro informal)
- **RF29** — O sistema deve suportar entrada de estoque via NF simplificada (número, CNPJ, itens, valores)
- **RF30** — O sistema deve atualizar automaticamente o custo unitário ao registrar nova entrada
- **RF31** — O sistema deve manter histórico de compras por fornecedor e por item
- **RF32** — O sistema deve suportar estoque mínimo configurável com alerta automático
- **RF33** — O sistema deve sugerir reposição baseada no histórico de consumo
- **RF34** — O sistema deve suportar controle de lote e validade

#### Modo Restaurante

- **RF35** — O Modo Restaurante deve ser ativado automaticamente por tipo de comerciante
- **RF36** — O comerciante deve poder configurar de 1 a 3 métodos de atendimento simultaneamente
- **RF37** — O sistema deve permitir cadastro e gerenciamento de mesas com número, capacidade e status
- **RF38** — O sistema deve gerar QR Code único por mesa
- **RF39** — O cardápio deve ser acessível via QR Code sem login (PWA pública)
- **RF40** — O sistema deve suportar comandas por mesa com acumulação de pedidos
- **RF41** — O garçom deve ter painel com mapa visual do salão e status em tempo real
- **RF42** — O modo balcão deve suportar geração de senha e painel de chamada
- **RF43** — O sistema deve notificar pedido pronto adaptando-se ao método de atendimento ativo

### Requisitos Não Funcionais (RNF)

- **RNF01** — Toda a infraestrutura deve rodar em Docker
- **RNF02** — O backend deve ser modular por domínio
- **RNF03** — A comunicação REST será usada em toda a API
- **RNF04** — gRPC será usado exclusivamente para o stream de localização em tempo real (mapa de entregas)
- **RNF05** — WebSocket ou SSE será usado para status de mesas em tempo real (Modo Restaurante)
- **RNF06** — O sistema deve usar TypeScript no frontend e backend
- **RNF07** — O código deve ser comentado para fins didáticos
- **RNF08** — O cardápio QR Code deve carregar em menos de 2 segundos em conexão 4G (PWA)
- **RNF09** — A composição recursiva de itens deve detectar e bloquear dependências circulares
- **RNF10** — Alteração de custo de insumo deve disparar recálculo em cascata em todos os compostos que o utilizam

---

## 🎨 Fase 2 — Design de Telas (Figma)

As telas são projetadas no **Figma** seguindo quatro etapas antes do código:

```
Briefing de Projeto
      ↓
Fluxo de Navegação (Navigation Flow)  ←  FigJam
      ↓
Wireframe de Baixa Fidelidade         ←  Figma Design
      ↓
Mockup de Alta Fidelidade             ←  Figma Design
```

### Atores e Telas Previstas

| Ator | Qtd de Telas |
|---|---|
| **Cliente** | 13 telas |
| **Comércio** | 9 telas + módulo Modo Restaurante |
| **Entregador** | 8 telas |
| **Administrador** | 6 telas |
| **Cardápio QR (sem login)** | 5 telas |
| **Painel Garçom** | 5 telas |

### Telas Principais por Ator

| Tela | Ator | Descrição |
|---|---|---|
| **Login / Register** | Todos | Autenticação e cadastro |
| **Dashboard** | Todos | Visão geral personalizada por role |
| **Cadastro de Item** | Comércio | Criar item simples, composto, serviço ou combo |
| **Montagem de Composição** | Comércio | Interface BOM — adicionar/remover componentes |
| **Gestão de Estoque** | Comércio | Entradas de nota branca e NF simplificada |
| **Fornecedores** | Comércio | Cadastro e histórico de compras |
| **Categorias e Impostos** | Comércio | Configuração de tributação por nível |
| **Mapa de Entregas** | Entregador/Admin | Rastreamento em tempo real via gRPC |
| **Mapa de Mesas** | Garçom | Painel visual do salão com status |
| **Comanda da Mesa** | Garçom | Itens, quantidades, total e fechamento |
| **Cardápio QR Code** | Cliente (PWA) | Acesso público sem login via QR |
| **Painel de Chamada** | Balcão | Exibição de senhas chamadas |

> 🔗 Link do Figma: *(será adicionado após o design)*

---

## 🧩 Fase 3 — Modelagem UML

Após o design, modelamos as **entidades e funções** do sistema com UML antes de codificar.

### Diagramas Previstos

| Diagrama | Ferramenta | Finalidade |
|---|---|---|
| **Casos de Uso** | Draw.io | O que cada ator pode fazer no sistema |
| **Diagrama de Classes** | Draw.io | Entidades, atributos e relacionamentos |
| **Diagrama de Sequência** | Draw.io | Fluxo de uma requisição (login, pedido, composição de item) |
| **Diagrama de Componentes** | Draw.io | Como os módulos se comunicam internamente |

> 🔗 Diagramas completos: *(serão adicionados no Draw.io)*

### Entidades Principais (prévia)

```
Usuario
---------------------------------
- id: int
- nome: String
- email: String
- senha: String (hash)
- role: Enum(cliente, comerciante, entregador, garcom, admin)
---------------------------------
+ autenticar(): boolean
+ atualizarPerfil(): void

Item (universal — produto, serviço, composto ou combo)
---------------------------------
- id: int
- comercioId: int
- categoriaId: int
- nome: String              ← nome livre
- tipo: Enum(simples, composto, servico, combo)
- unidadeMedida: String     ← g, kg, ml, un, h, m², pitada, saco...
- precoVenda: Numeric
- custoCalculado: Numeric   ← calculado automaticamente (bottom-up)
- margemBruta: Numeric      ← gerada automaticamente
- margemLiquida: Numeric    ← após impostos
- impostos: JSONB
- attributes: JSONB         ← atributos livres (sabor, lote, validade, etc.)
- estoque: Numeric
- estoqueMinimo: Numeric
- rendimento: Numeric       ← para receitas (ex: 10 pães por receita)
- rendimentoUn: String
---------------------------------
+ calcularCusto(): Numeric
+ calcularMargem(): Numeric
+ calcularPrecoSugerido(margemDesejada: Numeric): Numeric
+ baixarEstoque(qtd: Numeric, un: String): void
+ atualizarEstoque(qtd: Numeric): void

ComponenteItem (BOM recursivo)
---------------------------------
- id: int
- itemPaiId: int            ← item que é composto
- itemComponenteId: int     ← insumo ou serviço utilizado
- quantidade: Numeric
- unidadeMedida: String
- observacao: String

Categoria
---------------------------------
- id: int
- comercioId: int
- nome: String              ← livre (ex: "Mirabolante", "Plano Família")
- impostosPadrao: JSONB     ← herança para todos os itens da categoria
---------------------------------
+ herdarImpostos(item: Item): void

Fornecedor
---------------------------------
- id: int
- comercioId: int
- nome: String
- cnpjCpf: String
- telefone: String
- email: String

EntradaEstoque
---------------------------------
- id: int
- fornecedorId: int
- tipo: Enum(nota_branca, nf_simplificada)
- numeroNota: String        ← opcional (nota branca pode ser null)
- dataEntrada: DateTime
- itens: EntradaItem[]
- total: Numeric
---------------------------------
+ registrar(): void
+ atualizarCustoItens(): void

Comercio
---------------------------------
- id: int
- userId: int
- nome: String
- tipo: Enum(mercado, restaurante, lanchonete, bar, farmacia, padaria, materiais, servicos, outro)
- segmento: String
- modoRestaurante: boolean
- metodosAtendimento: JSONB ← { garcom: bool, qrcode: bool, balcao: bool }
- impostoPadrao: JSONB
---------------------------------
+ ativarModoRestaurante(): void
+ configurarMetodos(metodos: JSONB): void

Mesa
---------------------------------
- id: int
- comercioId: int
- numero: int
- capacidade: int
- status: Enum(livre, ocupada, aguardando_pedido, conta_solicitada)
- qrCodeUrl: String
---------------------------------
+ gerarQrCode(): String
+ abrirComanda(): Comanda
+ fecharComanda(): void

Comanda
---------------------------------
- id: int
- mesaId: int
- status: Enum(aberta, fechada, cancelada)
- itens: PedidoItem[]
- total: Numeric
- aberturaEm: DateTime
---------------------------------
+ adicionarItem(item: Item, qtd: Numeric): void
+ calcularTotal(): Numeric
+ solicitarConta(): void

Entrega
---------------------------------
- id: int
- pedidoId: int
- entregadorId: int
- status: String
- localizacao: JSONB
---------------------------------
+ atualizarStatus(status: String): void
+ streamLocalizacao(lat: Numeric, lng: Numeric): void   ← via gRPC
```

---

## 🏗️ Fase 4 — Arquitetura (C4 Model)

O sistema é documentado nos **4 níveis do C4 Model**:

```
Nível 1 — Contexto    → Quem usa e com o que o sistema se comunica
Nível 2 — Containers  → Quais partes compõem o sistema (React, Node, Kafka...)
Nível 3 — Componentes → Como cada container está organizado internamente
Nível 4 — Código      → Classes, interfaces e dependências (UML)
```

### Nível 1 — Contexto

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Project Market System                           │
│                                                                      │
│  Clientes ─────────────────────────────────────────► [Sistema]       │
│  Comerciantes (qualquer segmento) ─────────────────► [Sistema]       │
│  Entregadores ─────────────────────────────────────► [Sistema]       │
│  Garçons ──────────────────────────────────────────► [Sistema]       │
│  Administradores ──────────────────────────────────► [Sistema]       │
│  Clientes via QR Code (sem login) ─────────────────► [Sistema]       │
│                                                                      │
│  [Sistema] ──► WhatsApp (n8n + IA)                                   │
│  [Sistema] ──► E-mail (n8n)                                          │
│  [Sistema] ──► Serviço de QR Code                                    │
└──────────────────────────────────────────────────────────────────────┘
```

### Nível 2 — Containers

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Project Market System                          │
│                                                                      │
│  [React Frontend] ─── REST ───► [Nginx] ───► [Backend Node.js]      │
│  [Cardápio QR PWA] ── REST ───► [Nginx] ───► [Backend Node.js]      │
│                                                     │                │
│                          gRPC (só localização)      │                │
│  [Mapa de Entregas] ◄───────────────────────────────┘                │
│                                                     │                │
│                          WebSocket/SSE (mesas)      │                │
│  [Painel Garçom] ◄──────────────────────────────────┘                │
│                                                     │                │
│                                       ┌─────────────┴──────────┐     │
│                                       │  PostgreSQL 16 (JSONB)  │     │
│                                       │  Redis (cache + JWT)    │     │
│                                       │  Kafka (eventos)        │     │
│                                       └────────────────────────┘     │
│  [n8n] ◄──── eventos Kafka ──── [Backend]                            │
│  [WhatsApp] → [n8n] → [Gemini/GPT] → resposta automática             │
└──────────────────────────────────────────────────────────────────────┘
```

> 🔗 Diagramas completos dos níveis 3 e 4: *(serão adicionados no Draw.io)*

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript |
| Cardápio QR Code | React PWA (público, sem login) |
| Backend | Node.js + Express + TypeScript |
| Comunicação principal | REST API |
| Comunicação de localização | gRPC *(exclusivo para stream do mapa de entregas)* |
| Status mesas em tempo real | WebSocket ou SSE *(Modo Restaurante)* |
| Mensageria | Apache Kafka |
| Banco de Dados | PostgreSQL 16 (JSONB) |
| Cache / JWT | Redis |
| Autenticação | JWT + OAuth |
| Automações | n8n |
| Atendimento IA | n8n + Gemini/GPT + WhatsApp |
| Proxy / Roteamento | Nginx |
| Infraestrutura | Docker + Docker Compose |
| Design | Figma (telas) + FigJam (fluxos de navegação) |
| Modelagem | Draw.io (UML + C4 Model) |

---

## 🤖 Automações com n8n

O n8n é responsável por todos os fluxos automáticos do sistema, acionados por eventos do Kafka ou por agendamento.

### 1. 📦 E-mail de Confirmação de Pedido
**Gatilho:** Kafka recebe evento `pedido.criado`
```
Kafka (pedido.criado) → n8n → formata dados do pedido → envia e-mail ao cliente
```

### 2. ⚠️ Alerta de Estoque Baixo
**Gatilho:** Kafka recebe evento `item.estoque_baixo`
```
Kafka (item.estoque_baixo) → n8n → verifica quantidade → envia e-mail/Telegram ao comerciante
```

### 3. 📊 Relatório Diário de Vendas
**Gatilho:** Agendado todos os dias às 8h
```
Schedule (08:00) → n8n → consulta API de vendas do dia → monta relatório → envia por e-mail ao comerciante
```

### 4. 🔁 Recálculo de Custo em Cascata
**Gatilho:** Kafka recebe evento `item.custo_atualizado`
```
Kafka (item.custo_atualizado) → n8n → busca compostos que usam este item
                              → dispara recálculo em cadeia via API
                              → alerta comerciante se margem cair abaixo do mínimo
```

### 5. 🍽️ Notificação de Pedido Pronto (Modo Restaurante)
**Gatilho:** Cozinha atualiza status do pedido para "pronto"
```
Kafka (pedido.pronto) → n8n → verifica método de atendimento ativo
  → QR Code:  notifica cliente via WebSocket na tela do cardápio
  → Balcão:   atualiza painel de chamada de senhas
  → Garçom:   push no painel do garçom para entregar na mesa
```

### 6. 🤖 Atendimento Inteligente via WhatsApp + IA
**Gatilho:** Cliente envia mensagem no WhatsApp
```
WhatsApp → n8n → analisa mensagem
                    ↓
          IA (Gemini/GPT) responde dúvidas simples
          (produtos, status de pedido, preços, cardápio)
                    ↓
          Se complexo → encaminha para atendente humano
```
> Esta automação elimina atendimentos repetitivos e garante resposta imediata 24h.

---

## 📋 Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)
- [pgAdmin 4](https://www.pgadmin.org/download/pgadmin-4-windows/) *(interface visual do banco)*
- [Figma](https://figma.com/) *(design de telas)*
- [FigJam](https://figma.com/figjam/) *(fluxos de navegação)*
- [Draw.io](https://app.diagrams.net/) *(modelagem UML e C4)*

---

## 🚀 Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/project-market-system.git
cd project-market-system
```

### 2. Suba toda a infraestrutura

```bash
docker-compose up -d
```

> Na primeira vez o Docker vai baixar todas as imagens. Pode demorar alguns minutos.

### 3. Verifique se os containers estão rodando

```bash
docker ps
```

### 4. Quer subir só o banco por enquanto?

```bash
docker-compose up -d postgres redis
```

---

## 🌐 Endereços dos Serviços

| Serviço | URL | Descrição |
|---|---|---|
| Frontend | `http://localhost` | Interface React principal |
| Backend API | `http://localhost/api` | REST API Node.js |
| Cardápio QR | `http://localhost/cardapio/{slug}/mesa/{numero}` | Acesso público sem login |
| n8n | `http://localhost:5678` | Painel de automações |
| pgAdmin | `localhost:5432` | Conectar via pgAdmin |

---

## 🐳 Arquitetura de Containers

```
Docker
├── nginx        → Porta 80 — roteia frontend, backend e cardápio QR
├── frontend     → React (porta 3000 interna)
├── backend      → Node.js + Express (porta 4000) + gRPC localização (porta 50051) + WS mesas (porta 4001)
├── postgres     → Banco de dados (porta 5432)
├── redis        → Cache e controle de tokens JWT (porta 6379)
├── n8n          → Automações e atendimento IA (porta 5678)
├── zookeeper    → Gerenciador do Kafka
└── kafka        → Mensageria entre serviços (porta 9092 interna)
```

---

## 🗄️ Banco de Dados

### Conexão (pgAdmin)

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Porta | `5432` |
| Banco | `market_db` |
| Usuário | `market_user` |
| Senha | `market_pass` |

### Tabelas Principais

```sql
-- Item universal: produto simples, composto, serviço ou combo
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

-- Composição BOM recursivo
CREATE TABLE item_componentes (
    id                  SERIAL PRIMARY KEY,
    item_pai_id         INTEGER NOT NULL REFERENCES items(id),
    item_componente_id  INTEGER NOT NULL REFERENCES items(id),
    quantidade          NUMERIC(12,4) NOT NULL,
    unidade_medida      VARCHAR(20) NOT NULL,
    observacao          VARCHAR(300),
    CHECK (item_pai_id <> item_componente_id)
);

-- Categorias com nome livre e impostos padrão
CREATE TABLE categorias (
    id               SERIAL PRIMARY KEY,
    comercio_id      INTEGER NOT NULL REFERENCES comercios(id),
    nome             VARCHAR(150) NOT NULL,
    descricao        TEXT,
    impostos_padrao  JSONB NOT NULL DEFAULT '{}'
);

-- Fornecedores
CREATE TABLE fornecedores (
    id          SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL REFERENCES comercios(id),
    nome        VARCHAR(200) NOT NULL,
    cnpj_cpf    VARCHAR(20),
    telefone    VARCHAR(20),
    email       VARCHAR(150)
);

-- Entradas de estoque (nota branca ou NF simplificada)
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

-- Comércios com tipo e configurações
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

-- Mesas (Modo Restaurante)
CREATE TABLE mesas (
    id          SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL REFERENCES comercios(id),
    numero      INTEGER NOT NULL,
    capacidade  INTEGER NOT NULL DEFAULT 4,
    status      VARCHAR(30) NOT NULL DEFAULT 'livre',
    qr_code_url TEXT,
    UNIQUE (comercio_id, numero)
);

-- Comandas por mesa
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

## 📁 Estrutura do Projeto

Arquitetura **modular por domínio** — cada funcionalidade é independente e contém todos os seus próprios arquivos.

```
project-market-system/
├── docker-compose.yml
├── README.md
│
├── nginx/
│   └── nginx.conf
│
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   └── auth.routes.ts
│       │   ├── users/
│       │   │   ├── user.model.ts
│       │   │   ├── user.repository.ts
│       │   │   ├── user.service.ts
│       │   │   ├── user.controller.ts
│       │   │   └── user.routes.ts
│       │   ├── comercios/
│       │   │   ├── comercio.model.ts
│       │   │   ├── comercio.service.ts
│       │   │   ├── comercio.controller.ts
│       │   │   └── comercio.routes.ts
│       │   ├── categorias/
│       │   │   ├── categoria.model.ts
│       │   │   ├── categoria.service.ts
│       │   │   └── categoria.routes.ts
│       │   ├── items/                        # Sistema de composição (BOM recursivo)
│       │   │   ├── item.model.ts
│       │   │   ├── item.repository.ts
│       │   │   ├── item.service.ts           # Cálculo de custo bottom-up + detecção de loop
│       │   │   ├── item.controller.ts
│       │   │   └── item.routes.ts
│       │   ├── componentes/                  # Relacionamento item ↔ componente
│       │   │   ├── componente.model.ts
│       │   │   ├── componente.service.ts
│       │   │   └── componente.routes.ts
│       │   ├── estoque/                      # Entradas, notas, fornecedores
│       │   │   ├── estoque.model.ts
│       │   │   ├── estoque.service.ts
│       │   │   ├── estoque.controller.ts
│       │   │   └── estoque.routes.ts
│       │   ├── fornecedores/
│       │   │   ├── fornecedor.model.ts
│       │   │   ├── fornecedor.service.ts
│       │   │   └── fornecedor.routes.ts
│       │   ├── impostos/                     # Regras e cálculo de impostos
│       │   │   ├── imposto.service.ts
│       │   │   └── imposto.routes.ts
│       │   ├── orders/
│       │   │   ├── order.model.ts
│       │   │   ├── order.service.ts
│       │   │   ├── order.controller.ts
│       │   │   └── order.routes.ts
│       │   ├── deliveries/
│       │   │   ├── delivery.model.ts
│       │   │   ├── delivery.repository.ts
│       │   │   ├── delivery.service.ts
│       │   │   ├── delivery.controller.ts
│       │   │   ├── delivery.routes.ts
│       │   │   └── delivery.grpc.ts          # Stream de localização via gRPC
│       │   └── restaurant/                   # Modo Restaurante
│       │       ├── mesa.model.ts
│       │       ├── mesa.repository.ts
│       │       ├── mesa.service.ts
│       │       ├── mesa.controller.ts
│       │       ├── mesa.routes.ts
│       │       ├── comanda.model.ts
│       │       ├── comanda.service.ts
│       │       ├── qrcode.service.ts         # Geração de QR Codes por mesa
│       │       └── mesa.gateway.ts           # WebSocket/SSE — status das mesas
│       ├── shared/
│       │   ├── middlewares/
│       │   │   └── auth.middleware.ts
│       │   ├── database/
│       │   │   └── connection.ts
│       │   ├── redis/
│       │   │   └── redis.client.ts
│       │   ├── kafka/
│       │   │   ├── producer.ts
│       │   │   └── consumer.ts
│       │   ├── grpc/
│       │   │   └── server.ts                 # Servidor gRPC exclusivo para localização
│       │   └── errors/
│       │       └── AppError.ts
│       └── app.ts
│
└── frontend/
    ├── Dockerfile
    └── src/
        ├── modules/
        │   ├── auth/
        │   │   ├── LoginPage.tsx
        │   │   ├── RegisterPage.tsx
        │   │   └── auth.service.ts
        │   ├── items/                        # Cadastro e composição de itens
        │   │   ├── ItemListPage.tsx
        │   │   ├── ItemFormPage.tsx          # Simples, composto, serviço ou combo
        │   │   ├── ItemComposicaoPage.tsx    # Interface BOM visual
        │   │   └── item.service.ts
        │   ├── estoque/
        │   │   ├── EstoqueEntradaPage.tsx
        │   │   ├── FornecedorListPage.tsx
        │   │   └── estoque.service.ts
        │   ├── impostos/
        │   │   ├── ImpostosConfigPage.tsx
        │   │   └── imposto.service.ts
        │   ├── deliveries/
        │   │   ├── DeliveryMapPage.tsx       # Mapa com stream gRPC de localização
        │   │   └── delivery.service.ts
        │   └── restaurant/                   # Modo Restaurante
        │       ├── MesaMapPage.tsx           # Mapa visual do salão
        │       ├── ComandaPage.tsx           # Comanda por mesa
        │       ├── QrCodeManagerPage.tsx     # Geração e impressão de QR Codes
        │       └── BalcaoPainelPage.tsx      # Painel de chamada de senhas
        ├── cardapio-qr/                      # App público sem login (PWA)
        │   ├── CardapioPage.tsx              # Cardápio acessado pelo QR Code
        │   ├── PedidoQrPage.tsx             # Pedido pelo celular
        │   └── StatusPedidoQrPage.tsx        # Acompanhamento pelo celular
        └── shared/
            ├── components/
            │   ├── Button.tsx
            │   ├── Input.tsx
            │   └── Badge.tsx
            └── api/
                └── axios.config.ts
```

---

## 📌 Roadmap

### ✅ Fase 0 — Instalação e Configuração
- [x] Docker Desktop instalado e funcionando
- [x] PostgreSQL 16 no Docker
- [x] pgAdmin conectado ao banco
- [x] Docker Compose com todos os serviços (Nginx, Redis, Kafka, n8n)

### 🎨 Fase 1 — Briefing e Design (Figma + FigJam)
- [ ] Documento de visão do produto
- [ ] Levantamento de requisitos funcionais e não funcionais
- [ ] Fluxo de navegação — Cliente (FigJam)
- [ ] Fluxo de navegação — Comércio + cadastro de item (FigJam)
- [ ] Fluxo de navegação — Garçom (FigJam)
- [ ] Fluxo de navegação — Entregador (FigJam)
- [ ] Wireframes de baixa fidelidade
- [ ] Mockups de alta fidelidade
- [ ] Mockup Cardápio QR Code (PWA pública)

### 🧩 Fase 2 — Modelagem (UML + C4 Model)
- [ ] Diagrama de Casos de Uso (todos os atores)
- [ ] Diagrama de Classes (foco na composição recursiva de itens)
- [ ] Diagrama de Sequência (pedido QR, composição de item, entrada de estoque)
- [ ] Diagrama de Componentes (como os módulos se comunicam)
- [ ] C4 Model — Nível 1 (Contexto)
- [ ] C4 Model — Nível 2 (Containers)
- [ ] C4 Model — Nível 3 (Componentes)

### 🗄️ Fase 3 — Banco de Dados
- [x] Tabela `items` com JSONB e geração de margem
- [ ] Tabela `item_componentes` (BOM recursivo)
- [ ] Tabela `categorias` com impostos padrão
- [ ] Tabela `fornecedores`
- [ ] Tabela `entradas_estoque` e `entradas_estoque_itens`
- [ ] Tabela `users` com roles
- [ ] Tabela `comercios` com tipo e configuração
- [ ] Tabela `mesas` e `comandas`
- [ ] Tabela `deliveries`
- [ ] Trigger para recálculo de custo em cascata
- [ ] Testar queries CRUD em todas as tabelas

### ⚙️ Fase 4 — Backend (REST API)
- [ ] Estrutura de pastas modular por domínio
- [ ] Conexão com PostgreSQL e Redis
- [ ] Módulo `items` com cálculo recursivo e detecção de dependência circular
- [ ] Módulo `componentes` (CRUD de composição BOM)
- [ ] Módulo `estoque` (nota branca + NF simplificada)
- [ ] Módulo `impostos` (cálculo e herança por categoria)
- [ ] CRUD de produtos/itens (GET, POST, PUT, DELETE)
- [ ] Registro e Login com JWT + OAuth
- [ ] Middleware de autenticação
- [ ] Módulo Modo Restaurante (mesas, comandas, QR Code, WebSocket)
- [ ] Eventos Kafka (pedido criado, estoque baixo, custo atualizado, pedido pronto)
- [ ] Stream de localização via gRPC

### 🖥️ Fase 5 — Frontend (React)
- [ ] Telas de Login/Register (todos os atores)
- [ ] Cadastro de Item (simples, composto, serviço, combo)
- [ ] Interface de montagem de composição BOM (visual)
- [ ] Gestão de Estoque e Fornecedores
- [ ] Configuração de Categorias e Impostos
- [ ] Dashboard com margens, alertas e análise de custo
- [ ] Integração com a API (Axios + token JWT)
- [ ] Modo Restaurante completo (mesas, comandas, QR, balcão)
- [ ] Cardápio QR Code (PWA público)
- [ ] Mapa de entregas em tempo real (gRPC)

### 🤖 Fase 6 — Automações n8n
- [ ] E-mail de confirmação de pedido
- [ ] Alerta de estoque baixo
- [ ] Recálculo de custo em cascata com alerta de margem
- [ ] Relatório diário de vendas por e-mail
- [ ] Notificação de pedido pronto (multi-método)
- [ ] Atendimento inteligente via WhatsApp + IA (Gemini/GPT)

---

## 🐳 Comandos Docker Úteis

```bash
# Subir tudo
docker-compose up -d

# Subir só o banco e redis
docker-compose up -d postgres redis

# Verificar containers em execução
docker ps

# Parar tudo
docker-compose down

# Parar e apagar todos os dados ⚠️
docker-compose down -v

# Ver logs de um serviço específico
docker logs market-db
docker logs market-backend
docker logs market-kafka

# Rebuild após alterar código
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

---

## 📚 Conceitos Aplicados

- **Engenharia de Requisitos** — levantamento e documentação de RF e RNF antes do desenvolvimento
- **BOM Recursivo (Bill of Materials)** — composição de itens em múltiplos níveis com cálculo de custo automático bottom-up e detecção de dependência circular via DFS
- **Figma + FigJam** — design de telas do briefing até o mockup de alta fidelidade; FigJam para fluxos de navegação, Figma Design para wireframes e mockups
- **UML** — modelagem de casos de uso, classes, sequência e componentes antes de codificar
- **C4 Model** — arquitetura do sistema em 4 níveis (contexto, containers, componentes, código)
- **Arquitetura Modular** — cada domínio é independente com seu próprio model, repository, service, controller e routes
- **JSONB** — atributos livres de itens, configurações de impostos e métodos de atendimento sem schema rígido, com suporte a índices e buscas no PostgreSQL
- **Trigger PostgreSQL** — recálculo em cascata do custo ao atualizar insumos, mantendo consistência automática
- **Multi-tenant** — múltiplos comércios com isolamento de dados por `comercio_id`
- **Docker Compose** — orquestração de múltiplos containers para ambiente de desenvolvimento reproduzível
- **JWT + OAuth** — autenticação stateless via token com suporte a provedores externos; Redis para invalidação no logout
- **Redis** — cache de consultas frequentes e controle de tokens JWT
- **REST API** — padrão principal de comunicação entre frontend e backend
- **gRPC** — usado exclusivamente para stream de localização em tempo real no mapa de entregas
- **WebSocket / SSE** — status de mesas em tempo real para o painel do garçom (Modo Restaurante)
- **Kafka** — mensageria assíncrona para eventos entre módulos (pedido criado, estoque baixo, custo atualizado, pedido pronto)
- **Nginx** — reverse proxy que roteia requisições para os serviços corretos
- **PWA** — cardápio QR Code acessível no navegador mobile sem instalação de app
- **n8n** — automação de fluxos: confirmação de pedido, alerta de estoque, recálculo de custo, relatório diário e atendimento via WhatsApp com IA
