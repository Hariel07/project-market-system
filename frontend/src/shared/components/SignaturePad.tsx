import { useRef, useState } from 'react';

interface SignaturePadProps {
  onSave: (signature: string) => void; // Base64 da assinatura
  onCancel: () => void;
}

/**
 * Componente para capturar assinatura do cliente
 * Usa <canvas> para permitir desenho livre
 */
export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Inicializar canvas com fundo branco
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar borda cinza
    ctx.strokeStyle = '#D0D0D0';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  };

  // Começar a desenhar
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const rect = canvas!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setIsEmpty(false);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Desenhar
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const rect = canvas!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#333';
    ctx.stroke();
  };

  // Parar de desenhar
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Limpar canvas
  const clearSignature = () => {
    setIsEmpty(true);
    initializeCanvas();
  };

  // Salvar assinatura como Base64
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) {
      alert('Por favor, assine antes de confirmar');
      return;
    }

    const base64 = canvas.toDataURL('image/png');
    onSave(base64);
  };

  return (
    <div className="signature-pad-container">
      <h3 className="signature-title">✍️ Assinatura do Cliente</h3>
      <p className="signature-instruction">
        Peça ao cliente que assine abaixo
      </p>

      {/* Canvas para desenho */}
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="signature-canvas"
        style={{
          border: '2px solid #DDD',
          borderRadius: '8px',
          cursor: 'crosshair',
          backgroundColor: '#FFF',
          display: 'block',
          margin: '12px 0',
          width: '100%',
          maxWidth: '100%',
        }}
      />

      {/* Botões de ação */}
      <div className="signature-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={clearSignature}
          className="btn btn-sm btn-outline"
          style={{ flex: 1 }}
        >
          🗑️ Limpar
        </button>
        <button
          onClick={saveSignature}
          className="btn btn-sm btn-accent"
          style={{ flex: 2 }}
          disabled={isEmpty}
        >
          ✅ Confirmar Assinatura
        </button>
      </div>

      {/* Opção de cancelar */}
      <button
        onClick={onCancel}
        className="btn btn-sm btn-outline btn-block"
        style={{ marginTop: '8px' }}
      >
        ← Voltar
      </button>
    </div>
  );
}
