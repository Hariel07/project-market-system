#!/bin/bash

# ============================================================
# Script para Iniciar Backend + Frontend do Project Market System
# Use: ./iniciar.sh (macOS/Linux)
# ============================================================

echo ""
echo "  ================================================================"
echo "  🚀 Project Market System - Iniciador Automático"
echo "  ================================================================"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado! Instale em https://nodejs.org"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"
echo ""

# Ir para o diretório do script
cd "$(dirname "$0")"

echo "📁 Diretório do projeto: $(pwd)"
echo ""

# Instalar dependências se necessário
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do Backend..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependências do Frontend..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "================================================================"
echo "🔄 Iniciando Backend + Frontend..."
echo "================================================================"
echo ""
echo "   ⚠️  Serão abertos 2 novos terminais:"
echo "      1. Backend  (porta 3333)"
echo "      2. Frontend (porta 5173)"
echo ""
echo "   📌 Quando estiverem prontos, abra seu navegador em:"
echo "      http://localhost:5173"
echo ""
echo "   🛑 Para parar, pressione Ctrl+C em cada terminal"
echo ""
echo "================================================================"
echo ""

# Iniciar Backend em novo terminal
echo "🔥 Iniciando Backend..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open -a Terminal "$(pwd)/backend" --args "npm run dev"
else
    # Linux
    gnome-terminal -- bash -c "cd backend && npm run dev; bash"
fi

# Aguardar um pouco
sleep 3

# Iniciar Frontend em novo terminal
echo "🎨 Iniciando Frontend..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open -a Terminal "$(pwd)/frontend" --args "npm run dev"
else
    # Linux
    gnome-terminal -- bash -c "cd frontend && npm run dev; bash"
fi

echo ""
echo "✅ Ambos os servidores foram iniciados!"
echo "📝 Verifique os terminais para mais detalhes."
echo ""
