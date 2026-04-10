// Sound effects using Web Audio API — no external files needed

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume context if suspended (browsers block autoplay until user gesture)
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

/**
 * "PLIM!" — Two ascending tones. Used when a new order arrives.
 */
export function playNotificationSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    [523.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.35, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.4);
    });
  } catch { /* silently ignore on unsupported browsers */ }
}

/**
 * Short beep — Used when an item is scanned/added in the PDV.
 */
export function playBeepSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.value = 1400;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch { /* silently ignore */ }
}
