import { useCallback } from 'react';
import { useMapStore } from '../store/mapStore';
import { showToast } from '../components/ui/Toast';

export const useMap = () => {
  // Mengambil instans peta dan lokasi pengguna dari global store
  const { mapInstance, userLocation } = useMapStore();

  // Fungsi untuk memusatkan kamera peta kembali ke posisi GPS pengguna
  const centerToUser = useCallback(() => {
    if (!mapInstance) return;

    if (userLocation) {
      // Terbang perlahan ke koordinat pengguna
      mapInstance.flyTo([userLocation.lat, userLocation.lng], 18, {
        animate: true,
        duration: 1.5
      });
    } else {
      showToast('Menunggu sinyal GPS untuk menemukan lokasi Anda...', '⏳');
    }
  }, [mapInstance, userLocation]);

  // Fungsi untuk menerbangkan kamera peta ke koordinat spesifik
  const flyToLocation = useCallback((lat: number, lng: number, zoomLevel: number = 18) => {
    if (!mapInstance) return;
    
    mapInstance.flyTo([lat, lng], zoomLevel, {
      animate: true,
      duration: 1.5
    });
  }, [mapInstance]);

  // Fungsi untuk reset tampilan peta agar memperlihatkan seluruh area kampus
  const resetZoom = useCallback(() => {
    if (!mapInstance) return;
    
    // Titik pusat koordinat IPB
    mapInstance.flyTo([-6.5605, 106.7262], 16, {
      animate: true,
      duration: 1.5
    });
  }, [mapInstance]);

  return {
    centerToUser,
    flyToLocation,
    resetZoom
  };
};