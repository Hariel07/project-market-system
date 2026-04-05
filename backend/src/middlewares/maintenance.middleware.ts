import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function maintenanceMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Algumas rotas são SEMPRE liberadas (Login e Status de Manutenção)
    const isPublicConfig = req.path.includes('/api/config/public');
    const isLogin = req.path.includes('/api/auth/login');
    const isStatus = req.path.includes('/api/status');

    if (isPublicConfig || isLogin || isStatus) {
      return next();
    }

    // 2. Busca a configuração global
    const config = await prisma.platformConfig.findUnique({
      where: { id: 'singleton' }
    });

    // 3. Se modo manutenção OFF, segue vida normal
    if (!config?.modoManutencao) {
      return next();
    }

    // 4. Se modo manutenção ON, verificamos se é ADMIN pelo token
    const authHeader = req.headers.authorization;
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.role === 'ADMIN') {
          isAdmin = true;
        }
      } catch (e) {
        // Token inválido ou expirado
      }
    }

    if (isAdmin) {
      return next(); // Admin sempre passa
    }

    // 5. Bloqueia para todos os outros
    res.status(503).json({
      error: 'SISTEMA EM MANUTENÇÃO',
      message: 'Estamos realizando melhorias. Voltamos em instantes!',
      modoManutencao: true
    });

  } catch (error) {
    next();
  }
}
