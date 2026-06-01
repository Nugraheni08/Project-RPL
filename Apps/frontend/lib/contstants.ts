// Data lokasi dan detail Water Stations (Refill Air)
export const waterStations = [
  {
    name: "Golden Corner",
    lat: -6.5578691, lng: 106.7310589,
    addr: "Golden Corner Area, FMIPA",
    fullAddr: "Golden Corner, Babakan, Dramaga, Bogor Regency, West Java 16680",
    rating: 5.0, reviews: 5,
    comments: [
      { name: "Ziggy Zagga",  avatar: "ZZ", time: "5 month ago", stars: 5, text: "Alat bagus dan airnya segar" },
      { name: "Halilintar",   avatar: "HL", time: "5 month ago", stars: 4, text: "Alat bekerja dengan baik dan airnya enak diminum" },
    ]
  },
  {
    name: "CCR 1.09",
    lat: -6.5565914, lng: 106.7312138,
    addr: "CCR Lantai 1 Ruang 1.09",
    fullAddr: "CCR Lantai 1, IPB Dramaga, Bogor 16680",
    rating: 4.1, reviews: 11,
    comments: [
      { name: "Citra P.", avatar: "CP", time: "5 jam lalu", stars: 4, text: "Bersih dan mudah diakses." },
    ]
  },
  {
    name: "Satari",
    lat: -6.5553873, lng: 106.7240151,
    addr: "Gedung Satari IPB",
    fullAddr: "Gedung Satari, IPB Dramaga, Bogor 16680",
    rating: 4.3, reviews: 22,
    comments: [
      { name: "Dimas F.", avatar: "DF", time: "kemarin", stars: 4, text: "Aliran airnya kencang." },
      { name: "Elisa T.", avatar: "ET", time: "2hr lalu", stars: 5, text: "Favorit anak FMIPA!" },
    ]
  },
  {
    name: "Fahutan",
    lat: -6.55683, lng: 106.73063,
    addr: "Fakultas Kehutanan IPB",
    fullAddr: "Gedung Fahutan, IPB Dramaga, Bogor 16680",
    rating: 4.0, reviews: 9,
    comments: [
      { name: "Farhan M.", avatar: "FM", time: "3j lalu", stars: 4, text: "Lumayan, tapi perlu lebih sering dibersihkan." },
    ]
  },
  {
    name: "Water Station Fapet",
    lat: -6.55533, lng: 106.72699,
    addr: "Komplek Parkir Fakultas Peternakan",
    fullAddr: "Fakultas Peternakan IPB, Jl. Agatis, Babakan, Dramaga, Bogor 16680",
    rating: 4.5, reviews: 3,
    comments: [
      { name: "Rizky A.", avatar: "RA", time: "1 minggu lalu", stars: 5, text: "Mesin dispenser \"Wakaf IPB\" biru, samping pintu RUANG ABSEN. Air dingin!" },
    ]
  },
];

// Data lokasi dan detail Tempat Sampah
export const trashBins = [
  { name: "Dekat Gedung Fisika",         lat: -6.5574908, lng: 106.7309288, addr: "Sekitar Gedung Fisika FMIPA" },
  { name: "CCR 1.10",                    lat: -6.5565938, lng: 106.7313097, addr: "CCR Lantai 1 Ruang 1.10" },
  { name: "Sekret SSMI",                 lat: -6.5561871, lng: 106.7310857, addr: "Sekretariat SSMI" },
  { name: "CCR 2.14",                    lat: -6.5565555, lng: 106.7311893, addr: "CCR Lantai 2 Ruang 2.14" },
  { name: "Parkir Satari",               lat: -6.5551782, lng: 106.7242776, addr: "Area Parkir Gedung Satari" },
  { name: "Student Corner FMIPA",        lat: -6.55790,   lng: 106.73109,   addr: "Student Corner FMIPA" },
  { name: "Golden Corner (Sampah)",      lat: -6.55782,   lng: 106.73132,   addr: "Golden Corner Area" },
  { name: "CCR Belakang",                lat: -6.55669,   lng: 106.73163,   addr: "CCR Sisi Belakang" },
  { name: "CCR 1.03",                    lat: -6.55620,   lng: 106.73092,   addr: "CCR Lantai 1 Ruang 1.03" },
  { name: "CCR Depan (DPKU)",            lat: -6.55630,   lng: 106.73121,   addr: "CCR Depan / DPKU" },
  { name: "CCR Lantai 2 (Titik 1)",      lat: -6.55637,   lng: 106.73107,   addr: "CCR Lantai 2 Titik 1" },
  { name: "CCR Lantai 2 (Titik 2)",      lat: -6.55637,   lng: 106.73129,   addr: "CCR Lantai 2 Titik 2" },
  { name: "Depan Perpus",                lat: -6.55894,   lng: 106.72710,   addr: "Depan Perpustakaan IPB" },
  { name: "Depan GPK",                   lat: -6.55895,   lng: 106.72687,   addr: "Depan Graha Pertamina Kampus" },
  { name: "Halaman Gd. Sarjana Fapet",   lat: -6.55535,   lng: 106.72701,   addr: "Komplek Parkir Fakultas Peternakan" },
  { name: "Koridor Semi-Outdoor CCR",    lat: -6.55645,   lng: 106.73112,   addr: "Koridor Terbuka CCR, Jl. Meranti" },
  { name: "Koridor Dalam CCR",           lat: -6.55648,   lng: 106.73125,   addr: "Koridor Dalam CCR, Jl. Meranti" },
];

// Status untuk marker di peta ('active', 'inactive', 'repair')
// Index array ini menyesuaikan urutan data di atas
export const stationStatuses = ['active', 'inactive', 'active', 'active', 'active'];
export const trashStatuses   = ['active', 'active', 'repair', 'active', 'active', 'active', 'active', 'active', 'inactive', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active'];
