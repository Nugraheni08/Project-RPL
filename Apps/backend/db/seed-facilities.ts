/**
 * ============================================================
 * SEEDER: FACILITIES (TypeScript + Supabase Client)
 * ============================================================
 * 
 * Cara menjalankan:
 *   1. Pastikan file .env.local di Apps/frontend sudah berisi:
 *        NEXT_PUBLIC_SUPABASE_URL
 *        NEXT_PUBLIC_SUPABASE_ANON_KEY
 *        SUPABASE_SERVICE_ROLE_KEY   (wajib untuk bypass RLS)
 * 
 *   2. Jalankan dari terminal:
 *        cd Project-RPL/Apps/frontend
 *        npx ts-node ../backend/db/seed-facilities.ts
 * 
 *   Atau dengan dotenv:
 *        npx ts-node -r dotenv/config ../backend/db/seed-facilities.ts
 * 
 * Struktur tabel facilities (dari db.sql):
 *   id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
 *   name          VARCHAR(100) NOT NULL
 *   type          VARCHAR(20)  CHECK (type IN ('refill_air','tempat_sampah'))
 *   category      VARCHAR(50)
 *   latitude      DECIMAL(10,8) NOT NULL
 *   longitude     DECIMAL(11,8) NOT NULL
 *   status        VARCHAR(20)  DEFAULT 'aktif'
 *   address       TEXT
 *   full_address  TEXT
 *   rating        DECIMAL(2,1) DEFAULT 5.0
 *   reviews_count INTEGER DEFAULT 0
 *   description   TEXT
 *   created_at    TIMESTAMPTZ DEFAULT NOW()
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js';

// Load env vars (bisa juga via dotenv kalau tidak pakai Next.js runtime)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('FATAL: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diset di environment.');
  process.exit(1);
}

// Gunakan service_role supaya bisa insert meskipun ada RLS
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================
// DATA FACILITIES
// ============================================================
interface FacilitySeed {
  name: string;
  type: 'refill_air' | 'tempat_sampah';
  category: string;
  latitude: number;
  longitude: number;
  description: string;
}

const facilities: FacilitySeed[] = [
  // ── WATER STATION ──────────────────────────────────────────
  {
    name: 'Golden Corner',
    type: 'refill_air',
    category: 'Water Station',
    latitude: -6.5578691,
    longitude: 106.7310589,
    description: 'Stasiun isi ulang air minum di area Golden Corner.',
  },
  {
    name: 'CCR 1.09',
    type: 'refill_air',
    category: 'Water Station',
    latitude: -6.5565914,
    longitude: 106.7312138,
    description: 'Stasiun isi ulang di dekat ruang CCR 1.09.',
  },
  {
    name: 'Satari',
    type: 'refill_air',
    category: 'Water Station',
    latitude: -6.5553873,
    longitude: 106.7240151,
    description: 'Water station di area Satari.',
  },
  {
    name: 'Fahutan',
    type: 'refill_air',
    category: 'Water Station',
    latitude: -6.55683,
    longitude: 106.73063,
    description: 'Water station di Fakultas Kehutanan.',
  },
  {
    name: 'Water Station Fapet',
    type: 'refill_air',
    category: 'Water Station',
    latitude: -6.55533,
    longitude: 106.72699,
    description:
      'Mesin dispenser biru "Wakaf IPB" di samping pintu "RUANG ABSEN", Komplek Parkir Fakultas Peternakan. CPVC+5W7',
  },

  // ── TEMPAT SAMPAH ──────────────────────────────────────────
  {
    name: 'Dekat Gedung Fisika',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.5574908,
    longitude: 106.7309288,
    description: 'Tempat sampah dekat Gedung Fisika.',
  },
  {
    name: 'CCR 1.10',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.5565938,
    longitude: 106.7313097,
    description: 'Tempat sampah di dekat CCR 1.10.',
  },
  {
    name: 'Sekret SSMI',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.5561871,
    longitude: 106.7310857,
    description: 'Tempat sampah di depan Sekretariat SSMI.',
  },
  {
    name: 'CCR 2.14',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.5565555,
    longitude: 106.7311893,
    description: 'Tempat sampah di dekat CCR 2.14.',
  },
  {
    name: 'Parkir Satari',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.5551782,
    longitude: 106.7242776,
    description: 'Tempat sampah di area parkir Satari.',
  },
  {
    name: 'Student Corner FMIPA',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.5579,
    longitude: 106.73109,
    description: 'Tempat sampah di Student Corner FMIPA.',
  },
  {
    name: 'Golden Corner',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.55782,
    longitude: 106.73132,
    description: 'Tempat sampah di area Golden Corner.',
  },
  {
    name: 'CCR Belakang',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.55669,
    longitude: 106.73163,
    description: 'Tempat sampah di bagian belakang gedung CCR.',
  },
  {
    name: 'CCR 1.03',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.5562,
    longitude: 106.73092,
    description: 'Tempat sampah di dekat CCR 1.03.',
  },
  {
    name: 'CCR Depan (DPKU)',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.5563,
    longitude: 106.73121,
    description: 'Tempat sampah di depan gedung CCR, area DPKU.',
  },
  {
    name: 'CCR Lantai 2 (Titik 1)',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.55637,
    longitude: 106.73107,
    description: 'Tempat sampah di lantai 2 CCR titik 1.',
  },
  {
    name: 'CCR Lantai 2 (Titik 2)',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.55637,
    longitude: 106.73129,
    description: 'Tempat sampah di lantai 2 CCR titik 2.',
  },
  {
    name: 'Depan Perpus',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.55894,
    longitude: 106.7271,
    description: 'Tempat sampah di depan Perpustakaan IPB.',
  },
  {
    name: 'Depan GPK',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.55895,
    longitude: 106.72687,
    description: 'Tempat sampah di depan GPK (Graha Pertamina Kampus).',
  },
  {
    name: 'Halaman Gedung Sarjana Fapet',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.55535,
    longitude: 106.72701,
    description:
      '3 tempat sampah (kuning, merah, hijau) di samping dinding putih berlantai ubin, Komplek Parkir Fapet. CPVC+5W7',
  },
  {
    name: 'Koridor Semi-Outdoor CCR',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.55645,
    longitude: 106.73112,
    description:
      '3 tempat sampah di koridor terbuka gedung CCR dengan tiang abu-abu dan pagar putih, Jl. Meranti. CPVJ+HVJ',
  },
  {
    name: 'Koridor Dalam CCR',
    type: 'tempat_sampah',
    category: 'Tempat Sampah',
    latitude: -6.55648,
    longitude: 106.73125,
    description:
      '3 tempat sampah di dalam koridor gedung CCR berlantai keramik putih, samping barisan pintu kelas, Jl. Meranti. CPVJ+HVJ',
  },
];

// ============================================================
// MAIN SEEDER FUNCTION
// ============================================================
async function seed() {
  console.log(`🌱 Mulai seeding ${facilities.length} fasilitas...\n`);

  // Optional: hapus semua data lama dulu (hati-hati!)
  // const { error: delErr } = await supabase.from('facilities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  // if (delErr) console.warn('⚠️  Gagal hapus data lama:', delErr.message);

  const rows = facilities.map((f) => ({
    name: f.name,
    type: f.type,
    category: f.category,
    latitude: f.latitude,
    longitude: f.longitude,
    status: 'aktif',
    description: f.description,
    rating: 5.0,
    reviews_count: 0,
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase.from('facilities').insert(rows).select('id,name,type');

  if (error) {
    console.error('❌ GAGAL seeding facilities:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log(`✅ Berhasil! ${data.length} fasilitas tersimpan:\n`);

  const waterStations = data.filter((d: any) => d.type === 'refill_air');
  const trashBins     = data.filter((d: any) => d.type === 'tempat_sampah');

  console.log(`   💧 Water Station : ${waterStations.length}`);
  waterStations.forEach((d: any) => console.log(`      - ${d.name}`));

  console.log(`\n   🗑️  Tempat Sampah : ${trashBins.length}`);
  trashBins.forEach((d: any) => console.log(`      - ${d.name}`));
}

seed();