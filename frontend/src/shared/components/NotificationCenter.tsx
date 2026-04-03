import React, { useState, useEffect } from 'react';
import './NotificationCenter.css';
import { api } from '../../lib/api';

interface Notification {
  id: string;
  titulo: string;
  corpo: string;
  icone?: string;
  lido: boolean;
  createdAt: string;
  tipo: string;
}

export function NotificationCenter() {
  const [notificacoes, setNotificacoes] = useState<Notification[]>([]);
  const [countNaoLidas, setCountNaoLidas] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Carregar notificações
  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const [respNotificacoes, respCount] = await Promise.all([
        api.get('/notificacoes'),
        api.get('/notificacoes/nao-lidas/count'),
      ]);
      setNotificacoes(respNotificacoes.data);
      setCountNaoLidas(respCount.data.count);
    } catch (erro) {
      console.error('Erro ao carregar notificações:', erro);
    } finally {
      setLoading(false);
    }
  };

  // Carregar notificações ao montar e a cada 10 segundos
  useEffect(() => {
    carregarNotificacoes();
    const interval = setInterval(carregarNotificacoes, 10000);
    return () => clearInterval(interval);
  }, []);

  const marcarComoLida = async (id: string) => {
    try {
      await api.put(`/notificacoes/${id}/lido`);
      setNotificacoes(
        notificacoes.map((n) => (n.id === id ? { ...n, lido: true } : n))
      );
      setCountNaoLidas(Math.max(0, countNaoLidas - 1));
    } catch (erro) {
      console.error('Erro ao marcar como lida:', erro);
    }
  };

  const marcarTodasComoLida = async () => {
    try {
      await api.put('/notificacoes/', {});
      setNotificacoes(notificacoes.map((n) => ({ ...n, lido: true })));
      setCountNaoLidas(0);
    } catch (erro) {
      console.error('Erro ao marcar todas como lida:', erro);
    }
  };

  const deletarNotificacao = async (id: string) => {
    try {
      await api.delete(`/notificacoes/${id}`);
      setNotificacoes(notificacoes.filter((n) => n.id !== id));
    } catch (erro) {
      console.error('Erro ao deletar notificação:', erro);
    }
  };

  return (
    <div className="notification-center">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notificações"
      >
        🔔
        {countNaoLidas > 0 && <span className="badge">{countNaoLidas}</span>}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notificações</h3>
            {countNaoLidas > 0 && (
              <button
                className="mark-all-read"
                onClick={marcarTodasComoLida}
              >
                Marcar todas como lida
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading && <div className="loading">Carregando...</div>}
            {!loading && notificacoes.length === 0 && (
              <div className="empty-state">Sem notificações</div>
            )}
            {notificacoes.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${notif.lido ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <div className="notification-icon">{notif.icone || '📢'}</div>
                  <div className="notification-text">
                    <h4>{notif.titulo}</h4>
                    <p>{notif.corpo}</p>
                    <span className="notification-time">
                      {new Date(notif.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="notification-actions">
                  {!notif.lido && (
                    <button
                      className="action-btn"
                      onClick={() => marcarComoLida(notif.id)}
                      title="Marcar como lida"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="action-btn delete"
                    onClick={() => deletarNotificacao(notif.id)}
                    title="Deletar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
