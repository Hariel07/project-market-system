import React, { useState, useEffect } from 'react';
import './ChatModal.css';
import { api } from '../../lib/api';

interface Message {
  id: string;
  conteudo: string;
  enviahoPor: string;
  usuario: { nome: string };
  createdAt: string;
  lido: boolean;
}

interface ChatModalProps {
  entregaId: string;
  isOpen: boolean;
  onClose: () => void;
  clienteNome: string;
}

export function ChatModal({ entregaId, isOpen, onClose, clienteNome }: ChatModalProps) {
  const [mensagens, setMensagens] = useState<Message[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  // Obter ou criar chat
  useEffect(() => {
    if (!isOpen || !entregaId) return;

    const abrirChat = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/chat/entrega/${entregaId}`);
        setChatId(response.data.id);
        setMensagens(Array.isArray(response.data.mensagens) ? response.data.mensagens : []);
      } catch (erro) {
        console.error('Erro ao abrir chat:', erro);
        setMensagens([]);
      } finally {
        setLoading(false);
      }
    };

    abrirChat();
  }, [isOpen, entregaId]);

  // Auto-refresh de mensagens a cada 2 segundos
  useEffect(() => {
    if (!chatId || !isOpen) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/chat/${chatId}/mensagens`);
        setMensagens(Array.isArray(response.data) ? response.data : []);
      } catch (erro) {
        console.error('Erro ao carregar mensagens:', erro);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [chatId, isOpen]);

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !chatId) return;

    try {
      const response = await api.post(`/chat/${chatId}/mensagens`, {
        conteudo: novaMensagem,
      });
      setMensagens([...mensagens, response.data]);
      setNovaMensagem('');
    } catch (erro) {
      console.error('Erro ao enviar mensagem:', erro);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>💬 Chat com {clienteNome}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages">
          {loading && <div className="loading">Carregando chat...</div>}
          {mensagens.length === 0 && !loading && (
            <div className="empty-chat">Nenhuma mensagem ainda</div>
          )}
          {mensagens.map((msg) => (
            <div key={msg.id} className={`message ${msg.enviahoPor}`}>
              <div className="message-author">{msg.usuario.nome}</div>
              <div className="message-content">{msg.conteudo}</div>
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString('pt-BR')}
              </div>
            </div>
          ))}
        </div>

        <form className="chat-input-form" onSubmit={enviarMensagem}>
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={!chatId}
          />
          <button type="submit" disabled={!chatId || !novaMensagem.trim()}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
