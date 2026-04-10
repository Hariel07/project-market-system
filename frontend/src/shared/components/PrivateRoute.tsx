import { Navigate, useLocation } from 'react-router-dom';
import { isTokenValid } from '../../lib/utils';

interface PrivateRouteProps {
  element: React.ReactElement;
  /** Allowed roles. Empty array = any authenticated user. */
  roles: string[];
}

export function PrivateRoute({ element, roles }: PrivateRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem('@MarketSystem:token');
  const userStr = localStorage.getItem('@MarketSystem:user');

  // Not authenticated or token expired
  if (!userStr || !isTokenValid(token)) {
    if (token || userStr) {
      localStorage.removeItem('@MarketSystem:token');
      localStorage.removeItem('@MarketSystem:user');
    }
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  // Check role authorization
  if (roles.length > 0) {
    try {
      const user = JSON.parse(userStr);
      if (!roles.includes(user.role)) {
        // Authenticated but wrong role — send to their own section
        return <Navigate to="/" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return element;
}
