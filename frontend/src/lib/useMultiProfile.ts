import { useState, useEffect } from 'react';
import { api } from './api';

/**
 * Returns true if the current account has more than one profile (role).
 * Caches the result in sessionStorage to avoid repeated API calls.
 * Does NOT call the API if the user is not logged in.
 */
export function useMultiProfile(): boolean {
  const [hasMultiple, setHasMultiple] = useState(() => {
    const cached = sessionStorage.getItem('@ms:profileCount');
    return cached ? parseInt(cached) > 1 : false;
  });

  useEffect(() => {
    // Don't call API if not logged in — prevents 401 redirect loop for guests
    const token = localStorage.getItem('@MarketSystem:token');
    if (!token) return;

    const cached = sessionStorage.getItem('@ms:profileCount');
    if (cached) return;

    api.get('auth/my-profiles')
      .then(res => {
        const count = Array.isArray(res.data) ? res.data.length : 0;
        sessionStorage.setItem('@ms:profileCount', String(count));
        setHasMultiple(count > 1);
      })
      .catch(() => {});
  }, []);

  return hasMultiple;
}
