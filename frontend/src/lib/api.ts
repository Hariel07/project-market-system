import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || '';

  if (!url || url === '/api') return '';

  return url.trim().replace(/\/$/, '');
};

export const api = axios.create({
  baseURL: getBaseURL(),
});

// Interceptor para adicionar o Token JWT em todas as requisições autenticadas Futuramente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@MarketSystem:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros globais (ex: Token Expirado/Inválido após Reset)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 e não for na rota de login ou check-cpf, limpa a sessão
    const isPublicRoute = error.config.url.includes('/login') || 
                         error.config.url.includes('/check-cpf') || 
                         error.config.url.includes('/setup-check');

    if (error.response?.status === 401 && !isPublicRoute) {
      console.warn('Sessão inválida detectada. Limpando dados locais...');
      localStorage.removeItem('@MarketSystem:token');
      localStorage.removeItem('@MarketSystem:user');
      
      // Evita loops infinitos de reload
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/cadastro')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);
