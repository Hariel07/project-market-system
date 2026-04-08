# Diretrizes do Projeto - Market System

Este arquivo contém decisões arquiteturais e correções críticas para garantir a estabilidade do sistema em ambientes Locais e Railway.

## 🗄️ Banco de Dados & Prisma (Crítico)

### 1. Sintaxe do `schema.prisma`
**NUNCA** utilize valores padrão (fallbacks) dentro da função `env()` no arquivo `schema.prisma`. O Prisma 6+ não aceita mais de um argumento nessa função.
- ❌ **Errado:** `url = env("DATABASE_URL", "postgresql://...")`
- ✅ **Correto:** `url = env("DATABASE_URL")`

### 2. Ciclo de Build no Railway (P1012)
Durante a fase de build no Railway, as variáveis de ambiente reais podem não estar injetadas. Para evitar o erro `P1012` no `npx prisma generate`, o script `build.js` na raiz foi configurado para fornecer uma URL dummy temporária.
- O `generate` não precisa de conexão real, apenas de uma string válida para validação do schema.

### 3. Conexão Local vs Produção
- **Local (.env):** Utilize a `DATABASE_PUBLIC_URL` do Railway no seu arquivo `.env` local para gerenciar o banco (migrations, seeds, Prisma Studio) do seu PC.
- **Railway (Config):** O serviço de backend no Railway deve utilizar a `DATABASE_URL` **interna** para performance e segurança.

## 🚀 Fluxo de Deploy
O deploy é unificado. O comando de build executa o `build.js` que:
1. Gera o Prisma Client com fallback de URL.
2. Compila o Frontend.
3. Move o Frontend para a pasta `public` do Backend.
4. Compila o Backend (TypeScript).

---
*Nota: Este arquivo deve ser consultado antes de qualquer alteração na estrutura do banco ou scripts de build.*
