import { useState, useEffect } from 'react';
import { api } from './api';

interface AppConfig {
  nomeApp: string;
  logoUrl: string | null;
  modoManutencao: boolean;
}

export function useAppName(): string {
  const [nomeApp, setNomeApp] = useState<string>(() => {
    return localStorage.getItem('nomeApp') || 'Market System';
  });

  useEffect(() => {
    const carregarNome = async () => {
      try {
        // Usa a rota pública para que todos vejam o nome correto
        const res = await api.get('/api/config/public');
        const nome = res.data.nomeApp || 'Market System';
        setNomeApp(nome);
        localStorage.setItem('nomeApp', nome);
      } catch (err) {
        const saved = localStorage.getItem('nomeApp') || 'Market System';
        setNomeApp(saved);
      }
    };

    carregarNome();
  }, []);

  return nomeApp;
}

export function useAppConfig(): AppConfig {
  const [config, setConfig] = useState<AppConfig>(() => ({
    nomeApp: localStorage.getItem('nomeApp') || 'Market System',
    logoUrl: null,
    modoManutencao: false // Padrão seguro
  }));

  useEffect(() => {
    const carregarConfig = async () => {
      try {
        // Cache buster para garantir que pegamos o status real da manutenção
        const res = await api.get(`/api/config/public?t=${Date.now()}`);
        setConfig({
          nomeApp: res.data.nomeApp || 'Market System',
          logoUrl: res.data.logoUrl || null,
          modoManutencao: res.data.modoManutencao || false
        });
        localStorage.setItem('nomeApp', res.data.nomeApp);
      } catch (err) {
        // Fallback mantém o que já temos
      }
    };

    carregarConfig();
  }, []);

  return config;
}
