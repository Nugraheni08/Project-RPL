'use client';

import { useMapStore } from '../../store/mapStore';

export default function RoutePanel() {
  const { routeTarget, routeMode, setRouteMode, setRouteTarget } = useMapStore();

  // Jika tidak ada target rute yang dipilih di peta, sembunyikan panel ini
  if (!routeTarget) return null;

  const handleCancelRoute = () => {
    // Menghapus target rute akan otomatis membatalkan navigasi di MapView
    setRouteTarget(null);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '400px',
      background: 'white',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Navigasi menuju
          </span>
          <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 700 }}>
            {routeTarget.name}
          </span>
        </div>
        
        {/* Tombol Tutup/Batal */}
        <button 
          onClick={handleCancelRoute}
          style={{
            background: '#fff0f0',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#E63946',
            fontWeight: 'bold',
            fontSize: '18px',
            transition: 'background 0.2s'
          }}
          aria-label="Batalkan Navigasi"
        >
          &times;
        </button>
      </div>

      {/* Pilihan Moda Transportasi */}
      <div style={{ display: 'flex', gap: '8px', background: '#f5f7f6', padding: '4px', borderRadius: '12px' }}>
        <button
          onClick={() => setRouteMode('foot-walking')}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '8px',
            background: routeMode === 'foot-walking' ? 'white' : 'transparent',
            boxShadow: routeMode === 'foot-walking' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            color: routeMode === 'foot-walking' ? 'var(--green-dark, #1a4a38)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
            fontSize: '13px'
          }}
        >
          🚶 Jalan
        </button>
        <button
          onClick={() => setRouteMode('cycling-regular')}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '8px',
            background: routeMode === 'cycling-regular' ? 'white' : 'transparent',
            boxShadow: routeMode === 'cycling-regular' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            color: routeMode === 'cycling-regular' ? 'var(--green-dark, #1a4a38)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
            fontSize: '13px'
          }}
        >
          🚴 Sepeda
        </button>
        <button
          onClick={() => setRouteMode('driving-car')}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '8px',
            background: routeMode === 'driving-car' ? 'white' : 'transparent',
            boxShadow: routeMode === 'driving-car' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            color: routeMode === 'driving-car' ? 'var(--green-dark, #1a4a38)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
            fontSize: '13px'
          }}
        >
          🚗 Mobil
        </button>
      </div>
      
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2px' }}>
        Ikuti garis biru di peta menuju lokasi tujuan.
      </div>
    </div>
  );
}