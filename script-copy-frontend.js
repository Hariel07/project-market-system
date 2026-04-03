#!/usr/bin/env node

/**
 * Copy Frontend dist to Backend public
 * Cross-platform (Windows + Linux + macOS)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const frontendDist = path.join(__dirname, 'frontend', 'dist');
const backendPublic = path.join(__dirname, 'backend', 'public');

console.log('📋 Copying frontend/dist to backend/public...');

try {
  // Deleta public anterior se existe
  if (fs.existsSync(backendPublic)) {
    console.log(`   🗑️  Removing ${backendPublic}`);
    fs.rmSync(backendPublic, { recursive: true, force: true });
  }

  // Cria e copia
  console.log(`   📂 Creating ${backendPublic}`);
  fs.mkdirSync(backendPublic, { recursive: true });

  console.log(`   📥 Copying files...`);
  fs.cpSync(frontendDist, backendPublic, { recursive: true });

  console.log('✅ Frontend copied successfully!\n');
} catch (error) {
  console.error('❌ Copy failed:', error.message);
  process.exit(1);
}
