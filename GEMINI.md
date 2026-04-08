# Diretrizes do Projeto - Market System (Regras de Ouro)

Este arquivo contém decisões arquiteturais e correções críticas para garantir a estabilidade do sistema em ambientes Locais e Railway. **NÃO ALTERE ESTAS CONFIGURAÇÕES SEM CONSULTA PRÉVIA.**

---

## 🗄️ 1. Banco de Dados & Prisma (Crítico)

### Sintaxe do `schema.prisma`
*   **REGRA:** **NUNCA** utilize valores padrão (fallbacks) dentro da função `env()` no arquivo `schema.prisma`. O Prisma 6+ não aceita mais de um argumento nessa função.
    *   ❌ **Errado:** `url = env("DATABASE_URL", "postgresql://...")`
    *   ✅ **Correto:** `url = env("DATABASE_URL")`

### Conexão Local vs Produção
*   **Local (.env):** Utilize a `DATABASE_PUBLIC_URL` do Railway no seu arquivo `.env` local para gerenciar o banco (migrations, seeds, Prisma Studio) do seu PC.
*   **Railway (Config):** O serviço de backend no Railway deve utilizar a `DATABASE_URL` **interna** para performance e segurança. Nunca force a URL pública no servidor.

---

## 🚀 2. Ciclo de Build & Deploy (Railway)

### Variáveis de Ambiente no Build (P1012)
*   **REGRA:** O script `build.js` na raiz injeta uma URL dummy (`postgresql://dummy...`) durante o `npx prisma generate`. 
*   **POR QUE:** O Railway não injeta variáveis reais na fase de build. O `generate` precisa de uma string válida para validar o schema, mesmo que não conecte ao banco. **Não remova essa lógica do `build.js`.**

### Integração Frontend -> Backend
*   **REGRA:** O arquivo `frontend/.env.production` deve manter `VITE_API_URL` **vazia ou comentada**.
*   **POR QUE:** Isso garante que o frontend use rotas relativas (`/api`). Se houver uma URL fixa, qualquer mudança de domínio no Railway causará erros de CORS e 404.
*   **Pasta `backend/public`:** Esta pasta é **volátil**. Ela é apagada e recriada pelo `build.js` a cada deploy. Nunca salve arquivos permanentes nela; use `frontend/public`.

---

## ⚙️ 3. Configuração do Servidor (`server.ts`)

*   **Host & Porta:** O servidor deve SEMPRE ouvir em `0.0.0.0` e usar `process.env.PORT`. Fixar `localhost` ou portas específicas quebrará o roteamento do Railway.
*   **CORS:** Deve permanecer permissivo (`origin: '*'`) ou configurado para aceitar o domínio dinâmico do Railway para evitar bloqueios no navegador.

---

## 📂 4. Estrutura do Projeto (Monorepo)

*   **Integridade:** O projeto é um monorepo. Os arquivos `package.json` (raiz), `build.js` e `railway.json` dependem da estrutura exata das pastas `backend/` e `frontend/`. Não mova ou renomeie essas pastas.

---

## 🛠️ Fluxo de Deploy Unificado
O comando de build executa o `build.js` que automatiza:
1.  Geração do Prisma Client (com URL dummy).
2.  Compilação do Frontend (Vite).
3.  Cópia do `dist` do frontend para `backend/public`.
4.  Compilação do Backend (TypeScript) para `backend/dist`.

---
*Nota: Este arquivo é a "fonte da verdade" para qualquer IA ou desenvolvedor atuando no projeto.*
