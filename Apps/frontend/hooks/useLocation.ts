import { useState, useCallback } from 'react';
import { useMapStore } from '../store/mapStore';
import { showToast } from '../components/ui/Toast';

export const useLocation = () => {
  const { setUserLocation } = useMapStore();
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      const errorMsg = 'Geolokasi tidak didukung oleh browser Anda.';
      setLocationError(errorMsg);
      showToast(errorMsg, '⚠️');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Simpan titik koordinat ke global store
        setUserLocation(latitude, longitude);
        setIsLocating(false);
        showToast('Lokasi berhasil ditemukan', '📍');
      },
      (error) => {
        let errorMsg = 'Gagal mendapatkan lokasi.';
        if (error.code === 1) errorMsg = 'Akses lokasi ditolak. Izinkan akses GPS di browser Anda.';
        else if (error.code === 2) errorMsg = 'Sinyal GPS tidak tersedia.';
        else if (error.code === 3) errorMsg = 'Waktu pencarian lokasi habis (timeout).';
        
        setLocationError(errorMsg);
        showToast(errorMsg, '❌');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [setUserLocation]);

  return {
    isLocating,
    locationError,
    requestLocation
  };
};