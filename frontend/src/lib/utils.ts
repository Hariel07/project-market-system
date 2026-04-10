export function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Haversine distance between two lat/lng points. Returns meters.
 */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Formats a distance in meters to a human-readable string.
 * < 1000m → "850 m"  |  >= 1000m → "2,3 km"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

const DAY_KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

/**
 * Parse horarioAtendimento JSON and return today's schedule as a readable string.
 * e.g. "Hoje: 08:00 às 18:00" or "Hoje: Fechado"
 */
export function getHorarioHoje(horarioJson: string): string {
  try {
    const h = JSON.parse(horarioJson);
    const key = DAY_KEYS[new Date().getDay()];
    const dia = h[key];
    if (!dia) return '';
    return dia.ativo ? `Hoje: ${dia.abre} às ${dia.fecha}` : 'Hoje: Fechado';
  } catch {
    return '';
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
