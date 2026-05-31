app.get('/facilities/nearby', async (req, res) => {
    // 1. Ambil lokasi user dari parameter request
    const userLat = req.query.lat;
    const userLng = req.query.lng;

    // 2. Jalankan Query ke PostgreSQL menggunakan parameter tersebut
    const query = `
        SELECT name, latitude, longitude,
        (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * ... )) AS distance
        FROM facilities
        WHERE status = 'aktif'
        ORDER BY distance ASC
        LIMIT 5;
    `;
    
    const result = await db.query(query, [userLat, userLng]);

    // 3. Kirim hasilnya kembali ke Frontend
    res.json(result.rows);
});