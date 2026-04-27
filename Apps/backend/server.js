const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Konfigurasi Database (Koneksi ke PostgreSQL)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 2. Endpoint: Cek Status Server
app.get('/', (req, res) => {
  res.send('GreenStep API is running... 🌿');
});

// 3. Endpoint Inti: Cari Fasilitas Terdekat (WMap Logic)
// URL: http://localhost:3000/api/facilities/nearby?lat=-6.560&lng=106.725
app.get('/api/facilities/nearby', async (req, res) => {
  const { lat, lng } = req.query;

  // Proteksi: ini make sure user mengirimkan koordinat
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude dan Longitude harus diisi!' });
  }

  try {
    const query = `
      SELECT name, type, category, status, latitude, longitude,
      (6371 * acos(
        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
        sin(radians($1)) * sin(radians(latitude))
      )) AS distance_km
      FROM facilities
      WHERE status = 'aktif'
      ORDER BY distance_km ASC
      LIMIT 5;
    `;

    const result = await pool.query(query, [lat, lng]);
    
    res.json({
      success: true,
      count: result.rowCount,
      user_location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      data: result.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error saat menghitung jarak');
  }
});

// 4. Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend WMap jalan di http://localhost:${PORT}`);
});