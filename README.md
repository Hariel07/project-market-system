# 🛒 Market System

> **Plataforma SaaS de delivery e gestão para comércios locais.**
> Desenvolvido por **Hariel Soares Maran** como produto próprio — iniciando pela cidade natal e expandindo para demais regiões do Brasil através da venda de planos mensais a comércios locais.

Plataforma multi-segmento que cobre do delivery online com rastreamento GPS ao PDV físico, emissão fiscal, RH, procurement, localização física de estoque, promoções agendadas, impressão de etiquetas e atendimento com IA. O cliente faz o pedido pelo app, o entregador recebe a corrida no celular com navegação real, e o dono acompanha tudo no painel.

> 💡 **Este projeto é também uma base de conhecimento.**
> Construído seguindo o processo completo de Engenharia de Software — do briefing até o código — com o objetivo de documentar, de forma detalhada e didática, todas as decisões de arquitetura, requisitos e estrutura. A ideia é que qualquer pessoa consiga entender não só **o que** o sistema faz, mas **por que** cada decisão foi tomada.

---

## 🌍 Por que este projeto existe

Comércios locais precisam de tecnologia para competir — mas os sistemas existentes são caros, fechados e não foram feitos pensando no dono de padaria, de mercadinho ou de distribuidora de bebidas.

Este projeto resolve isso. Um único sistema onde o comerciante cadastra seus produtos, o cliente faz pedidos pelo celular e o entregador cumpre a corrida com GPS real — tudo integrado, sem depender de terceiros para cada funcionalidade. O modelo é SaaS: o comerciante paga um plano mensal e acessa tudo. A plataforma começa em uma cidade e expande para qualquer região do Brasil.

---

## 🎯 Segmentos Atendidos

| Segmento | Exemplos de uso |
|---|---|
| 🛒 Mercados | Catálogo, estoque, PDV, NF-e, etiquetas de gôndola, promoções |
| 🍔 Restaurantes e Lanchonetes | Cardápio digital, comandas, garçom, QR Code de mesa, PDV |
| 🍺 Bares | Comandas, controle de bebidas, happy hour, caixa |
| 💊 Farmácias | Lote, validade, FEFO, impostos, NFC-e, etiquetas adesivas |
| 🥖 Padarias | Receitas, produção, controle de perdas, validade, promoções |
| 🥬 Hortifruti | Catálogo por kg, preços dinâmicos, promoções sazonais |
| 🍺 Distribuidoras de Bebidas | Catálogo, entrega, promoção por caixa/grade |
| 🔨 Materiais de Construção | Kits, composição, venda por medida, NF-e |
| ⚙️ Serviços | Planos, combos, procurement de serviços |
| 🏢 Qualquer negócio com equipe | RH, admissão, rescisão, controle de funcionários |

---

## 💳 Planos de Assinatura

| Plano | Preço | Itens no catálogo | PDVs |
|---|---|---|---|
| Grátis | R$ 0/mês | Até 50 | 1 |
| Pro | R$ 99,90/mês | Ilimitados | 3 |
| Enterprise | R$ 299,90/mês | Ilimitados | Ilimitados |

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

> 💡 Código sem processo gera retrabalho. Esta sequência garante que cada linha escrita tem um motivo documentado.

---

## 👥 Atores do Sistema

| Ator | Tipo | Descrição |
|---|---|---|
| **Cliente** | Externo | Compra via app — navega, adiciona ao carrinho, paga e rastreia |
| **Comerciante (Dono)** | Interno — Nível 5 | Acesso total ao sistema do comércio |
| **Funcionário Gerente** | Interno — Nível 4 | Acesso total exceto configurações críticas |
| **Funcionário Estoque** | Interno — Nível 3 | Itens, fornecedores, entradas, compras, localização |
| **Funcionário Caixa** | Interno — Nível 2 | PDV, caixa, emissão fiscal, etiquetas |
| **Funcionário Garçom** | Interno — Nível 1 | Mapa de mesas, comandas |
| **Fornecedor** | Externo parceiro | Portal de pedidos de compra e envio de NF |
| **Entregador** | Externo | Aceita e realiza entregas com rastreamento GPS real |
| **Administrador** | Plataforma | Gestão global de todos os comércios e planos |

---

## 🔐 Sistema de Permissões por Nível

> 💡 Com permissões granulares e perfis pré-definidos, o comerciante pode criar um "Caixa do turno da manhã" com acesso a um PDV específico sem escrever código novo.

```
Nível 5 — Dono         Tudo. Sem restrição.
Nível 4 — Gerente      Tudo exceto: excluir comércio, dados fiscais, RH completo
Nível 3 — Estoque      Itens · BOM · Fornecedores · Entradas · Procurement
                        Localização física · Validade/Lote · Etiquetas
Nível 2 — Caixa        PDV (1 ou mais) · Caixa · NFC-e · Vendas · Etiquetas · Promoções (leitura)
Nível 1 — Garçom       Mapa de mesas · Comandas · Lançar pedidos

✅ Perfis são pré-definidos mas 100% customizáveis por item de permissão
✅ Um funcionário pode ter múltiplos perfis simultâneos
✅ Um Account (CPF) pode ter perfis em múltiplos comércios (SSO)
✅ Permissões podem ser restritas a PDVs e locais físicos específicos
```

---

## 🏗️ Stack Tecnológica

| Camada | Tecnologia | Por que |
|---|---|---|
| Backend | Node.js + Express + TypeScript | Ecossistema maduro, tipagem forte, performance adequada para SaaS |
| ORM | Prisma | Migrations automáticas, type-safety, excelente DX |
| Banco | PostgreSQL | Suporte nativo a JSONB, CTEs recursivas, triggers — tudo que o sistema precisa |
| Frontend | React + TypeScript + Vite | Componentização, ecossistema, build rápido |
| Roteamento | React Router v6 | Padrão do mercado para SPAs React |
| HTTP | Axios | Interceptors para JWT automático em todas as requisições |
| Mapas | Leaflet + OpenStreetMap | Open source, sem custo de API, funciona offline com tiles cacheados |
| Autenticação | JWT (Bearer Token) | Stateless, escala horizontal sem sessão no servidor |
| Futuramente | Redis | Cache de GPS em tempo real e sessões |
| Futuramente | Kafka | Eventos assíncronos (promoção iniciando, entrega concluída) |
| Futuramente | gRPC | Stream de GPS para mapa de rastreamento em tempo real |
| Futuramente | n8n | Automações visuais sem deploy de código |
| Futuramente | Docker Compose | Ambiente reproduzível em qualquer máquina |

---

## 🗂️ Estrutura do Projeto

```
project-market-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelos e relações do banco
│   │   └── seed.ts              # Dados iniciais (contas, comércios, produtos)
│   └── src/
│       ├── controllers/         # Lógica de negócio por domínio
│       ├── middlewares/         # authMiddleware (JWT) + roleMiddleware (RBAC)
│       ├── routes/              # Registro de endpoints por módulo
│       └── server.ts            # Entry point — Express + middlewares globais
└── frontend/
    └── src/
        ├── modules/
        │   ├── auth/            # Login, cadastro, seleção de perfil (SSO)
        │   ├── cliente/         # App do consumidor
        │   ├── comerciante/     # Painel do lojista
        │   ├── entregador/      # App do entregador (mobile-first)
        │   └── admin/           # Painel da plataforma
        ├── contexts/            # CartContext (carrinho local)
        ├── data/                # Tipos compartilhados e dados mock de apoio
        ├── lib/                 # Instância Axios com interceptor JWT automático
        └── shared/              # Componentes reutilizáveis (TopBar, BottomNav...)
```

---

## 🗃️ Modelos de Banco (Prisma)

| Model | Descrição |
|---|---|
| `Account` | Identidade SSO — um CPF pode ter múltiplos perfis em múltiplos comércios |
| `User` | Perfil com role: CLIENTE · DONO · GERENTE · ESTOQUE · CAIXA · GARCOM · ENTREGADOR · ADMIN |
| `Address` | Endereços de usuários e comércios, com coordenadas lat/lng para GPS |
| `Commerce` | Dados do comércio: plano, taxa de entrega, segmento, horário, isOpen |
| `SubscriptionPlan` | Planos Grátis / Pro / Enterprise com limites de itens e PDVs |
| `Category` | Categorias de produtos por comércio |
| `Product` | Catálogo com preço, preço promocional, estoque e unidade de medida |
| `Order` | Pedido com status, itens, forma de pagamento e endereço de entrega |
| `OrderItem` | Itens do pedido com preço unitário congelado no momento da compra |
| `Delivery` | Entrega vinculada ao pedido — status, entregador, timestamps de coleta e entrega |
| `DeliveryGPS` | Histórico de coordenadas GPS por entrega (lat, lng, velocidade, precisão) |
| `PlatformConfig` | Configurações globais da plataforma — singleton |

---

## 🔌 API — Endpoints Implementados

### Auth
```
POST /api/auth/cadastro          Criar conta (Account + User)
POST /api/auth/login             Login por CPF + senha → token direto ou lista de perfis
POST /api/auth/select-profile    Selecionar perfil (SSO multi-comércio)
```

### Comércios
```
GET  /api/comercios/public          Listar comércios ativos (público — vitrine do cliente)
GET  /api/comercios/:id/produtos    Listar produtos de um comércio (público)
GET  /api/comercios/me              Dados do comércio do usuário logado
PUT  /api/comercios/me              Atualizar dados do comércio
```

### Produtos (painel do comerciante)
```
GET    /api/produtos         Listar produtos do comércio       (DONO · GERENTE · ESTOQUE · CAIXA)
GET    /api/produtos/:id     Buscar produto por ID             (DONO · GERENTE · ESTOQUE · CAIXA)
POST   /api/produtos         Criar produto                     (DONO · GERENTE)
PUT    /api/produtos/:id     Atualizar produto                 (DONO · GERENTE · ESTOQUE)
DELETE /api/produtos/:id     Deletar produto                   (DONO)
```

### Categorias
```
GET    /api/categorias         Listar categorias    (DONO · GERENTE · ESTOQUE)
POST   /api/categorias         Criar categoria      (DONO · GERENTE)
PUT    /api/categorias/:id     Atualizar            (DONO · GERENTE)
DELETE /api/categorias/:id     Deletar              (DONO)
```

### Pedidos
```
POST /api/pedidos         Criar pedido — valida produtos, cria Delivery automaticamente  (CLIENTE)
GET  /api/pedidos/meus    Listar pedidos do cliente logado                               (CLIENTE)
GET  /api/pedidos/:id     Buscar pedido por ID com entregador                            (CLIENTE · DONO · ADMIN)
```

### Entregas
```
GET  /api/entregas/oportunidades              Corridas disponíveis                (ENTREGADOR · ADMIN)
GET  /api/entregas/pedido/:pedidoId           Dados completos da entrega          (ENTREGADOR · ADMIN)
GET  /api/entregas/entregador/:entregadorId   Entregas ativas do entregador       (ENTREGADOR · ADMIN)
POST /api/entregas/:id/aceitar                Aceitar corrida → A_CAMINHO_COLETA  (ENTREGADOR)
POST /api/entregas/:id/rejeitar               Recusar corrida                     (ENTREGADOR)
POST /api/entregas/:id/coleta                 Confirmar coleta → SAIU_ENTREGA     (ENTREGADOR)
POST /api/entregas/:id/entregar               Confirmar entrega → ENTREGUE        (ENTREGADOR)
POST /api/entregas/:id/gps                    Enviar coordenadas GPS (persiste)   (ENTREGADOR)
```

### Perfil
```
PUT    /api/perfil                         Atualizar dados do perfil
GET    /api/perfil/enderecos               Listar endereços do usuário
POST   /api/perfil/enderecos               Criar endereço
PUT    /api/perfil/enderecos/:id           Atualizar endereço
PUT    /api/perfil/enderecos/:id/principal Definir endereço principal
DELETE /api/perfil/enderecos/:id           Remover endereço
```

### Planos e Config
```
GET  /api/public/planos      Listar planos de assinatura (público)
GET  /api/admin/planos       Listar todos os planos      (ADMIN)
POST /api/admin/planos       Criar plano                 (ADMIN)
PUT  /api/admin/planos/:id   Atualizar plano             (ADMIN)
GET  /api/public/config      Configuração pública da plataforma
PUT  /api/admin/config       Atualizar configuração      (ADMIN)
```

---

## 📱 Telas Implementadas

### Cliente — app do consumidor
| Tela | Integração |
|---|---|
| Dashboard — comércios abertos e categorias | ✅ API real |
| Listagem de comércios com filtros e busca | ✅ API real |
| Detalhe do comércio + catálogo de produtos | ✅ API real |
| Carrinho com controle de quantidade | ✅ Local (CartContext) |
| Checkout — endereço real + pagamento | ✅ API real |
| Meus pedidos — ativos e histórico | ✅ API real |
| Status do pedido — timeline + entregador | ✅ API real |
| Gerenciamento de endereços | ✅ API real |
| Perfil do usuário | ⚠️ localStorage |

### Comerciante — painel do lojista
| Tela | Integração |
|---|---|
| Dashboard com resumo de vendas e alertas | ⚠️ Parcial |
| Pedidos recebidos com atualização de status | ⚠️ Parcial |
| Catálogo de produtos — CRUD completo | ✅ API real |
| Gestão de estoque com movimentações | ⚠️ Parcial |
| Configurações da loja (horário, taxa, logo) | ✅ API real |

### Entregador — app mobile-first
| Tela | Integração |
|---|---|
| Dashboard — toggle Online/Offline + corridas | ✅ API real |
| Aceitar corrida → chama POST /aceitar antes de navegar | ✅ API real |
| Tela de rota — mapa Leaflet com GPS real | ✅ API real |
| Etapa 1: Navegar até a loja (GPS ativo) | ✅ API real |
| Etapa 2: Confirmar coleta → SAIU_ENTREGA | ✅ API real |
| Etapa 3: Navegar até o cliente (GPS ativo) | ✅ API real |
| Etapa 4: Confirmar entrega → ENTREGUE | ✅ API real |
| GPS persiste coordenadas no banco (DeliveryGPS) | ✅ API real |
| Histórico de corridas | ⚠️ Parcial |

### Admin — painel da plataforma
| Tela | Integração |
|---|---|
| Dashboard global de comércios | ⚠️ Parcial |
| Gestão de comércios (ativar/desativar) | ⚠️ Parcial |
| Gestão de planos de assinatura | ✅ API real |
| Configurações da plataforma | ✅ API real |

---

## 🚚 Fluxo Completo de Entrega

```
1. Cliente faz pedido → Order criada com status PENDENTE + Delivery AGUARDANDO_COLETA
2. Comerciante prepara → atualiza para PREPARANDO e depois PRONTO
3. Entregador fica Online → vê oportunidades disponíveis
4. Entregador aceita → Delivery muda para A_CAMINHO_COLETA
5. Entregador navega até a loja (GPS ativo → coordenadas salvas em DeliveryGPS)
6. Entregador confirma coleta → Delivery A_CAMINHO_ENTREGA · Order SAIU_ENTREGA
7. Entregador navega até o cliente (GPS continua ativo)
8. Entregador confirma entrega → Delivery ENTREGUE · Order ENTREGUE
9. Cliente vê status atualizado na tela de pedido
```

---

## 🧱 Módulos Planejados (documentação de referência)

### Composição de Itens — BOM Recursivo
Todo item pode ser composto por outros itens de forma recursiva. Um combo pode conter combos.

```
ITEM SIMPLES + ITEM COMPOSTO + SERVIÇO
          └──────── COMBO (agrupa qualquer mix)

✅ Composição recursiva
✅ Custo calculado automaticamente (bottom-up)
✅ Recálculo em cascata ao atualizar custo de insumo
✅ Detecção e bloqueio de dependência circular (DFS)
```

### Localização Física — WMS Simplificado
Hierarquia recursiva com `pai_id` — o comerciante define quantos níveis precisar.

```
Comércio
  └── Local físico (ex: "Loja principal" · "Armazém externo")
        └── Área (ex: "Depósito" · "Câmara fria" · "Cozinha")
              └── Seção (ex: "Prateleira A" · "Gôndola 3" · "Mesa 7")
                    └── Posição (ex: "Nível 2" · "Fundo") ← opcional
```

> 💡 Uma tabela `locais_fisicos` auto-referenciada por `pai_id` suporta qualquer profundidade sem criar tabelas separadas por nível.

### Motor de Promoções — Precificação Dinâmica
```
Promoção:
  → Tipo: percentual · valor fixo · preço especial · leve X pague Y · preço/kg
  → Vigência: início · fim · recorrência (toda quinta · final de semana · happy hour diário)
  → Elegíveis: por item · por categoria inteira · por tag · por fornecedor
  → Limites: quantidade máxima · limite por cliente · canal (PDV/online/ambos)

Sistema verifica vigência na consulta de preço → sem job agendado → confiável em tempo real
```

### Impressão de Etiquetas e Material de Oferta
- **Etiqueta de gôndola** — impressora térmica (ZPL), múltiplas por folha A4 ou PDF
- **Etiqueta adesiva pequena** — cola na embalagem, padrão 50mm × 25mm, protocolo ZPL
- **Material de oferta** — cartaz A4/A3 gerado em PDF com design do sistema, sem Canva

### Lote, Validade e FEFO
- Data de validade por item ou por lote
- FEFO automático (First Expired First Out)
- Alertas configuráveis: 30, 15 e 7 dias antes do vencimento
- Localização física integrada ao lote

### PDV e Movimento de Caixa
```
Abertura → valor inicial de troco
Durante  → Vendas · Sangria · Suprimento · Devoluções
Fechamento → conferência por forma de pagamento · diferença calculada
```

### Emissão Fiscal
| Documento | Quando |
|---|---|
| NFC-e | Venda no PDV para consumidor final |
| NF-e | Venda B2B ou online com nota |
| NF de Entrada | Recebimento de mercadoria |

### Produtos Digitais e Mídia
Qualquer item pode ter arquivos com dois modos de entrega:
```
uso = "apoio"  →  Gratuito, visível na página do item (imagens, catálogos)
uso = "venda"  →  Liberado após pagamento via presigned URLs com prazo de 72h
```

---

## 🗺️ Roadmap — MVPs

### ✅ MVP 1 — Marketplace de Delivery (em andamento)
**Meta:** comércio cadastra produtos → cliente faz pedido → entregador entrega com GPS real.

```
Backend
  [x] SSO — Account com múltiplos perfis (User por role)
  [x] Auth — login, select-profile, JWT
  [x] Comércios — CRUD, público, produtos públicos
  [x] Produtos e Categorias — CRUD completo
  [x] Pedidos — criar, listar, buscar (com Delivery automático)
  [x] Entregas — aceitar, coletar, entregar, GPS persistido
  [x] Endereços — CRUD com principal
  [x] Planos de assinatura — Grátis / Pro / Enterprise
  [x] RBAC — roleMiddleware em todas as rotas protegidas

Frontend
  [x] Login + seleção de perfil (SSO multi-perfil)
  [x] Dashboard Cliente — comércios abertos (API real)
  [x] Listagem de Comércios com filtros
  [x] Catálogo de produtos por comércio (API real)
  [x] Carrinho + Checkout com endereço real
  [x] Meus Pedidos + Status do Pedido (API real)
  [x] Dashboard Entregador — corridas disponíveis (API real)
  [x] Tela de Rota — mapa Leaflet + GPS real + 4 etapas
  [x] Painel Comerciante — catálogo e configurações
  [x] Painel Admin — planos e configuração da plataforma

Banco de Dados
  [x] Todos os modelos do MVP 1 criados e migrados
  [x] Seed com 6 comércios, produtos para todas as lojas e 3 contas de teste

Pendente
  [ ] Painel comerciante — pedidos recebidos integrados com API
  [ ] Painel admin — gestão de comércios integrada com API
  [ ] Status do pedido em tempo real (polling ou WebSocket)
  [ ] Integração de pagamento (Pix)
```

---

### 🟡 MVP 2 — Modo Restaurante + Cardápio QR + Garçom
**Meta:** ativar o Modo Restaurante completo com os três métodos de atendimento.

```
Backend
  [ ] Módulo restaurant (mesas, comandas, QR Code, status via WebSocket)
  [ ] Módulo qrcode.service (geração de URL por mesa)
  [ ] WebSocket/SSE para status em tempo real

Frontend
  [ ] Config. Atendimento (toggles garçom/QR/balcão)
  [ ] Gerenciamento de mesas (CRUD, capacidade, status)
  [ ] Painel do Garçom — mapa de mesas com cores por status
  [ ] Comanda da mesa (lançar itens, total acumulado, fechar)
  [ ] Cardápio QR Code (PWA pública sem login):
      Cardápio · Detalhe Produto · Carrinho da Mesa · Status Preparo
```

---

### 🟠 MVP 3 — PDV, Caixa e Emissão Fiscal
**Meta:** frente de caixa física com NFC-e e NF-e.

```
Backend
  [ ] Módulo pdv (CRUD de PDVs com nomes livres por comércio)
  [ ] Módulo caixa (abertura, sangria, suprimento, fechamento, relatório)
  [ ] Módulo fiscal (geração XML SEFAZ, integração Focus NF-e/NFe.io/Enotas)
  [ ] Módulo fiscal simulação (emissão local sem certificado para dev)

Frontend
  [ ] PDV — interface de venda (busca de item, quantidade, pagamento)
  [ ] Abertura e fechamento de caixa com conferência
  [ ] Emissão NFC-e no PDV e NF-e em vendas B2B
  [ ] Histórico de movimentos por PDV e operador
  [ ] Configuração de impressoras por comércio
```

---

### 🔵 MVP 4 — Funcionários, Permissões e RH
**Meta:** gestão completa de equipe com controle de acesso e módulo de RH.

```
Backend
  [ ] Módulo funcionarios (CRUD com perfis e PDVs vinculados)
  [ ] Módulo rh (prontuário, histórico, férias, alertas)
  [ ] rescisao.calculator.ts (cálculo automático de verbas trabalhistas)
  [ ] Geração de Termo de Rescisão em PDF

Frontend
  [ ] Lista de funcionários com perfis e status
  [ ] Prontuário digital (dados pessoais, contratuais, documentos)
  [ ] Controle de férias (saldo, agendamento)
  [ ] Módulo de rescisão (simulação → PDF → upload assinado)
  [ ] Config. de permissões granulares por funcionário
```

---

### 🟣 MVP 5 — Procurement, Fornecedor e Estoque Avançado
**Meta:** ciclo completo de compras com portal do fornecedor, lotes, validade e localização física.

```
Backend
  [ ] Módulo locais-fisicos (hierarquia recursiva com pai_id, CTE recursiva)
  [ ] Módulo item_lotes (lote + validade + local físico + FEFO automático)
  [ ] Módulo fornecedores (portal de acesso, resposta de orçamento)
  [ ] Módulo procurement (orçamento → pedido → aprovação → recebimento)
  [ ] Importação de XML NF-e na entrada de estoque

Frontend
  [ ] Árvore de locais físicos (visualização e CRUD hierárquico)
  [ ] Entrada de estoque com vinculação de lote e local físico
  [ ] Portal do Fornecedor (login, pedidos, resposta de orçamento, upload NF)
  [ ] Relatório de itens próximos do vencimento
```

---

### 🔴 MVP 6 — Promoções, Etiquetas e Material de Oferta
**Meta:** motor de precificação dinâmica e geração de material impresso diretamente do sistema.

```
Backend
  [ ] Módulo promocoes (verificação na consulta de preço, recorrência em JSONB)
  [ ] Módulo etiquetas (zpl.generator.ts + oferta.generator.ts em PDF)
  [ ] Integração com impressoras via ZPL (protocolo de rede) e PDF (browser)

Frontend
  [ ] Lista de promoções com status (ativa/agendada/encerrada)
  [ ] Form. Promoção (tipo, vigência, recorrência, itens elegíveis, limites)
  [ ] Módulo de Etiquetas com preview, seleção de impressora e impressão em lote
  [ ] Config. de impressoras (nome, tipo, IP/USB)
```

---

### ⚪ MVP 7 — Mídia Digital, IA e Automações Completas
**Meta:** produtos digitais com entrega automática e atendente IA via WhatsApp.

```
Backend
  [ ] Módulo midia (upload multipart, validação MIME, storage S3/local)
  [ ] Geração de presigned URLs com prazo (72h por padrão)
  [ ] Integração Kafka → n8n para entrega automática pós-pagamento

Frontend
  [ ] Seção de mídia no form. de item (imagens, vídeo, PDF — toggle Apoio/Venda)
  [ ] Área "Meus Downloads" do cliente (produtos digitais adquiridos)

Automações n8n
  [ ] Entrega de produto digital por e-mail (presigned URLs)
  [ ] Relatório diário de vendas
  [ ] Alertas de RH (exame médico, fim de contrato)
  [ ] Atendente IA via WhatsApp (Gemini/GPT com escalonamento humano)
  [ ] Notificação push para novas corridas (entregador)
```

---

### 📊 Visão Geral dos MVPs

```
            MVP 1  MVP 2  MVP 3  MVP 4  MVP 5  MVP 6  MVP 7
            ─────  ─────  ─────  ─────  ─────  ─────  ─────
Auth          ✅     ✅     ✅     ✅     ✅     ✅     ✅
Admin         ✅     ✅     ✅     ✅     ✅     ✅     ✅
Comércio      ✅     ✅     ✅     ✅     ✅     ✅     ✅
Produtos      ✅     ✅     ✅     ✅     ✅     ✅     ✅
Estoque       ✅     ✅     ✅     ✅     ✅     ✅     ✅
Cliente       ✅     ✅     ✅     ✅     ✅     ✅     ✅
Entregador    ✅     ✅     ✅     ✅     ✅     ✅     ✅
GPS Real      ✅     ✅     ✅     ✅     ✅     ✅     ✅
Planos SaaS   ✅     ✅     ✅     ✅     ✅     ✅     ✅
Restaurante          ✅     ✅     ✅     ✅     ✅     ✅
Garçom/QR           ✅     ✅     ✅     ✅     ✅     ✅
PDV/Caixa                  ✅     ✅     ✅     ✅     ✅
Fiscal NF                  ✅     ✅     ✅     ✅     ✅
Funcionários                      ✅     ✅     ✅     ✅
RH                                ✅     ✅     ✅     ✅
Locais Fís.                              ✅     ✅     ✅
Lotes/FEFO                               ✅     ✅     ✅
Fornecedor                               ✅     ✅     ✅
Procurement                              ✅     ✅     ✅
Promoções                                       ✅     ✅
Etiquetas                                       ✅     ✅
Mídia Digital                                          ✅
IA WhatsApp                                            ✅
```

---

## ⚙️ Configuração Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
```

Criar arquivo `.env`:
```
PORT=3333
DATABASE_URL="postgresql://usuario:senha@localhost:5432/market_db"
JWT_SECRET="sua_chave_secreta_aqui"
```

```bash
npx prisma db push          # Criar/atualizar tabelas
npx ts-node prisma/seed.ts  # Popular dados iniciais
npm run dev                 # Iniciar servidor na porta 3333
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # Inicia em http://localhost:5173
```

---

## 🧪 Contas de Teste

| Conta | CPF | Senha | Perfis disponíveis |
|---|---|---|---|
| Master | 111.111.111-11 | 123456 | Cliente · Entregador · Admin · Dono (Mercado e Burgão) |
| Maria | 222.222.222-22 | 123456 | Cliente |
| Carlos | 333.333.333-33 | 123456 | Entregador |

> A conta Master demonstra o fluxo de **seleção de perfil (SSO)**: ao fazer login, o sistema lista todos os painéis disponíveis e o usuário escolhe em qual quer entrar — sem precisar de contas separadas.

### Comércios de Exemplo (seed)

| Comércio | Segmento | Taxa | Horário |
|---|---|---|---|
| Mercado Bom Preço | Mercados | R$ 5,99 | Seg–Sáb 07h–20h |
| Burgão do João | Restaurantes | R$ 3,99 | Ter–Dom 18h–23h |
| Farmácia Saúde+ | Farmácias | R$ 4,99 | 24 horas |
| Padaria Pão Quente | Padarias | R$ 2,99 | Todos os dias 06h–20h |
| Hortifruti Natural | Hortifruti | R$ 6,99 | Fechado (exemplo de loja inativa) |
| Distribuidora Geladão | Bebidas | Grátis | 24 horas |

---

## 📚 Conceitos Aplicados

- **SaaS Multi-tenant** — isolamento por `comercioId`; planos com limites de recursos
- **SSO com múltiplos perfis** — um CPF, várias roles, vários comércios; seleção de perfil no login
- **RBAC granular** — roleMiddleware por rota; níveis 1–5 + roles especiais
- **BOM Recursivo** — composição bottom-up com detecção de loop circular (DFS)
- **WMS Simplificado** — hierarquia recursiva de locais físicos com `pai_id`; profundidade livre
- **Motor de Promoções** — precificação dinâmica verificada na consulta; sem job agendado
- **Geração de Etiquetas ZPL** — protocolo nativo de impressoras térmicas; template configurável
- **Material de Oferta em PDF** — geração server-side com PDFKit/Puppeteer; sem software externo
- **FEFO** — First Expired First Out com localização física do lote
- **GPS Persistido** — DeliveryGPS salva histórico de coordenadas por entrega
- **PDV e Caixa** — frente de caixa integrada; sangria, suprimento e fechamento com conferência
- **Emissão Fiscal** — XML SEFAZ para NF-e e NFC-e; abstração de provedor (Focus, NFe.io, Enotas)
- **Procurement** — fluxo formal do orçamento ao recebimento com portal do fornecedor
- **HRIS** — prontuário digital com linha do tempo automática e cálculo de rescisão
- **Produtos Digitais** — presigned URLs pós-pagamento com prazo configurável
- **Hierarquia Recursiva** — tabela auto-referenciada com `pai_id`; CTE (`WITH RECURSIVE`)
- **JWT Stateless** — escala horizontal sem sessão no servidor
- **Prisma Transactions** — criação de Order + Delivery em uma única transação atômica

---

**Desenvolvido por Hariel Soares Maran**
