create database "WMap Project"

-- Tabel user
DROP TABLE IF EXISTS reviews, activity_logs, facilities, users CASCADE;
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'mahasiswa' CHECK (role IN ('mahasiswa', 'dosen', 'staff', 'admin')),
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint untuk awalan huruf bagi mahasiswa dan angka untuk staff/dosen
    CONSTRAINT check_username_logic CHECK (
        (role = 'mahasiswa' AND username ~* '^[A-M]') OR        -- Mahasiswa: A-M
        (role IN ('dosen', 'staff') AND username ~ '^[0-9]') OR    -- Dosen/Staff: Angka
        (role = 'admin')                                          -- Admin: Bebas
    )
);

-- Tabel fasilitas
CREATE TABLE facilities (
    facility_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('refill_air', 'tempat_sampah')),
    category VARCHAR(50), -- cth: 'Anorganik'/'Organik' , 'Dispenser'/'Reverse Osmosis (kayak di fapet)'
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'maintenance', 'rusak')),
    image_url TEXT, -- Hasil dari Integration Layer (Cloud Storage)
    description TEXT,
    last_maintained_at TIMESTAMP
);

-- Tabel log aktivitas
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    facility_id INTEGER REFERENCES facilities(facility_id),
    activity_type VARCHAR(50) NOT NULL, -- 'refill', 'buang_botol'
    points_earned INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel ulasan
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    facility_id INTEGER REFERENCES facilities(facility_id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_moderated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fungsi untuk menentukan role otomatis
CREATE OR REPLACE FUNCTION auto_assign_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Logika otomatisasi berdasarkan karakter pertama username
  IF NEW.username ~* '^[A-M]' THEN
    NEW.role := 'mahasiswa';
  ELSIF NEW.username ~ '^[0-9]' THEN
    -- Jika user tidak menentukan role, default ke dosen
    IF NEW.role NOT IN ('dosen', 'staff') THEN
       NEW.role := 'dosen';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang Trigger agar fungsi di atas jalan sebelum data masuk (INSERT)
CREATE TRIGGER trigger_auto_role
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION auto_assign_role();

-- Fungsi untuk mengupdate total poin di tabel users
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET total_points = total_points + NEW.points_earned
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger yang jalan setiap ada data masuk ke activity_logs
CREATE TRIGGER trigger_update_points
AFTER INSERT ON activity_logs
FOR EACH ROW
EXECUTE FUNCTION update_user_points();



-- DATA DUMMY
-- user
-- masukkan username, password, dan email.
-- role dikosongkan karena akan diassign oleh database manager
INSERT INTO users (username, password_hash, email) 
VALUES ('M0403241001', 'password_dummy_123', 'mahasiswa_test@apps.ipb.ac.id');

-- Check auto assign berhasil apa engga
SELECT username, role, email 
FROM users 
WHERE username = 'M0403241001';

-- 2. data fasilitas
INSERT INTO facilities (name, type, category, latitude, longitude, status, description) VALUES
('Refill GWW', 'refill_air', 'Mesin RO', -6.559212, 106.722650, 'aktif', 'Selasar utama Graha Widya Wisuda'),
('Refill Perpustakaan', 'refill_air', 'Dispenser Galon', -6.558500, 106.731000, 'aktif', 'Dekat pintu masuk utama'),
('Trash Bin SSMI', 'tempat_sampah', 'Anorganik', -6.560123, 106.725432, 'aktif', 'Area lobi gedung SSMI'),
('Trash Bin FMIPA', 'tempat_sampah', 'Organik', -6.557800, 106.728900, 'aktif', 'Dekat kantin FMIPA');

-- 3. log aktivitas
INSERT INTO activity_logs (user_id, facility_id, activity_type, points_earned) VALUES
(1, 1, 'refill', 10), -- Budi di GWW (Mesin RO)
(1, 2, 'buang_botol', 10); -- Budi di SSMI (tempat_sampah)

