import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Peringatan: Kredensial Supabase tidak ditemukan. Pastikan variabel lingkungan sudah diatur di .env.local'
  );
}

// Client-side Supabase client (anon key — safe for browser, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase admin client (service_role key — bypasses RLS, NEVER expose to browser)
// Used only in API routes for privileged operations
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error(
      'FATAL: SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment variables.'
    );
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
