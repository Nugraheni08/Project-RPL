import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      console.error('USER_DELETION_ERROR: Missing userId');
      return NextResponse.json({ error: 'User ID diperlukan.' }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();

    // ── Step 1: Hapus dari public.users (cascade ke profiles, refill_activity, dll) ──
    const { error: dbError } = await serviceSupabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error(
        'USER_DELETION_ERROR — Gagal hapus dari public.users:',
        JSON.stringify(dbError, null, 2)
      );
      return NextResponse.json(
        { error: `Gagal menghapus data pengguna: ${dbError.message}` },
        { status: 500 }
      );
    }

    // ── Step 2: Hapus dari Supabase Auth ──────────────────────────────
    const { error: authError } = await serviceSupabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error(
        'USER_DELETION_ERROR — Gagal hapus dari auth.users:',
        JSON.stringify(authError, null, 2)
      );
      // User mungkin sudah terhapus dari public.users tapi auth gagal.
      // Tetap return error agar admin tahu.
      return NextResponse.json(
        { error: `Akun terhapus dari database, tetapi gagal menghapus autentikasi: ${authError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Akun pengguna berhasil dihapus.',
    });
  } catch (error) {
    console.error('USER_DELETION_ERROR — Unhandled exception:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat menghapus pengguna.' },
      { status: 500 }
    );
  }
}