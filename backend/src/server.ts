import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes';
import categoriasRoutes from './routes/categorias.routes';
import produtosRoutes from './routes/produtos.routes';
import planosRoutes from './routes/planos.routes';
import configRoutes from './routes/config.routes';
import { perfilRoutes } from './routes/perfil.routes';
import comerciosRoutes from './routes/comercios.routes';
import entregasRoutes from './routes/entregas.routes';
import pedidosRoutes from './routes/pedidos.routes';
import chatRoutes from './routes/chat.routes';
import notificationRoutes from './routes/notification.routes';
import ratingRoutes from './routes/rating.routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// ========================================
// SERVIR ARQUIVOS ESTÁTICOS DO FRONTEND
// ========================================
// Frontend compilado está em ../public (relativo a dist/server.js)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// SPA Fallback: Redireciona requisições não-API para index.html
app.get('(.*)', (req, res, next) => {
  // Se começar com /api, deixa chegar nas rotas da API
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Caso contrário, serve o index.html (para React Router funcionar)
  res.sendFile(path.join(publicPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'Online', message: 'Market System API rodando perfeitamente!' });
});

// ========================================
// ROTAS DA API
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/comercios', comerciosRoutes);
app.use('/api/entregas', entregasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notificacoes', notificationRoutes);
app.use('/api/avaliacoes', ratingRoutes);

// Rotas de Planos e Config (públicas + admin)
app.use('/api', planosRoutes);
app.use('/api', configRoutes);

// ========================================
// SERVIDOR HTTP
// ========================================
app.listen(port, () => {
  console.log(`🚀 Servidor backend rodando na porta ${port}`);
  console.log(`📱 Frontend servido em http://localhost:${port}`);
  console.log(`⚡ API disponível em http://localhost:${port}/api`);
});

