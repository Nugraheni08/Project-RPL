/**
 * Mengonversi derajat ke radian.
 * @param d - Nilai dalam derajat
 * @returns Nilai dalam radian
 */
export function toRad(d: number): number {
  return (d * Math.PI) / 180; //
}

/**
 * Menghitung jarak antara dua koordinat menggunakan rumus Haversine dalam satuan kilometer.
 * @param lat1 - Latitude titik pertama
 * @param lng1 - Longitude titik pertama
 * @param lat2 - Latitude titik kedua
 * @param lng2 - Longitude titik kedua
 * @returns Jarak dalam kilometer
 */
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = toRad(lat2 - lat1); //
  const dLng = toRad(lng2 - lng1); //
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2; //
  
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); //
}

/**
 * Mengarahkan dan memfokuskan pandangan peta ke koordinat hasil pencarian tertentu.
 * @param mapInstance - Instance peta Leaflet yang sedang aktif
 * @param lat - Latitude target
 * @param lng - Longitude target
 */
export function flyToResult(mapInstance: any, lat: number, lng: number): void {
  if (mapInstance) {
    mapInstance.setView([lat, lng], 18, { animate: true }); //
  }
}