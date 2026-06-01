// Mendefinisikan struktur komentar/ulasan
export interface ReviewComment {
  name: string;
  avatar: string;
  time: string;
  stars: number;
  text: string;
}

// Mendefinisikan struktur data Water Station
export interface WaterStation {
  name: string;
  lat: number;
  lng: number;
  addr: string;
  fullAddr?: string;
  rating: number;
  reviews: number;
  comments: ReviewComment[];
  // Properti tambahan saat di-render di peta
  status?: 'active' | 'inactive' | 'repair';
  dist?: number; 
  marker?: any; // Objek marker dari Leaflet
}

// Mendefinisikan struktur data Tempat Sampah
export interface TrashBin {
  name: string;
  lat: number;
  lng: number;
  addr: string;
  // Properti tambahan saat di-render di peta
  status?: 'active' | 'inactive' | 'repair';
  dist?: number;
  marker?: any; // Objek marker dari Leaflet
}