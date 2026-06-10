import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// ── GET: Fetch all users from public.users ───────────────────────────
export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

    const { data, error } = await serviceSupabase
      .from('users')
      .select('id, email, username, role, nim, nip, is_verified, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('USERS_FETCH_ERROR:', error);
      return NextResponse.json(
        { error: `Gagal mengambil data pengguna: ${error.message}` },
        { status: 500 }
      );
    }

    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      name: row.username || row.email?.split('@')[0] || 'Unknown',
      email: row.email || '',
      nim: row.nim || row.nip || '-',
      role: row.role || 'User',
      status: row.is_verified ? 'Active' : 'Inactive',
      joinDate: row.created_at
        ? new Date(row.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '-',
    }));

    return NextResponse.json({ users: mapped });
  } catch (error) {
    console.error('USERS_FETCH_ERROR — Unhandled exception:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat mengambil data pengguna.' },
      { status: 500 }
    );
  }
}

// ── DELETE: Remove a user from public.users AND Supabase Auth ────────
// Usage: DELETE /api/admin/users?id=<user-uuid>
export async function DELETE(request: NextRequest) {
  try {
    const serviceSupabase = getServiceSupabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID diperlukan.' },
        { status: 400 }
      );
    }

    // ── Step 1: Delete from public.users (cascades to related tables) ─
    const { error: dbError } = await serviceSupabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error('USER_DELETION_ERROR — public.users:', dbError);
      return NextResponse.json(
        { error: `Gagal menghapus data pengguna: ${dbError.message}` },
        { status: 500 }
      );
    }

    // ── Step 2: Delete from Supabase Auth (admin API) ─────────────────
    const { error: authError } = await serviceSupabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('USER_DELETION_ERROR — auth.users:', authError);
      // User already removed from public.users but auth deletion failed.
      // Still return a partial-success message so admin knows.
      return NextResponse.json(
        { message: 'Akun terhapus dari database, tetapi gagal menghapus autentikasi.', warning: true },
        { status: 200 }
      );
    }

    return NextResponse.json({
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