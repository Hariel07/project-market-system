import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import produtosRoutes from './routes/produtos.routes.js';
import planosRoutes from './routes/planos.routes.js';
import configRoutes from './routes/config.routes.js';
import { perfilRoutes } from './routes/perfil.routes.js';
import comerciosRoutes from './routes/comercios.routes.js';
import entregasRoutes from './routes/entregas.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import chatRoutes from './routes/chat.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { maintenanceMiddleware } from './middlewares/maintenance.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3333;

// Middleware - Limites aumentados para suportar logos em Base64
app.use(cors({
  origin: '*', // Permite todas as origens para resolver o problema no Railway
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Bloqueio Global de Manutenção
app.use(maintenanceMiddleware);

// Logger para depuração (Railway)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ========================================
// SERVIR ARQUIVOS ESTÁTICOS DO FRONTEND
// ========================================
// Frontend compilado está em ../public (relativo a dist/server.js)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

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
app.use('/api/config', configRoutes);
app.use('/api/admin', adminRoutes);

// ========================================
// SPA FALLBACK (Sempre por último)
// ========================================
// Redireciona qualquer requisição que não seja API para o Frontend
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Rota de API não encontrada' });
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ========================================
// SERVIDOR HTTP
// ========================================
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend rodando na porta ${port}`);
  console.log(`📱 Frontend servido em http://0.0.0.0:${port}`);
  console.log(`⚡ API disponível em http://0.0.0.0:${port}/api`);
});
