import { useState, useRef } from 'react';
import { api } from '../../lib/api';

interface Props {
  label: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  aspect?: 'square' | 'wide';
}

/**
 * Retorna a URL de exibição. Em dev, o Vite proxy encaminha /uploads/* para o backend.
 * Em prod, mesma origem. Blob/data/http passam direto.
 */
function toDisplayUrl(url: string): string {
  if (!url) return '';
  // Absolute and blob/data URLs pass through unchanged
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  // Relative /uploads/... — works in dev via Vite proxy, in prod via same origin
  return url;
}

export default function ImageUpload({ label, currentUrl, onUploaded, aspect = 'square' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // blob URL temporária durante o upload — substitui a prop até o upload terminar
  const [blobPreview, setBlobPreview] = useState<string | null>(null);

  // URL a exibir: blob durante upload, depois a URL salva (absoluta)
  const displayUrl = blobPreview || toDisplayUrl(currentUrl);

  const isWide = aspect === 'wide';
  const w = isWide ? '100%' : '100px';
  const h = isWide ? '120px' : '100px';
  const radius = isWide ? '16px' : '20px';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blob = URL.createObjectURL(file);
    setBlobPreview(blob);
    setUploading(true);

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(res.data.url); // passa URL relativa ao pai (para salvar no banco)
    } catch {
      alert('Erro ao enviar imagem. Tente novamente.');
      setBlobPreview(null);
    } finally {
      setUploading(false);
      // libera memória do blob
      URL.revokeObjectURL(blob);
      setBlobPreview(null); // volta a usar currentUrl (agora atualizada pelo pai)
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBlobPreview(null);
    onUploaded('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</label>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          width: w, height: h, borderRadius: radius,
          border: `2px ${displayUrl ? 'solid' : 'dashed'} var(--color-border, #d1d5db)`,
          background: 'var(--color-surface, #f8fafc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          position: 'relative', overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}
      >
        {/* Imagem salva ou blob preview */}
        {displayUrl && !uploading && (
          <img
            src={displayUrl}
            alt={label}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        {/* Placeholder quando vazio */}
        {!displayUrl && !uploading && (
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '0.5rem' }}>
            📷 Clique para enviar
          </span>
        )}

        {/* Spinner durante upload */}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '0.4rem',
          }}>
            <span className="spinner" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
            <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 600 }}>Enviando...</span>
          </div>
        )}

        {/* Botão "Alterar" sobre a imagem */}
        {displayUrl && !uploading && (
          <div style={{
            position: 'absolute', bottom: 5, right: 5,
            background: 'rgba(0,0,0,0.6)', borderRadius: 8,
            padding: '2px 7px', fontSize: '0.65rem', color: '#fff', fontWeight: 700,
            pointerEvents: 'none',
          }}>
            ✎ Alterar
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {displayUrl && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: 0 }}
        >
          ✕ Remover
        </button>
      )}
    </div>
  );
}
