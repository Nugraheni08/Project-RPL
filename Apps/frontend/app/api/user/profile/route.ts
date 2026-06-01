import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

    const { data: sessionData, error: sessionError } = await serviceSupabase.auth.getUser();
    if (sessionError || !sessionData?.user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const userId = sessionData.user.id;

    const [userResult, profileResult, refillResult] = await Promise.all([
      serviceSupabase.from('users').select('username, email, role, nim, nip, total_points, is_verified').eq('id', userId).single(),
      serviceSupabase.from('profiles').select('full_name, phone, location, avatar_url, bio').eq('id', userId).single(),
      serviceSupabase.from('refill_activity').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'refill'),
    ]);

    const user = userResult.data;
    const profile = profileResult.data;
    const totalRefills = refillResult.count || 0;

    return NextResponse.json({
      name: profile?.full_name || user?.username || sessionData.user.email?.split('@')[0] || 'User',
      email: user?.email || sessionData.user.email || '',
      nim: user?.nim || user?.nip || '-',
      role: user?.role || 'Mahasiswa',
      points: user?.total_points || 0,
      isVerified: user?.is_verified || false,
      totalRefills,
      phone: profile?.phone || '',
      location: profile?.location || '',
      avatarUrl: profile?.avatar_url || null,
      bio: profile?.bio || '',
    });
  } catch (error) {
    console.error('USER_PROFILE_FETCH_ERROR:', error);
    return NextResponse.json({ error: 'Gagal memuat profil.' }, { status: 500 });
  }
}