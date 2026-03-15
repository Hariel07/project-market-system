# 🛒 Project Market System

Sistema de mercado com CRUD completo, REST API, autenticação JWT, mensageria com Kafka, comunicação gRPC, mapa de entregas em tempo real e automações com n8n.

> 💡 **Este projeto é uma base de conhecimento.**
> Foi construído seguindo um processo completo de Engenharia de Software — do briefing até o código — servindo como porta de entrada e referência para projetos futuros.

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

## 📐 Fase 1 — Briefing e Engenharia de Requisitos

Antes de qualquer código ou tela, definimos **o que o sistema precisa fazer**.

### Documento de Visão do Produto

| Campo | Descrição |
|---|---|
| **Nome** | Project Market System |
| **Objetivo** | Sistema de mercado com gestão de produtos, pedidos e entregas |
| **Público-alvo** | Administradores e entregadores |
| **Problema que resolve** | Centralizar cadastro de produtos, autenticação e rastreamento de entregas |

### Requisitos Funcionais (RF)

- **RF01** — O sistema deve permitir cadastro e login de usuários
- **RF02** — O sistema deve permitir CRUD completo de produtos
- **RF03** — Produtos devem suportar atributos variáveis por categoria (JSONB)
- **RF04** — O sistema deve autenticar usuários via JWT
- **RF05** — O sistema deve exibir um mapa de entregas em tempo real
- **RF06** — O sistema deve emitir eventos ao criar/atualizar pedidos (Kafka)
- **RF07** — O sistema deve suportar automações via n8n

### Requisitos Não Funcionais (RNF)

- **RNF01** — Toda a infraestrutura deve rodar em Docker
- **RNF02** — O backend deve ser modular por domínio
- **RNF03** — A comunicação interna entre serviços deve usar gRPC
- **RNF04** — O sistema deve usar TypeScript no frontend e backend
- **RNF05** — O código deve ser comentado para fins didáticos

---

## 🎨 Fase 2 — Design de Telas (Figma)

As telas são projetadas no **Figma** seguindo três etapas antes do código:

```
Briefing de Projeto
      ↓
Fluxo de Navegação (Navigation Flow)
      ↓
Wireframe de Baixa Fidelidade
      ↓
Mockup de Alta Fidelidade
```

### Telas previstas

| Tela | Descrição |
|---|---|
| **Login** | Autenticação do usuário |
| **Register** | Cadastro de novo usuário |
| **Dashboard** | Visão geral do sistema |
| **Lista de Produtos** | Exibição e busca de produtos |
| **Formulário de Produto** | Criar e editar produto (com JSONB dinâmico) |
| **Mapa de Entregas** | Rastreamento de pedidos em tempo real |

> 🔗 Link do Figma: *(será adicionado após o design)*

---

## 🧩 Fase 3 — Modelagem UML

Após o design, modelamos as **entidades e funções** do sistema com UML antes de codificar.

### Diagramas previstos

| Diagrama | Ferramenta | Finalidade |
|---|---|---|
| **Casos de Uso** | Draw.io | O que cada ator pode fazer no sistema |
| **Diagrama de Classes** | Draw.io | Entidades, atributos e relacionamentos |
| **Diagrama de Sequência** | Draw.io | Fluxo de uma requisição (ex: login) |
| **Diagrama de Componentes** | Draw.io | Como os módulos se comunicam |

### Entidades principais (prévia)

```
Usuario
-----------------
- id: int
- nome: String
- email: String
- senha: String (hash)
- role: String
-----------------
+ autenticar(): boolean
+ atualizarPerfil(): void

Produto
-----------------
- id: int
- nome: String
- preco: double
- estoque: int
- categoria: String
- attributes: JSONB
-----------------
+ atualizarEstoque(qtd: int): void
+ calcularValorTotal(qtd: int): double

Entrega
-----------------
- id: int
- pedidoId: int
- entregadorId: int
- status: String
- localizacao: JSONB
-----------------
+ atualizarStatus(status: String): void
+ atualizarLocalizacao(lat, lng): void
```

---

## 🏗️ Fase 4 — Arquitetura (C4 Model)

O sistema é documentado nos 4 níveis do **C4 Model**:

```
Nível 1 — Contexto    → Quem usa e com o que o sistema se comunica
Nível 2 — Containers  → Quais partes compõem o sistema (React, Node, Kafka...)
Nível 3 — Componentes → Como cada container está organizado internamente
Nível 4 — Código      → Classes, interfaces e dependências (UML)
```

### Nível 2 — Visão de Containers (prévia)

```
┌─────────────────────────────────────────────────────┐
│                  Project Market System               │
│                                                      │
│  [React Frontend] ──────→ [Nginx] ──────→ [Backend] │
│                                               │      │
│                                        ┌──────┴───┐  │
│                                        │PostgreSQL│  │
│                                        │  Redis   │  │
│                                        │  Kafka   │  │
│                                        └──────────┘  │
│  [n8n] ←──────── eventos ────────────── [Backend]   │
└─────────────────────────────────────────────────────┘
```

> 🔗 Diagramas completos: *(serão adicionados no Draw.io)*

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Comunicação interna | gRPC |
| Mensageria | Apache Kafka |
| Banco de Dados | PostgreSQL 16 (JSONB) |
| Cache / JWT | Redis |
| Autenticação | JWT + OAuth |
| Automações | n8n |
| Proxy / Roteamento | Nginx |
| Infraestrutura | Docker + Docker Compose |
| Design | Figma |
| Modelagem | Draw.io (UML + C4 Model) |

---

## 📋 Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)
- [pgAdmin 4](https://www.pgadmin.org/download/pgadmin-4-windows/) *(interface visual do banco)*
- [Figma](https://figma.com/) *(design de telas)*
- [Draw.io](https://app.diagrams.net/) *(modelagem UML e C4)*

---

## 🚀 Como rodar o projeto

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
| Frontend | http://localhost | Interface React |
| Backend API | http://localhost/api | REST API Node.js |
| n8n | http://localhost:5678 | Painel de automações |
| pgAdmin | `localhost:5432` | Conectar via pgAdmin |

---

## 🐳 Arquitetura de Containers

```
Docker
├── nginx        → Porta 80 — roteia frontend e backend
├── frontend     → React (porta 3000 interna)
├── backend      → Node.js + Express + gRPC (portas 4000 e 50051 internas)
├── postgres     → Banco de dados (porta 5432)
├── redis        → Cache e controle de tokens JWT (porta 6379)
├── n8n          → Automações (porta 5678)
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

### Tabela `products`

```sql
CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category    VARCHAR(80),
    attributes  JSONB DEFAULT '{}',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
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
│       │   ├── users/
│       │   │   ├── user.model.ts
│       │   │   ├── user.repository.ts
│       │   │   ├── user.service.ts
│       │   │   ├── user.controller.ts
│       │   │   └── user.routes.ts
│       │   ├── products/
│       │   │   ├── product.model.ts
│       │   │   ├── product.repository.ts
│       │   │   ├── product.service.ts
│       │   │   ├── product.controller.ts
│       │   │   └── product.routes.ts
│       │   └── deliveries/
│       │       ├── delivery.model.ts
│       │       ├── delivery.repository.ts
│       │       ├── delivery.service.ts
│       │       ├── delivery.controller.ts
│       │       └── delivery.routes.ts
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
│       │   │   └── server.ts
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
        │   ├── products/
        │   │   ├── ProductListPage.tsx
        │   │   ├── ProductFormPage.tsx
        │   │   └── product.service.ts
        │   └── deliveries/
        │       ├── DeliveryMapPage.tsx
        │       └── delivery.service.ts
        └── shared/
            ├── components/
            │   └── Button.tsx
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

### 🎨 Fase 1 — Briefing e Design (Figma)
- [ ] Documento de visão do produto
- [ ] Levantamento de requisitos funcionais e não funcionais
- [ ] Fluxo de navegação (Navigation Flow)
- [ ] Wireframes de baixa fidelidade
- [ ] Mockups de alta fidelidade

### 🧩 Fase 2 — Modelagem (UML + C4 Model)
- [ ] Diagrama de Casos de Uso
- [ ] Diagrama de Classes (entidades e relacionamentos)
- [ ] Diagrama de Sequência (fluxo de login, criação de produto)
- [ ] C4 Model — Nível 1 (Contexto)
- [ ] C4 Model — Nível 2 (Containers)
- [ ] C4 Model — Nível 3 (Componentes)

### 🗄️ Fase 3 — Banco de Dados
- [x] Criar tabela `products` com JSONB
- [ ] Criar tabela `users`
- [ ] Criar tabela `deliveries`
- [ ] Testar queries CRUD

### ⚙️ Fase 4 — Backend
- [ ] Estrutura de pastas modular
- [ ] Conexão com PostgreSQL e Redis
- [ ] CRUD de Produtos (GET, POST, PUT, DELETE)
- [ ] Registro e Login com JWT + OAuth
- [ ] Middleware de autenticação
- [ ] Eventos Kafka (pedido criado, status atualizado)
- [ ] Servidor gRPC para comunicação interna

### 🖥️ Fase 5 — Frontend
- [ ] Tela de Login/Register
- [ ] Listagem de Produtos
- [ ] Formulário Criar/Editar Produto
- [ ] Integração com a API (Axios + token JWT)
- [ ] Mapa de entregas em tempo real

### 🤖 Fase 6 — Automações n8n
- [ ] Notificação de novo pedido
- [ ] Email de confirmação
- [ ] Integração com WhatsApp/Telegram

---

## 🐳 Comandos Docker úteis

```bash
# Subir tudo
docker-compose up -d

# Subir só o banco e redis
docker-compose up -d postgres redis

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

## 📚 Conceitos aplicados

- **Engenharia de Requisitos** — levantamento e documentação de RF e RNF antes do desenvolvimento
- **Figma** — design de telas do briefing até o mockup de alta fidelidade
- **UML** — modelagem de casos de uso, classes, sequência e componentes
- **C4 Model** — arquitetura do sistema em 4 níveis (contexto, containers, componentes, código)
- **Arquitetura Modular** — cada domínio é independente com seu próprio model, controller, service e repository
- **JSONB** — armazenamento de dados flexíveis no PostgreSQL com suporte a índices e buscas
- **Docker Compose** — orquestração de múltiplos containers para ambiente de desenvolvimento
- **JWT + OAuth** — autenticação stateless via token com suporte a provedores externos
- **Redis** — cache de consultas e invalidação de tokens JWT no logout
- **REST API** — padrão de comunicação entre frontend e backend
- **gRPC** — comunicação de alta performance entre serviços internos
- **Kafka** — mensageria assíncrona para eventos entre módulos
- **Nginx** — reverse proxy que roteia requisições para os serviços corretos
- **n8n** — automação de fluxos sem código (notificações, integrações)
