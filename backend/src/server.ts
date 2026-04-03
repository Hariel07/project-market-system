import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

const app = express();
const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ status: 'Online', message: 'Market System API rodando perfeitamente!' });
});

// Rotas Base API
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

app.listen(port, () => {
  console.log(`🚀 Servidor backend rodando na porta ${port}`);
});

