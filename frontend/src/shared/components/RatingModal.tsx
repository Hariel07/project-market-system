import React, { useState } from 'react';
import './RatingModal.css';
import { api } from '../../lib/api';

interface RatingModalProps {
  entregaId: string;
  entregadorNome: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

export function RatingModal({
  entregaId,
  entregadorNome,
  isOpen,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const [estrelas, setEstrelas] = useState(0);
  const [hoveredEstrela, setHoveredEstrela] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const enviarAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estrelas === 0) {
      setError('Por favor, selecione uma avaliação');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/avaliacoes', {
        entregaId,
        estrelas,
        comentario: comentario || undefined,
      });
      setSuccess(true);
      if (onSubmit) onSubmit();
      setTimeout(onClose, 1500);
    } catch (erro: any) {
      setError(
        erro.response?.data?.erro || 'Erro ao enviar avaliação. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="rating-header">
          <h2>Como foi a entrega?</h2>
          <p>Sua avaliação ajuda {entregadorNome} a melhorar 🚀</p>
        </div>

        <form onSubmit={enviarAvaliacao} className="rating-form">
          {success && (
            <div className="success-message">
              ✨ Obrigado pela sua avaliação!
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="stars-container">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  type="button"
                  className={`star ${
                    estrela <= (hoveredEstrela || estrelas) ? 'active' : ''
                  }`}
                  onClick={() => setEstrelas(estrela)}
                  onMouseEnter={() => setHoveredEstrela(estrela)}
                  onMouseLeave={() => setHoveredEstrela(0)}
                >
                  ★
                </button>
              ))}
            </div>
            {estrelas > 0 && (
              <div className="stars-text">
                {estrelas === 1 && 'Ruim 😞'}
                {estrelas === 2 && 'Poderia melhorar 😐'}
                {estrelas === 3 && 'Bom 😊'}
                {estrelas === 4 && 'Muito bom! 😄'}
                {estrelas === 5 && 'Excelente! 🤩'}
              </div>
            )}
          </div>

          <div className="comment-section">
            <label htmlFor="comentario">Deixe um comentário (opcional)</label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Seu feedback é importante..."
              maxLength={500}
              rows={4}
            />
            <span className="char-count">
              {comentario.length}/500
            </span>
          </div>

          <div className="button-group">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || estrelas === 0 || success}
            >
              {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
