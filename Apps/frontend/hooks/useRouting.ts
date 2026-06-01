import { useEffect, useRef } from 'react';
import { useMapStore } from '../store/mapStore';
import { showToast } from '../components/ui/Toast';

export const useRouting = () => {
  const { mapInstance, userLocation, routeTarget, routeMode, setRouteTarget } = useMapStore();
  
  // Referensi untuk menyimpan objek garis rute agar bisa dihapus/diperbarui nanti
  const routingLayerRef = useRef<any>(null);

  useEffect(() => {
    // Pastikan peta sudah ter-load dengan benar
    if (!mapInstance) return;

    // Jika tidak ada target rute (misal user membatalkan navigasi), hapus garis dari peta
    if (!routeTarget) {
      if (routingLayerRef.current) {
        mapInstance.removeLayer(routingLayerRef.current);
        routingLayerRef.current = null;
      }
      return;
    }

    // Jika userLocation belum didapat dari GPS, tahan dulu
    if (!userLocation) {
      showToast('Menunggu sinyal GPS Anda untuk membuat rute...', '⏳');
      return;
    }

    // Fungsi untuk menggambar rute secara dinamis (mencegah error SSR Leaflet)
    const drawRoute = async () => {
      const L = (await import('leaflet')).default;

      // Hapus rute sebelumnya jika ada
      if (routingLayerRef.current) {
        mapInstance.removeLayer(routingLayerRef.current);
      }

      // Ambil koordinat target (Jika di data dummy tidak ada, gunakan koordinat pusat IPB)
      const targetLat = routeTarget.lat || -6.5605;
      const targetLng = routeTarget.lng || 106.7262;

      // Membuat titik awal (lokasi lu) dan titik akhir (tujuan)
      const latlngs = [
        [userLocation.lat, userLocation.lng],
        [targetLat, targetLng]
      ];

      // Menggambar garis putus-putus berwarna biru ala navigasi
      routingLayerRef.current = L.polyline(latlngs as any, {
        color: '#4285F4',
        weight: 5,
        dashArray: '10, 10',
        opacity: 0.8,
        lineCap: 'round'
      }).addTo(mapInstance);

      // Otomatis menyesuaikan tampilan peta agar titik awal dan akhir terlihat di layar
      mapInstance.fitBounds(routingLayerRef.current.getBounds(), {
        padding: [50, 50],
        animate: true,
        duration: 1
      });

      // Menyesuaikan pesan berdasarkan moda transportasi yang dipilih di RoutePanel
      let modeText = 'berjalan kaki';
      if (routeMode === 'cycling-regular') modeText = 'bersepeda';
      if (routeMode === 'driving-car') modeText = 'mengemudi mobil';

      showToast(`Mulai navigasi ke ${routeTarget.name} dengan ${modeText}`, '🚀');
    };

    drawRoute();

    // Fungsi pembersihan saat komponen dibongkar
    return () => {
      if (routingLayerRef.current && mapInstance) {
        mapInstance.removeLayer(routingLayerRef.current);
        routingLayerRef.current = null;
      }
    };
  }, [mapInstance, userLocation, routeTarget, routeMode]);

  // Fungsi manual untuk membatalkan rute dari komponen mana saja
  const cancelRoute = () => {
    setRouteTarget(null);
    showToast('Navigasi dibatalkan', '🛑');
  };

  return { cancelRoute };
};