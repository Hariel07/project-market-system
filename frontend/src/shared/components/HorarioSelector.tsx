import { useState, useEffect } from 'react';

const DIAS = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
];

const HORAS = Array.from({ length: 25 }, (_, i) => {
  const h = String(i).padStart(2, '0');
  return `${h}:00`;
});

interface DiaHorario {
  ativo: boolean;
  abre: string;
  fecha: string;
}

type Horarios = Record<string, DiaHorario>;

function parseHorarios(raw: string): Horarios {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) return parsed;
  } catch {}
  // Default: seg-sex 08-18, sab 08-13, dom fechado
  const def: Horarios = {};
  DIAS.forEach(d => {
    if (d.key === 'dom') def[d.key] = { ativo: false, abre: '08:00', fecha: '18:00' };
    else if (d.key === 'sab') def[d.key] = { ativo: true, abre: '08:00', fecha: '13:00' };
    else def[d.key] = { ativo: true, abre: '08:00', fecha: '18:00' };
  });
  return def;
}

function formatForDisplay(horarios: Horarios): string {
  const lines: string[] = [];
  DIAS.forEach(d => {
    const h = horarios[d.key];
    if (!h) return;
    lines.push(h.ativo ? `${d.label}: ${h.abre} às ${h.fecha}` : `${d.label}: Fechado`);
  });
  return lines.join(' | ');
}

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function HorarioSelector({ value, onChange }: Props) {
  const [horarios, setHorarios] = useState<Horarios>(() => parseHorarios(value));

  useEffect(() => {
    onChange(JSON.stringify(horarios));
  }, [horarios]);

  const update = (dia: string, field: keyof DiaHorario, val: any) => {
    setHorarios(prev => ({ ...prev, [dia]: { ...prev[dia], [field]: val } }));
  };

  return (
    <div>
      <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
        Horário de Atendimento
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {DIAS.map(d => {
          const h = horarios[d.key];
          if (!h) return null;
          return (
            <div key={d.key} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.5rem 0.8rem', background: h.ativo ? 'var(--color-surface, #f8fafc)' : '#fef2f2',
              borderRadius: '12px', border: `1px solid ${h.ativo ? 'var(--color-border-light, #e2e8f0)' : '#fecaca'}`,
              fontSize: '0.85rem', flexWrap: 'wrap',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', minWidth: '60px', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={h.ativo}
                  onChange={e => update(d.key, 'ativo', e.target.checked)}
                  style={{ width: '1.1rem', height: '1.1rem' }}
                />
                {d.label}
              </label>
              {h.ativo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <select
                    value={h.abre}
                    onChange={e => update(d.key, 'abre', e.target.value)}
                    style={{ padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--color-border, #d1d5db)', fontSize: '0.85rem' }}
                  >
                    {HORAS.map(hr => <option key={hr} value={hr}>{hr}</option>)}
                  </select>
                  <span style={{ color: 'var(--color-text-secondary)' }}>às</span>
                  <select
                    value={h.fecha}
                    onChange={e => update(d.key, 'fecha', e.target.value)}
                    style={{ padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--color-border, #d1d5db)', fontSize: '0.85rem' }}
                  >
                    {HORAS.map(hr => <option key={hr} value={hr}>{hr}</option>)}
                  </select>
                </div>
              ) : (
                <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8rem' }}>Fechado</span>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem' }}>
        Exibido na vitrine: <strong>{formatForDisplay(horarios)}</strong>
      </p>
    </div>
  );
}
