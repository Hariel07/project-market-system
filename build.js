#!/usr/bin/env node

/**
 * Build Script Unificado — Frontend + Backend
 * 
 * Executa em ordem:
 * 1. Prisma Generate (skip se sem DATABASE_URL — é ok, roda no runtime)
 * 2. Build do Frontend (Vite) → frontend/dist
 * 3. Copy frontend/dist → backend/public
 * 4. Build do Backend (TypeScript) → backend/dist
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
  // 0. Generate Prisma Client (optional)
  // ========================================
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  
  if (hasDatabaseUrl) {
    console.log('⚙️  [0/4] Generating Prisma Client...');
    console.log(`   📍 ${backendDir}`);
    
    try {
      execSync('npm install && npx prisma generate', {
        cwd: backendDir,
        stdio: 'inherit'
      });
      
      console.log('✅ Prisma Client generated!\n');
    } catch (error) {
      console.log('⚠️  Prisma generation skipped (will be generated at runtime)\n');
    }
  } else {
    console.log('⏭️  [0/4] Skipping Prisma generate (DATABASE_URL not set)\n');
    console.log('   ℹ️  Prisma Client will be generated at runtime\n');
  }

  // ========================================
  // 1. Build Frontend
  // ========================================
  console.log('🔨 [1/4] Building Frontend...');
  console.log(`   📍 ${frontendDir}`);
  
  execSync('npm install && npm run build', {
    cwd: frontendDir,
    stdio: 'inherit'
  });
  
  console.log('✅ Frontend built successfully!\n');

  // ========================================
  // 2. Copy Frontend para Backend/public
  // ========================================
  console.log('📋 [2/4] Copying Frontend dist to Backend/public...');
  
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
  console.log('🔨 [3/4] Building Backend TypeScript...');
  console.log(`   📍 ${backendDir}`);
  
  // IMPORTANTE: Instalar dependências do backend também
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
  console.log(`\n🚀 Para rodar: node backend/dist/server.js\n`);

} catch (error) {
  console.error('\n❌ BUILD FALHOU!');
  console.error(error.message);
  process.exit(1);
}
