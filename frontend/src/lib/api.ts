import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

// Interceptor para adicionar o Token JWT em todas as requisições autenticadas Futuramente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@MarketSystem:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
