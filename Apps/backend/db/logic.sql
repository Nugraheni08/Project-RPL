-- mencari fasilitas terdekat dari lokasi user
SELECT 
    name, 
    type,        -- Informasi tipe yang kamu butuhkan
    category,    -- Informasi tambahan (misal: Air Dingin/Normal)
    latitude, 
    longitude,
    -- Rumus Haversine untuk menghitung jarak dalam KM
    (6371 * acos(
        cos(radians(-6.560123)) * cos(radians(latitude)) * cos(radians(longitude) - radians(106.725432)) + 
        sin(radians(-6.560123)) * sin(radians(latitude))
    )) AS distance_km
FROM facilities
WHERE status = 'aktif'
ORDER BY distance_km ASC
LIMIT 5;