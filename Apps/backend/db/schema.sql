create database "WMap Project"

-- Tabel user
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,                                  -- Pake Bcrypt atau Argon2???
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'mahasiswa' CHECK (role IN ('mahasiswa', 'dosen', 'staff', 'admin')),
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    amount DECIMAL(5, 2), -- Jumlah liter atau jumlah botol
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

