import { useState, useEffect } from 'react';
import { api } from './api';

export function useAppName(): string {
  const [nomeApp, setNomeApp] = useState<string>(() => {
    // Carregar do localStorage primeiro (mais rápido)
    return localStorage.getItem('nomeApp') || 'Market System';
  });

  useEffect(() => {
    // Carregar do backend e sincronizar
    const carregarNome = async () => {
      try {
        const res = await api.get('/api/config/sistema');
        const nome = res.data.nomeApp || 'Market System';
        setNomeApp(nome);
        localStorage.setItem('nomeApp', nome);
      } catch (err) {
        // Usar o valor do localStorage como fallback
        const saved = localStorage.getItem('nomeApp') || 'Market System';
        setNomeApp(saved);
      }
    };

    carregarNome();
  }, []);

  return nomeApp;
}
