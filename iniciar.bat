@echo off
REM ============================================================
REM Script para Iniciar Backend + Frontend do Project Market System
REM ============================================================

echo.
echo   ================================================================
echo   🚀 Project Market System - Iniciador Automático
echo   ================================================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale em https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Ir para o diretório raiz do projeto
cd /d "%~dp0"

echo 📁 Diretório do projeto: %cd%
echo.

REM Instalar dependências se necessário
if not exist "backend\node_modules" (
    echo 📦 Instalando dependências do Backend...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📦 Instalando dependências do Frontend...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ================================================================
echo 🔄 Iniciando Backend + Frontend...
echo ================================================================
echo.
echo   ⚠️  Serão abertos 2 novos terminais:
echo      1. Backend  (porta 3333)
echo      2. Frontend (porta 5173)
echo.
echo   📌 Quando estiverem prontos, abra seu navegador em:
echo      http://localhost:5173
echo.
echo   🛑 Para parar, feche os terminais (Ctrl+C)
echo.
echo ================================================================
echo.

REM Iniciar Backend em novo terminal
echo 🔥 Iniciando Backend...
start cmd /k "cd backend && npm run dev"

REM Aguardar um pouco para o backend ativar
timeout /t 3 /nobreak

REM Iniciar Frontend em novo terminal
echo 🎨 Iniciando Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Ambos os servidores foram iniciados!
echo 📝 Verificare os terminais para mais detalhes.
echo.

pause
