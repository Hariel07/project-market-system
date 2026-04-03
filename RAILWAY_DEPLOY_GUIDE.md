# 🚀 Guia Completo: Deploy no Railway (Sem Docker)

> **Data**: Abril 2026  
> **Status**: Pronto para produção  
> **Tempo estimado**: 20-30 minutos  

---

## ❌ Por que NÃO usar Docker no Railway

Railway é otimizado para **Git Push Deploy**, não para Docker Compose:
- Docker Compose é para desenvolvimento local
- Railway cuida de build, scaling e infra automaticamente
- Usar Docker NO Railway = custo maior + performance pior + mais complicado

**Solução**: Usar serviços gerenciados do Railway

---

## ✅ Arquitetura de Produção

### Antes (Docker Local)
```
localhost:80 (nginx)
    ├── localhost:3000 (React)
    ├── localhost:4000 (Node)
    └── localhost:5432 (PostgreSQL)
    └── localhost:6379 (Redis)
    └── localhost:9092 (Kafka)
    └── localhost:5678 (n8n)
```

### Depois (Railway)
```
Railway Dashboard
    ├── Backend Service (Node.js)
    │   └── Escuta em PORT 3333
    ├── Frontend Service (React)
    │   └── Build automático do Vite
    └── PostgreSQL Database (Gerenciado)
        └── Backups automáticos
```

**Redis, Kafka, n8n**: Removidos por enquanto (adicione depois se precisar)

---

## 📝 Pré-requisitos

### ✅ Local (seu PC)
- [ ] Git instalado
- [ ] Conta GitHub com este repositório
- [ ] Node.js 18+ instalado

### ✅ Railway
- [ ] Criar conta em https://railway.app
- [ ] Conectar GitHub
- [ ] Criar projeto novo

---

## 🎯 Passo 1: Preparar o Código

### 1.1 Verificar estrutura de pastas
```
project-market-system/
├── backend/
│   ├── src/
│   │   ├── server.ts        ← Ponto de entrada
│   │   └── controllers/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json         ← Tem "start": "node dist/server.js"
│
├── frontend/
│   ├── src/
│   ├── vite.config.ts
│   └── package.json         ← Tem "build": "vite build"
│
├── docker-compose.yml       ← Vai IGNORAR no Railway
├── .env.example             ← Variáveis de ambiente
└── railway.json             ← ✅ Configuração do Railway
```

### 1.2 Verificar arquivo `railway.json` na raiz
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "npm run start"
  }
}
```

---

## 🔧 Passo 2: Configurar no Railway (Dashboard Web)

### 2.1 Criar novo projeto
1. Acesse https://railroad.app
2. Clique em **"New Project"** → **"Deploy from GitHub"**
3. Selecione seu repositório `project-market-system`
4. Branch: `main` (ou seu default)

### 2.2 Adicionar serviço PostgreSQL
1. No dashboard, clique **"+ New"** → **"Driver"**
2. Selecione **"PostgreSQL"**
3. Railway cria automaticamente:
   - Banco de dados
   - Usuário
   - Senha
   - URL de conexão (vai em `DATABASE_URL`)

### 2.3 Configurar variáveis de ambiente
1. Na aba **"Variables"** do Backend, adicione:

```
DATABASE_URL=postgresql://user:password@host:5432/market_db
NODE_ENV=production
PORT=3333
JWT_SECRET=sua_chave_muito_secreta_aqui_minimo_32_caracteres
FRONTEND_URL=https://seu-frontend-xxx.up.railway.app
```

> **Dica**: Railway mostra automaticamente `DATABASE_URL` quando você conecta PostgreSQL. Copie dela, não crie manualmente.

### 2.4 Trigger Deploy do Backend
1. Na aba **"Deployments"**, clique em "Deploy" ou aguarde Git push automático

---

## 🎨 Passo 3: Deploy do Frontend (separado)

### 3.1 Criar serviço novo para Frontend

1. **"New Service"** → **"Deploy from GitHub"**
2. Selecione o **mesmo repositório**
3. Railway pergunta qual pasta. Indique `frontend/`
4. Preview deploy

### 3.2 Configurar Build do Frontend
Na aba **"Settings"**:
- **Build Command**: `npm install && npm run build`
- **Start Command**: Deixe em branco (Railway sabe servir static files)
- **Root Directory**: `frontend/` (ou vazio se Railroad entender automaticamente)
- **Port**: `3000` (padrão)

### 3.3 Variáveis de Ambiente do Frontend
```
VITE_API_URL=https://seu-backend-xxx.up.railway.app/api
```

---

## 🗄️ Passo 4: Banco de Dados

### 4.1 Conectar PostgreSQL ao Backend

1. No serviço Backend, vá em **"Variables"**
2. Procure por botão **"Connect"** → **"PostgreSQL"**
3. Selecione sua instância PostgreSQL
4. Railway preenche automaticamente `DATABASE_URL`

### 4.2 Rodar Prisma Migrations (primeira vez)
Você pode fazer de 2 formas:

**Opção A: Via Railway CLI (mais fácil)**
```bash
npm install -g @railway/cli
railway login
cd project-market-system
railway link  # Seleciona o projeto
npx prisma db push
```

**Opção B: Via GitHub Actions (automático)**
Criar arquivo `.github/workflows/prisma-migrate.yml`:
```yaml
name: Prisma Migrate on Deploy
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx prisma db push --force-reset
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### 4.3 Seed de Dados (opcional)
```bash
railway run npx ts-node backend/prisma/seed.ts
```

---

## ✔️ Passo 5: Testes

### 5.1 Testar Backend
```bash
curl https://seu-backend-xxx.up.railway.app/api/health
```

Deve retornar 200 OK.

### 5.2 Testar Frontend
Abra em seu navegador:
```
https://seu-frontend-xxx.up.railway.app
```

### 5.3 Testar Conexão com Banco
Logar com credenciais de teste:
```
Email: test@example.com
Senha: 123456
```

---

## 🔍 Troubleshooting

### ❌ Erro: "DATABASE_URL not found"
✅ **Solução**: 
1. Você conectou PostgreSQL ao Backend?
2. Railway > Backend > Variables > Procure `DATABASE_URL`
3. Se vazio, clique "Connect" → PostgreSQL manualmente

### ❌ Erro: "Cannot find module '@prisma/client'"
✅ **Solução**: 
```bash
railway run npm install
railway run npm run build
```

### ❌ Erro: "Port already in use"
✅ **Solução**: 
Mude `PORT` nas variables para `3333` (ou outro número)

### ❌ Frontend retorna 404
✅ **Solução**: 
1. Verificar se `VITE_API_URL` está apontando para URL correta do backend
2. Railway > Frontend > Settings > Preview URL (copie e use como `FRONTEND_URL` no backend)

### ❌ CORS error: "Access-Control-Allow-Origin"
✅ **Solução**: 
No backend, arquivo `src/server.ts`, adicione:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## 📊 Monitoramento

### Logs
Railway > Serviço > "Logs" → Vê logs em tempo real

### Métricas
Railway > Serviço > "Metrics" → CPU, memória, latência

### Conexão com Banco
Railway > PostgreSQL > "Data" → Browser pgAdmin integrado

---

## 💰 Custos Estimados

| Serviço | Preço (USD) | Notas |
|---|---|---|
| Backend Node (512MB) | $5/mês | Suficiente para MVP |
| Frontend Static | Grátis | Será servido pelo CDN |
| PostgreSQL | $10-20/mês | Gerenciado, backup automático |
| **Total** | **~$15-25/mês** | Muito barato! |

> Railway oferece $5/mês grátis como crédito mensal, então seus custos reais são ainda menores.

---

## 🎉 Checklist Final

- [ ] Repositório no GitHub
- [ ] `railway.json` na raiz
- [ ] `.env.example` preenchido
- [ ] Backend package.json com "build" e "start"
- [ ] Frontend package.json com "build"
- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado
- [ ] Backend e Frontend como serviços separados
- [ ] Variables configuradas (DATABASE_URL, JWT_SECRET, etc)
- [ ] Deployments rodando (verde)
- [ ] Testes passando

---

## 📚 Referências

- [Railway Docs](https://docs.railway.app)
- [Prisma + Railway](https://www.prisma.io/docs/guides/deployment/guides/deploying-to-railway)
- [Environment Variables](https://docs.railway.app/develop/variables)
- [Troubleshooting](https://docs.railway.app/troubleshoot/common-errors)

---

## 🚀 Próximos Passos (Depois de Deploy)

1. **Monitorar logs** por 24h
2. **Habilitar SSL/TLS** (Railway faz automático)
3. **Configurar domínio customizado** (seu.dominio.com)
4. **Ativar backup automático** do PostgreSQL
5. **Escalar para 2+ replicas** quando tiver tráfego

---

**Criado em**: Abril 2026  
**Última atualização**: Versão 1.0  
**Status**: Pronto para usar ✅
