import { useState, useEffect } from 'react';

interface GeoPos { lat: number; lng: number }

/**
 * Returns the user's current GPS position (or null if denied/unavailable).
 * Caches in sessionStorage so the prompt only fires once per session.
 */
export function useGeolocation(): GeoPos | null {
  const [pos, setPos] = useState<GeoPos | null>(() => {
    const cached = sessionStorage.getItem('@ms:geo');
    if (cached) {
      try { return JSON.parse(cached); } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    if (pos) return; // already have it
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (p) => {
        const geo = { lat: p.coords.latitude, lng: p.coords.longitude };
        sessionStorage.setItem('@ms:geo', JSON.stringify(geo));
        setPos(geo);
      },
      () => {}, // silently ignore denial
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, [pos]);

  return pos;
}
