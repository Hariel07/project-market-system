#!/bin/bash
# 🚀 Script de Validação — Pronto para Railway?
# Executa verificações antes de fazer deploy

echo "═══════════════════════════════════════════════════════"
echo "  ✓ Railway Deploy Validation Script"
echo "═══════════════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0

# ────────────────────────────────────────────────────────
# 1. Verificar Estrutura de Pastas
# ────────────────────────────────────────────────────────
echo "📁 Verificando estrutura de pastas..."

if [ ! -f "backend/package.json" ]; then
  echo "  ❌ backend/package.json não encontrado"
  ERRORS=$((ERRORS+1))
else
  echo "  ✅ backend/package.json existe"
fi

if [ ! -f "backend/src/server.ts" ]; then
  echo "  ❌ backend/src/server.ts não encontrado"
  ERRORS=$((ERRORS+1))
else
  echo "  ✅ backend/src/server.ts existe"
fi

if [ ! -f "backend/prisma/schema.prisma" ]; then
  echo "  ❌ backend/prisma/schema.prisma não encontrado"
  ERRORS=$((ERRORS+1))
else
  echo "  ✅ backend/prisma/schema.prisma existe"
fi

if [ ! -f "frontend/package.json" ]; then
  echo "  ❌ frontend/package.json não encontrado"
  ERRORS=$((ERRORS+1))
else
  echo "  ✅ frontend/package.json existe"
fi

echo ""

# ────────────────────────────────────────────────────────
# 2. Verificar package.json Scripts
# ────────────────────────────────────────────────────────
echo "📦 Verificando npm scripts do backend..."

if grep -q '"build"' backend/package.json; then
  echo "  ✅ backend: npm run build encontrado"
else
  echo "  ❌ backend: npm run build NÃO ENCONTRADO"
  ERRORS=$((ERRORS+1))
fi

if grep -q '"start"' backend/package.json; then
  echo "  ✅ backend: npm run start encontrado"
else
  echo "  ❌ backend: npm run start NÃO ENCONTRADO"
  ERRORS=$((ERRORS+1))
fi

echo ""
echo "📦 Verificando npm scripts do frontend..."

if grep -q '"build"' frontend/package.json; then
  echo "  ✅ frontend: npm run build encontrado"
else
  echo "  ❌ frontend: npm run build NÃO ENCONTRADO"
  ERRORS=$((ERRORS+1))
fi

echo ""

# ────────────────────────────────────────────────────────
# 3. Verificar Configuração do Railway
# ────────────────────────────────────────────────────────
echo "🚀 Verificando configuração do Railway..."

if [ ! -f "railway.json" ]; then
  echo "  ⚠️  railway.json NÃO ENCONTRADO (vai funcionar, mas sem otimizações)"
  WARNINGS=$((WARNINGS+1))
else
  echo "  ✅ railway.json existe"
fi

if [ ! -f ".env.example" ]; then
  echo "  ⚠️  .env.example NÃO ENCONTRADO (recomendado documenter variáveis)"
  WARNINGS=$((WARNINGS+1))
else
  echo "  ✅ .env.example existe"
fi

echo ""

# ────────────────────────────────────────────────────────
# 4. Verificar .gitignore
# ────────────────────────────────────────────────────────
echo "🔒 Verificando .gitignore..."

if [ ! -f ".gitignore" ]; then
  echo "  ⚠️  .gitignore NÃO ENCONTRADO (risco de vazar .env)"
  WARNINGS=$((WARNINGS+1))
else
  if grep -q ".env" .gitignore; then
    echo "  ✅ .env está no .gitignore"
  else
    echo "  ⚠️  .env NÃO está no .gitignore (RISCO: vazar credenciais!)"
    WARNINGS=$((WARNINGS+1))
  fi
fi

echo ""

# ────────────────────────────────────────────────────────
# 5. Resumo Final
# ────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════"
echo "📊 RESUMO"
echo "═══════════════════════════════════════════════════════"
echo "Erros críticos  : $ERRORS"
echo "Avisos          : $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo "✅ TUDO PRONTO PARA DEPLOY NO RAILWAY!"
  echo ""
  echo "Próximos passos:"
  echo "  1. git push para seu repositório"
  echo "  2. Ir para https://railway.app"
  echo "  3. Create New Project > Deploy from GitHub"
  echo "  4. Selecionar este repositório"
  echo "  5. Conectar PostgreSQL"
  echo "  6. Configurar variáveis de ambiente"
  echo ""
  exit 0
else
  echo "❌ PROBLEMAS ENCONTRADOS! Corrija antes de fazer deploy."
  exit 1
fi
