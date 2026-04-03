#!/usr/bin/env node

/**
 * Build Script Unificado — Frontend + Backend
 * 
 * Executa em ordem:
 * 1. Build do Frontend (Vite) → frontend/dist
 * 2. Copy frontend/dist → backend/public
 * 3. Build do Backend (TypeScript) → backend/dist
 * 
 * Usage: node build.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectRoot = __dirname;
const frontendDir = path.join(projectRoot, 'frontend');
const backendDir = path.join(projectRoot, 'backend');
const publicDir = path.join(backendDir, 'public');

console.log('\n📦 === BUILD UNIFICADO ===\n');

try {
  // ========================================
  // 1. Build Frontend
  // ========================================
  console.log('🔨 [1/3] Building Frontend...');
  console.log(`   📍 ${frontendDir}`);
  
  execSync('npm install && npm run build', {
    cwd: frontendDir,
    stdio: 'inherit'
  });
  
  console.log('✅ Frontend built successfully!\n');

  // ========================================
  // 2. Copy Frontend para Backend/public
  // ========================================
  console.log('📋 [2/3] Copying Frontend dist to Backend/public...');
  
  const frontendDist = path.join(frontendDir, 'dist');
  
  // Deleta public anterior se existe
  if (fs.existsSync(publicDir)) {
    console.log(`   🗑️  Removing ${publicDir}`);
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  
  // Cria public e copia
  console.log(`   📂 Creating ${publicDir}`);
  fs.mkdirSync(publicDir, { recursive: true });
  
  console.log(`   📥 Copying ${frontendDist} → ${publicDir}`);
  fs.cpSync(frontendDist, publicDir, { recursive: true });
  
  console.log('✅ Frontend copied successfully!\n');

  // ========================================
  // 3. Build Backend
  // ========================================
  console.log('🔨 [3/3] Building Backend...');
  console.log(`   📍 ${backendDir}`);
  
  execSync('npm install && npm run build', {
    cwd: backendDir,
    stdio: 'inherit'
  });
  
  console.log('✅ Backend built successfully!\n');

  // ========================================
  // FIM
  // ========================================
  console.log('🎉 === BUILD COMPLETO ===');
  console.log('✅ Frontend + Backend compilados com sucesso!');
  console.log('\n📦 Estrutura final:');
  console.log(`   backend/dist/          → código compilado`);
  console.log(`   backend/public/        → frontend estático`);
  console.log(`\n🚀 Para rodar: npm start\n`);

} catch (error) {
  console.error('\n❌ BUILD FALHOU!');
  console.error(error.message);
  process.exit(1);
}
