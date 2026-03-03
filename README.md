# 🛒 Project Market System

Sistema de mercado com CRUD completo, REST API, autenticação JWT e banco de dados PostgreSQL com JSONB.

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React |
| Backend | Node.js + Express |
| Banco de Dados | PostgreSQL 16 (JSONB) |
| Autenticação | JWT |
| Infraestrutura | Docker + Docker Compose |

---

## 📋 Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/)
- [pgAdmin 4](https://www.pgadmin.org/download/pgadmin-4-windows/) *(opcional — interface visual do banco)*

---

## 🚀 Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/project-market-system.git
cd project-market-system
```

### 2. Suba o banco de dados

```bash
docker-compose up -d
```

### 3. Verifique se o container está rodando

```bash
docker ps
```

Deve aparecer o container `market-db` com status **Up**.

---

## 🗄️ Banco de Dados

### Conexão

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Porta | `5432` |
| Banco | `market_db` |
| Usuário | `market_user` |
| Senha | `market_pass` |

### Estrutura

#### Tabela `products`

Armazena os produtos do sistema. Utiliza a coluna `attributes` do tipo **JSONB** para guardar atributos variáveis por tipo de produto.

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

**Por que JSONB?**
Permite guardar atributos flexíveis por tipo de produto sem precisar criar colunas fixas. Exemplos:
- Roupa: `{"tamanho": "M", "cor": "azul"}`
- Notebook: `{"ram": "16GB", "ssd": "512GB"}`
- Alimento: `{"origem": "Minas Gerais"}`

---

## 📁 Estrutura do Projeto

Arquitetura **modular por domínio** — cada funcionalidade é independente e contém todos os seus próprios arquivos. Isso facilita manutenção, testes e evolução isolada de cada módulo.

```
project-market-system/
├── docker-compose.yml
├── README.md
│
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── users/                  # Tudo relacionado ao usuário
│       │   │   ├── user.model.ts       # Estrutura/tipagem da entidade
│       │   │   ├── user.repository.ts  # Acesso ao banco de dados
│       │   │   ├── user.service.ts     # Regras de negócio
│       │   │   ├── user.controller.ts  # Recebe e responde requisições
│       │   │   └── user.routes.ts      # Definição das rotas
│       │   │
│       │   └── products/               # Tudo relacionado ao produto
│       │       ├── product.model.ts
│       │       ├── product.repository.ts
│       │       ├── product.service.ts
│       │       ├── product.controller.ts
│       │       └── product.routes.ts
│       │
│       ├── shared/                     # Código reutilizado entre módulos
│       │   ├── middlewares/
│       │   │   └── auth.middleware.ts  # Validação do JWT
│       │   ├── database/
│       │   │   └── connection.ts       # Conexão com PostgreSQL
│       │   └── errors/
│       │       └── AppError.ts         # Tratamento de erros padrão
│       │
│       └── app.ts                      # Inicialização do Express
│
└── frontend/
    └── src/
        ├── modules/
        │   ├── auth/                   # Login e Register
        │   │   ├── LoginPage.tsx
        │   │   ├── RegisterPage.tsx
        │   │   └── auth.service.ts     # Chamadas à API de autenticação
        │   │
        │   └── products/               # Tela e lógica de produtos
        │       ├── ProductListPage.tsx
        │       ├── ProductFormPage.tsx
        │       └── product.service.ts  # Chamadas à API de produtos
        │
        └── shared/                     # Componentes e utilitários globais
            ├── components/
            │   └── Button.tsx
            └── api/
                └── axios.config.ts     # Configuração base do Axios + token
```

### 💡 Por que modular?

| Vantagem | Descrição |
|---|---|
| **Independência** | Alterar `products` não afeta `users` |
| **Manutenção** | Fácil localizar onde está cada responsabilidade |
| **Escalabilidade** | Adicionar um novo módulo (ex: `orders`) sem mexer nos demais |
| **Testabilidade** | Cada módulo pode ser testado de forma isolada |

---

## 📌 Roadmap

### Fase 1 — Banco de Dados
- [x] Subir PostgreSQL no Docker
- [x] Criar tabela `products` com JSONB
- [ ] Criar tabela `users`
- [ ] Testar queries CRUD

### Fase 2 — Backend
- [ ] Estrutura de pastas (Clean Architecture)
- [ ] Conexão com PostgreSQL
- [ ] CRUD de Produtos (GET, POST, PUT, DELETE)
- [ ] Registro e Login com JWT
- [ ] Middleware de autenticação

### Fase 3 — Frontend
- [ ] Tela de Login/Register
- [ ] Listagem de Produtos
- [ ] Formulário Criar/Editar Produto
- [ ] Integração com a API

---

## 🐳 Comandos Docker úteis

```bash
docker-compose up -d      # Subir o banco
docker-compose down       # Parar o banco
docker-compose down -v    # Parar e apagar os dados
docker logs market-db     # Ver logs do container
```

---

## 📚 Conceitos aplicados

- **JSONB** — armazenamento de dados flexíveis no PostgreSQL com suporte a índices e buscas
- **Docker Compose** — orquestração de containers para ambiente de desenvolvimento
- **Arquitetura Modular** — cada domínio (users, products) é independente e contém seu próprio model, controller, service e repository
- **JWT** — autenticação stateless via token
- **REST API** — padrão de comunicação entre frontend e backend