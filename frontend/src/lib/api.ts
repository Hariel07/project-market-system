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

/**
 * Converte uma URL relativa de upload (/uploads/...) para a URL absoluta correta.
 * Em dev, o backend está em porta diferente do frontend.
 * Em produção, ambos estão na mesma origem.
 */
export function resolveUploadUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const apiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (apiUrl.startsWith('http')) {
    try { return `${new URL(apiUrl).origin}${url}`; } catch {}
  }
  return url; // produção: mesma origem
}

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
    const url: string = error?.config?.url ?? '';
    const isPublicRoute =
      url.includes('/login') ||
      url.includes('/check-cpf') ||
      url.includes('/setup-check') ||
      url.includes('/config/public') ||
      url.includes('/categorias/public') ||
      url.includes('/comercios/public') ||
      url.includes('/produtos/public') ||
      url.includes('/auth/restore');

    if (error.response?.status === 401 && !isPublicRoute) {
      console.warn('Sessão inválida detectada. Limpando dados locais...');
      localStorage.removeItem('@MarketSystem:token');
      localStorage.removeItem('@MarketSystem:user');

      // Evita loops infinitos de reload
      const onLogin = window.location.pathname.includes('/login') || window.location.pathname.includes('/cadastro');
      if (!onLogin) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);
