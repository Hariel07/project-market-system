import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import categoriasRoutes from './routes/categorias.routes';
import produtosRoutes from './routes/produtos.routes';

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
app.use('/api/categorias', categoriasRoutes);
app.use('/api/produtos', produtosRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor backend rodando na porta ${port}`);
});
