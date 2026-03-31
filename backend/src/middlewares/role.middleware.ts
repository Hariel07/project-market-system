import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de Autorização (RBAC) — O "Guarda de Trânsito".
 * Recebe uma lista de roles permitidos e bloqueia qualquer usuário
 * que não possua uma dessas roles.
 * 
 * Uso nas rotas:
 *   router.post('/produtos', authMiddleware, roleMiddleware('DONO', 'GERENTE'), criarProduto);
 * 
 * Isso garante que apenas Donos e Gerentes possam criar produtos.
 * O authMiddleware DEVE rodar antes para garantir que req.user exista.
 */
export function roleMiddleware(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Acesso negado. Você não tem permissão para esta ação.',
        requiredRoles: allowedRoles,
        yourRole: req.user.role,
      });
      return;
    }

    next();
  };
}
