import { create } from 'zustand';

// Mendefinisikan tipe data untuk semua state peta
interface MapState {
  mapInstance: any | null;
  userLocation: { lat: number; lng: number } | null;
  userElements: { marker: any; circle: any } | null;
  activeStation: any | null;
  showWaterLayer: boolean;
  showTrashLayer: boolean;
  routeTarget: any | null;
  routeMode: string;

  // Fungsi-fungsi pengubah state
  setMapInstance: (map: any) => void;
  setUserLocation: (lat: number, lng: number) => void;
  setUserElements: (marker: any, circle: any) => void;
  setActiveStation: (station: any | null) => void;
  toggleWaterLayer: () => void;
  toggleTrashLayer: () => void;
  setRouteTarget: (target: any | null) => void;
  setRouteMode: (mode: string) => void;
}

export const useMapStore = create<MapState>((set: any) => ({
  // Nilai awal (Default Values)
  mapInstance: null,
  userLocation: null,
  userElements: null,
  activeStation: null,
  showWaterLayer: true,
  showTrashLayer: true,
  routeTarget: null,
  routeMode: 'foot-walking', // Default rute jalan kaki

  // Aksi untuk mengubah nilai
  setMapInstance: (map) => set({ mapInstance: map }),
  setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
  setUserElements: (marker, circle) => set({ userElements: { marker, circle } }),
  setActiveStation: (station) => set({ activeStation: station }),
  toggleWaterLayer: () => set((state: MapState) => ({ showWaterLayer: !state.showWaterLayer })),
  toggleTrashLayer: () => set((state: MapState) => ({ showTrashLayer: !state.showTrashLayer })),
  setRouteTarget: (target) => set({ routeTarget: target }),
  setRouteMode: (mode) => set({ routeMode: mode }),
}));