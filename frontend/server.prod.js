import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5173;

// Servir arquivos estáticos da pasta 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// Redirecionar todas as rotas para o index.html (Suporte a SPA/React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Frontend production server running on port ${port}`);
  console.log(`🌐 Accessible at http://0.0.0.0:${port}`);
});
