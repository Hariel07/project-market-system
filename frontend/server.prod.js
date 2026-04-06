import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// O Railway sempre fornece a variável PORT
const port = process.env.PORT || 8080;

const distPath = path.join(__dirname, 'dist');

console.log(`📂 Verificando pasta de build em: ${distPath}`);

if (!fs.existsSync(distPath)) {
  console.error('❌ ERRO: Pasta "dist" não encontrada! O build pode ter falhado.');
} else {
  console.log('✅ Pasta "dist" encontrada com sucesso.');
}

// Servir arquivos estáticos
app.use(express.static(distPath));

// Redirecionar todas as rotas para o index.html (Suporte a SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Please check deployment logs.');
  }
});

// É CRUCIAL ouvir em 0.0.0.0 para o Railway conseguir acessar
app.listen(port, '0.0.0.0', () => {
  console.log('=========================================');
  console.log(`🚀 FRONTEND SERVER IS LIVE!`);
  console.log(`📡 Port: ${port}`);
  console.log(`🌍 Host: 0.0.0.0 (Publicly Accessible)`);
  console.log('=========================================');
});
