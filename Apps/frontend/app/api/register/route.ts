import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, identifier, username } = body;

    // ── Validasi input ────────────────────────────────────────────
    if (!email || !password || !role || !username) {
      console.error('REGISTER: Missing required fields', { email, role, username });
      return NextResponse.json(
        { error: 'Data tidak lengkap. Email, password, role, dan username wajib diisi.' },
        { status: 400 }
      );
    }

    if (!['Mahasiswa', 'Dosen'].includes(role)) {
      console.error('REGISTER: Invalid role', { role });
      return NextResponse.json(
        { error: 'Role tidak valid.' },
        { status: 400 }
      );
    }

    // ── Gunakan service_role client (bypass RLS) ───────────────────
    const serviceSupabase = getServiceSupabase();

    // ── Step 1: Buat user di Supabase Auth ─────────────────────────
    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,           // langsung verified (karena OTP sudah diverifikasi di frontend)
      user_metadata: {
        role,
        identifier_number: identifier || '',
        username,
      },
    });

    if (authError) {
      console.error(
        'REGISTER_DATABASE_ERROR — Supabase Auth admin.createUser gagal:',
        JSON.stringify(authError, null, 2)
      );
      return NextResponse.json(
        { error: `Gagal membuat akun: ${authError.message}` },
        { status: 500 }
      );
    }

    const userId = authData.user?.id;
    if (!userId) {
      console.error('REGISTER_DATABASE_ERROR — User created but no ID returned', { authData });
      return NextResponse.json(
        { error: 'Gagal membuat akun — ID user tidak ditemukan.' },
        { status: 500 }
      );
    }

    console.log('REGISTER: Auth user created successfully', { userId, email, role });

    // ── Step 2: Update row di public.users ─────────────────────────
    // Note: public.users diisi oleh trigger on_auth_user_created jika trigger ada.
    // Jika trigger belum ada, kita lakukan UPSERT supaya lebih aman.
    const { error: upsertError } = await serviceSupabase
      .from('users')
      .upsert(
        {
          id: userId,
          email,
          username,
          role,
          nim: role === 'Mahasiswa' ? identifier : null,
          nip: role === 'Dosen' ? identifier : null,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (upsertError) {
      console.error(
        'REGISTER_DATABASE_ERROR — upsert ke public.users gagal:',
        JSON.stringify(upsertError, null, 2)
      );
      // Jangan return error — Auth user sudah terbuat, profile bisa dilengkapi nanti.
      // Tapi kita tetap log supaya terlihat di Vercel Runtime Logs.
    } else {
      console.log('REGISTER: public.users row upserted successfully', { userId, username, role });
    }

    // ── Step 3: Buat row di public.profiles ────────────────────────
    const { error: profileError } = await serviceSupabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name: username,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error(
        'REGISTER_DATABASE_ERROR — upsert ke public.profiles gagal:',
        JSON.stringify(profileError, null, 2)
      );
      // Non-fatal: Auth user sudah ada, profile bisa dibuat saat edit profil nanti.
    } else {
      console.log('REGISTER: public.profiles row upserted successfully', { userId });
    }

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dibuat.',
      user: { id: userId, email, role },
    });

  } catch (error) {
    console.error(
      'REGISTER_DATABASE_ERROR — Unhandled exception:',
      error
    );
    return NextResponse.json(
      { error: 'Database error saving new user' },
      { status: 500 }
    );
  }
}