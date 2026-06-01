import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Peringatan: Kredensial Supabase tidak ditemukan. Pastikan variabel lingkungan sudah diatur di .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);