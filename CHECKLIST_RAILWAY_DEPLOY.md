# ✅ Checklist Detalhado — Deploy no Railway

> **Tempo estimado**: 25-30 minutos  
> **Status**: Código pronto para subir  
> **Data**: Abril 2026

---

## 📋 PRÉ-DEPLOY (Local — seu PC)

### Passo 1: Verificar se o código compila
- [x] Backend compila: `npm run build` OK
- [x] Frontend compila: `npm run build` OK
- [ ] Git está atualizado: `git status` limpo
- [ ] `.env` **NÃO está** commitado (segurança)

**Checagem rápida:**
```bash
cd c:\GitFull\project-market-system\backend
npm run build
# Deve terminar sem erros ✅

cd c:\GitFull\project-market-system\frontend
npm run build
# Deve terminar sem erros ✅
```

---

## 🚀 PASSO A PASSO NO RAILWAY DASHBOARD

### **FASE 1: Criar Conta e Projeto**

#### Passo 2: Criar conta no Railway
- [ ] Acesse https://railway.app
- [ ] Clique **"Sign Up"** (ou **"Login"** se já teve conta)
- [ ] Escolha: **"Continue with GitHub"**
- [ ] Autorize Railway acessar seu GitHub
- [ ] Você será redirecionado ao Railway Dashboard

#### Passo 3: Criar novo projeto
- [ ] No Dashboard, clique **"+ New Project"**
- [ ] Selecione **"Deploy from GitHub"**
- [ ] Selecione o repositório **"project-market-system"**
- [ ] Branch: **"main"** (ou seu branch padrão)
- [ ] Clique **"Create"**

> **Nota**: Railway pode fazer um deploy automático já. Não se preocupe por enquanto — vamos configurar tudo primeiro.

---

### **FASE 2: Adicionar PostgreSQL**

#### Passo 4: Criar banco de dados PostgreSQL
- [ ] No Dashboard do projeto, clique **"+ New"** (botão verde no canto superior)
- [ ] Selecione **"Database"** → **"PostgreSQL"**
- [ ] Railway cria automáticamente:
  - [ ] Instância PostgreSQL
  - [ ] Variável `DATABASE_URL` (guarde essa URL!)

#### Passo 5: Verificar DATABASE_URL
- [ ] No Dashboard, procure o serviço **"PostgreSQL"**
- [ ] Clique na aba **"Variables"**
- [ ] Procure por `DATABASE_URL` 
- [ ] Deve estar preenchida com algo como:
  ```
  postgresql://postgres:xxx@xxx.railway.internal:5432/railway
  ```
- [ ] ✅ Se estiver lá, copie essa URL (vai usar no Backend)

---

### **FASE 3: Configurar Backend (Node.js)**

#### Passo 6: Localizar ou criar serviço Backend
Há 2 possibilidades:

**Opção A**: Railway criou automaticamente (mais comum)
- [ ] No Dashboard, você vê um serviço chamado **"project-market-system"** (seu repositório)
- [ ] Clique nele

**Opção B**: Precisa criar manualmente
- [ ] Clique **"+ New"** → **"Service"** → **"GitHub Repo"**
- [ ] Selecione **"project-market-system"**
- [ ] Clique **"Create"**

#### Passo 7: Configurar o Backend para apontar para a pasta correta
- [ ] No serviço (seu repositório), vá na aba **"Settings"**
- [ ] Procure por **"Root Directory"**
- [ ] Mude para: `backend`
- [ ] Clique **"Deploy"** (botão no canto superior direito)

> **Nota**: Se estiver em branco, Railway tenta adivinhar. Melhor ser explícito.

#### Passo 8: Conectar PostgreSQL ao Backend
- [ ] Ainda no serviço Backend, vá na aba **"Variables"**
- [ ] Clique **"+ New Variable"**
- [ ] Procure por **"Add Reference"** (ou ícone de "vinculação")
- [ ] Selecione **"PostgreSQL.DATABASE_URL"**
- [ ] Railway copia a URL automaticamente para `DATABASE_URL` do Backend
- [ ] ✅ Confirm

#### Passo 9: Adicionar variáveis de ambiente do Backend
Ainda na aba **"Variables"** do Backend, adicione as seguintes:

| Variável | Valor | Obrigatório? |
|---|---|---|
| `DATABASE_URL` | (já vem do PostgreSQL) | ✅ SIM |
| `NODE_ENV` | `production` | ✅ SIM |
| `PORT` | `3333` | ✅ SIM |
| `JWT_SECRET` | `sua_chave_super_secreta_aqui_minimo_32_caracteres_aleatorio` | ✅ SIM |
| `FRONTEND_URL` | (você preencherá depois) | ✅ SIM |

**Como adicionar cada uma:**
1. Clique **"+ New Variable"**
2. Nome: (da coluna "Variável")
3. Value: (da coluna "Valor")
4. Clique ✅

**Exemplo JWT_SECRET seguro:**
```
xK9mP@2qR#5vL$8wN%1aB^3cD&7eF*0gH(9iJ.2kL)3mN-4oP+5qR=6sT:7uV<8wX>9yZ
```

#### Passo 10: Dar trigger no Deploy do Backend
- [ ] Na aba **"Deployments"** do Backend
- [ ] Clique **"Deploy"** (botão verde)
- [ ] Aguarde completar (vai ter checkmark verde ✅)
- [ ] Deve aparecer algo como: "✅ Deployment #1 — 2 min ago — Success"

> **Se der erro**: Clique na aba **"Logs"** para ver o que deu errado. Geralmente é variável faltando.

---

### **FASE 4: Setup do Banco de Dados (Prisma Migrations)**

#### Passo 11: Criar tabelas no PostgreSQL (IMPORTANTE!)
Este é o passo mais crítico! O banco está vazio. Você precisa rodar as migrations do Prisma.

**Via Railway CLI (RECOMENDADO):**
```bash
# Se ainda não tem:
npm install -g @railway/cli

# No seu PC, na pasta do projeto:
cd c:\GitFull\project-market-system

railway login
# Faz login com GitHub

railway link
# Seleciona: project-market-system (seu projeto)

# Agora roda o comando que cria as tabelas:
npx prisma db push
```

**Opção B: Via Railway Dashboard (mais manual)**
- [ ] No Backend, vá em **"Deployments"**
- [ ] Clique no último deployment (verde)
- [ ] Procure por botão **"Terminal"** ou **"SSH"**
- [ ] Execute:
  ```bash
  npx prisma db push
  ```

**Após rodar, você deve ver:**
```
✔ Prisma migrations applied successfully
```

#### Passo 12: Verificar que as tabelas foram criadas
- [ ] No Dashboard, clique no serviço **"PostgreSQL"**
- [ ] Vá na aba **"Data"** (ou **"pgAdmin"**)
- [ ] Você deve ver tabelas como:
  - [ ] `Account`
  - [ ] `User`
  - [ ] `Commerce`
  - [ ] `Product`
  - [ ] `Order`
  - [ ] `Delivery`
  - [ ] etc.

Se não ver tabelas, algo deu errado. Volte para Passo 11.

---

### **FASE 5: Configurar Frontend (React)**

#### Passo 13: Criar serviço novo para Frontend
- [ ] No Dashboard, clique **"+ New"** (verde)
- [ ] Selecione **"Service"** → **"GitHub Repo"**
- [ ] Selecione **"project-market-system"** (mesmo repositório)
- [ ] Clique **"Create"**

#### Passo 14: Configurar Frontend para usar pasta `frontend/`
- [ ] No novo serviço, vá em **"Settings"**
- [ ] **Root Directory**: mude para `frontend`
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: deixe em branco (Railway sabe servir React)
- [ ] Clique **"Save"**

#### Passo 15: Adicionar variável de ambiente do Frontend
- [ ] Vá na aba **"Variables"** do Frontend
- [ ] Clique **"+ New Variable"**
  - **Name**: `VITE_API_URL`
  - **Value**: (você preencherá no próximo passo)

Deixe em branco por enquanto — vamos preencher após saber a URL do Backend.

#### Passo 16: Pegar URL pública do Backend
- [ ] Clique no serviço **Backend**
- [ ] Na aba **"Settings"**, procure por **"Public URL"** ou **"Public Domain"**
- [ ] Deve estar algo como: `https://project-market-system-production-xxx.up.railway.app`
- [ ] Copie essa URL

#### Passo 17: Preencher VITE_API_URL do Frontend
- [ ] Volte para o serviço Frontend
- [ ] Aba **"Variables"**
- [ ] Clique em `VITE_API_URL` (aquela que deixou em branco)
- [ ] Valor: (URL do Backend) + `/api`
- [ ] Exemplo: `https://project-market-system-production-xxx.up.railway.app/api`
- [ ] ✅ Confirm

#### Passo 18: Preencher FRONTEND_URL no Backend
- [ ] Volte para o serviço **Backend**
- [ ] Aba **"Variables"**
- [ ] Procure por `FRONTEND_URL` (você criou no Passo 9)
- [ ] Mude o valor para a URL do Frontend
- [ ] **Pegar URL do Frontend**: Clique no Frontend → Settings → "Public URL"
- [ ] Exemplo: `https://project-market-system-frontend-xxx.up.railway.app`
- [ ] ✅ Confirm

#### Passo 19: Fazer deploy do Frontend
- [ ] No Frontend, aba **"Deployments"**
- [ ] Clique **"Deploy"** (botão verde)
- [ ] Aguarde completar

---

### **FASE 6: Testar Tudo**

#### Passo 20: Abrir Frontend no navegador
- [ ] Pegue a URL pública do Frontend (Settings → Public URL)
- [ ] Abra no navegador: `https://...`
- [ ] Você deve ver a tela de login do sistema
- [ ] ✅ Se carregou, Frontend está OK

#### Passo 21: Testar Login
- [ ] Clique em **"Login"**
- [ ] Tente fazer login com credenciais de teste:
  ```
  Email: test@example.com
  Senha: 123456
  ```

> **Nota**: Essas credenciais só existem se você rodou o `seed.ts`. Se não fez, vai dar erro de "usuário não encontrado" (esperado).

#### Passo 22: Testar conexão com Backend
- [ ] Abra o navegador (F12 → Console)
- [ ] Você deve ver requisições HTTP para o Backend
- [ ] Se conseguiu fazer login, a conexão está OK
- [ ] ✅ Backend + Frontend se comunicando

---

## 🔧 Troubleshooting

### ❌ Erro: "Cannot connect to database"
**Causa**: `DATABASE_URL` não está configurada ou está errada  
**Solução**:
1. Backend → Variables
2. Verifica `DATABASE_URL` está preenchida
3. Clique "Deploy" novamente

### ❌ Erro: "PORT 3333 already in use"
**Causa**: Duas instâncias do Backend rodando  
**Solução**:
1. Backend → Deployments → Cancela deployment anterior
2. Aguarda 1 minuto
3. Clique "Deploy" novamente

### ❌ Erro: "CORS error"
**Causa**: `FRONTEND_URL` ou `VITE_API_URL` incorretos  
**Solução**:
1. Verifica ambas as URLs
2. Certifique que `FRONTEND_URL` no Backend aponta para a URL correta do Frontend
3. Clique "Deploy" no Backend

### ❌ Erro: "npm ERR! 404 package not found"
**Causa**: Falta `package-lock.json` ou dependência errada  
**Solução**:
1. Localmente: `cd backend && npm install`
2. Commit: `git add . && git commit -m "chore: lock deps"`
3. `git push`
4. Railway refaz deploy automaticamente

### ❌ Frontend carrega mas dá erro de API
**Causa**: `VITE_API_URL` não está apontando para Backend correto  
**Solução**:
1. F12 → Network → tira Print
2. Vê qual URL está sendo chamada
3. Frontend → Variables → `VITE_API_URL` → corrige
4. Deploy novamente

---

## 📊 Checklist Final Resumido

### Antes do Deploy
- [ ] `npm run build` funciona no backend
- [ ] `npm run build` funciona no frontend
- [ ] `git status` está limpo

### Railway Setup
- [ ] [x] Conta criada no Railway
- [ ] [ ] Projeto criado
- [ ] [ ] PostgreSQL adicionado
- [ ] [ ] Backend serviço criado
- [ ] [ ] Backend conectado ao PostgreSQL
- [ ] [ ] Backend variáveis configuradas
- [ ] [ ] Backend deployado com sucesso
- [ ] [ ] Prisma db push executado
- [ ] [ ] Tabelas criadas no PostgreSQL
- [ ] [ ] Frontend serviço criado
- [ ] [ ] Frontend variáveis configuradas
- [ ] [ ] Frontend deployado com sucesso
- [ ] [ ] URLs públicas obtidas
- [ ] [ ] VITE_API_URL preenchida no Frontend
- [ ] [ ] FRONTEND_URL preenchida no Backend

### Testes
- [ ] [ ] Frontend carrega no navegador
- [ ] [ ] Botão de Login está visível
- [ ] [ ] Backend Log mostra requisições chegando
- [ ] [ ] Nenhum erro de CORS no console (F12)

---

## 🎉 Sucesso!

Se todos os checkboxes estão marcados:

✅ **Seu sistema está no ar!**

- **Frontend**: https://seu-frontend-xxx.up.railway.app
- **Backend API**: https://seu-backend-xxx.up.railway.app/api
- **Banco de dados**: PostgreSQL gerenciado + backups automáticos

---

## 📌 Próximas Vezes (Depois de Tudo Rodando)

Agora, sempre que você fizer mudanças:

```bash
# 1. Desenvolver localmente (já funciona)
# 2. Commit
git add .
git commit -m "feat: descrição da mudança"

# 3. Push (Railway detecta e refaz deploy automaticamente)
git push origin main

# 4. Aguardar ~2-5 minutos
# 5. Recarregar site (F5)
# 6. Pronto! Atualizado ao vivo ✅
```

**Se mudar schema Prisma:**
```bash
# Uma vez no Railway:
railway link
railway run npx prisma db push
```

---

## 🆘 Precisa de Ajuda?

| Situação | O que fazer |
|---|---|
| Deploy em loop / erro | Clique på "Deployments" → "View Logs" → copie o erro |
| Banco não connecta | Verifica `DATABASE_URL` nas Variables |
| Frontend dá CORS error | Verifica `VITE_API_URL` e `FRONTEND_URL` |
| Tudo preto / branco | Aguarde 5min (Railway pode estar buildando) |

---

**Criado**: Abril 2026  
**Versão**: 1.0 — Production Ready  
**Status**: ✅ Pronto para Deploy
