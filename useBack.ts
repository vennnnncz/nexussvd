import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Kembali ke halaman sebelumnya, atau ke beranda bila halaman dibuka langsung. */
export function useBack(fallback = '/home') {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(() => {
    if (location.key === 'default') navigate(fallback);
    else navigate(-1);
  }, [navigate, location.key, fallback]);
}
