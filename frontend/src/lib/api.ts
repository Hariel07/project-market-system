import axios from 'axios';

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || '';
  
  // Se não houver URL (Produção/Same Domain), usa o prefixo /api relativo
  if (!url) return '/api';

  url = url.trim().replace(/\/+$/, ''); // Limpa espaços e barras no fim

  // Se não começa com http e não é um caminho relativo, assume https
  if (!url.startsWith('http') && !url.startsWith('/')) {
    url = `https://${url}`;
  }

  // Se a URL informada NÃO termina com /api, nós adicionamos
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }

  return url;
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
