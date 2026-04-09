import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para proteger rotas que exigem autenticação
 * Redireciona para login se não houver token válido ou se a role não for permitida
 */
export function useAuthProtected(allowedRoles?: string[]) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // ❌ Sem token → Redirecionar para login
    if (!token) {
      console.warn('❌ Autenticação: Token não encontrado');
      navigate('/login', { replace: true });
      return;
    }

    // ❌ Token expirado (se houver validação)
    // TODO: Validar expiration date do JWT no payload

    // ❌ Role não permitida
    if (allowedRoles && !allowedRoles.includes(userRole || '')) {
      console.warn(`❌ Autenticação: Role '${userRole}' não permitida`);
      navigate('/unauthorized', { replace: true });
      return;
    }

    console.log(`✅ Autenticação: Token válido. Role: ${userRole}`);
  }, [navigate, allowedRoles]);
}

/**
 * Getter seguro para dados do usuário autenticado
 */
export function useAuthUser() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  return {
    token,
    userId,
    userRole,
    userName,
    isAuthenticated: !!token,
  };
}

/**
 * Logout seguro
 */
export function useLogout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('@MarketSystem:token');
    localStorage.removeItem('@MarketSystem:user');
    navigate('/login', { replace: true });
  };

  return logout;
}
