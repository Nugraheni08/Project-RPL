-- 1. data user
INSERT INTO users (username, password_hash, email, role, total_points) VALUES
('admin_ssmi', 'hash_123', 'admin_ssmi@apps.ipb.ac.id', 'admin', 0),
('budi_mahasiswa', 'hash_456', 'budi@apps.ipb.ac.id', 'mahasiswa', 150);

-- 2. data fasilitas
INSERT INTO facilities (name, type, category, latitude, longitude, status, description) VALUES
('Refill GWW', 'refill_air', 'Mesin RO', -6.559212, 106.722650, 'aktif', 'Selasar utama Graha Widya Wisuda'),
('Refill Perpustakaan', 'refill_air', 'Dispenser Galon', -6.558500, 106.731000, 'aktif', 'Dekat pintu masuk utama'),
('Trash Bin SSMI', 'tempat_sampah', 'Anorganik', -6.560123, 106.725432, 'aktif', 'Area lobi gedung SSMI'),
('Trash Bin FMIPA', 'tempat_sampah', 'Organik', -6.557800, 106.728900, 'aktif', 'Dekat kantin FMIPA');

-- 3. log aktivitas
INSERT INTO activity_logs (user_id, facility_id, activity_type, amount, points_earned) VALUES
(2, 1, 'refill', 0.6, 10), -- Budi di GWW (Mesin RO)
(2, 2, 'buang_botol', 1.0, 10); -- Budi di SSMI (tempat_sampah)