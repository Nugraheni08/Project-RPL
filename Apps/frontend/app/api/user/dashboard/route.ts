import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('USER_DASHBOARD_ERROR: Missing env vars.');
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
    }

    // ── Step 1: Extract token from Authorization header ───────────
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.error('USER_DASHBOARD_ERROR — Token tidak ditemukan di header.');
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    // ── Step 2: Verify token and get user ─────────────────────────
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('USER_DASHBOARD_ERROR — Verifikasi token gagal:', userError);
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const userId = userData.user.id;

    // ── Step 3: Privileged queries via service_role client ─────────
    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);

    const [
      totalRefillsResult,
      weekRefillsResult,
      userPointsResult,
      allUsersResult,
    ] = await Promise.all([
      serviceSupabase
        .from('refill_activity')
        .select('id, volume_ml', { count: 'exact' })
        .eq('user_id', userId)
        .eq('activity_type', 'refill'),
      serviceSupabase
        .from('refill_activity')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('activity_type', 'refill')
        .gte('created_at', weekStart.toISOString()),
      serviceSupabase
        .from('users')
        .select('total_points')
        .eq('id', userId)
        .single(),
      serviceSupabase
        .from('users')
        .select('id, total_points')
        .order('total_points', { ascending: false }),
    ]);

    const totalRefillRows = totalRefillsResult.data || [];
    const totalMl = totalRefillRows.reduce((sum: number, r: any) => sum + (r.volume_ml || 0), 0);
    const bottlesSaved = Math.round(totalMl / 500);
    const bottlesThisWeek = weekRefillsResult.count || 0;
    const ecoPoints = userPointsResult.data?.total_points || 0;

    let rank = 0;
    const allUsers = allUsersResult.data || [];
    const userIdx = allUsers.findIndex((u: any) => u.id === userId);
    rank = userIdx >= 0 ? userIdx + 1 : allUsers.length + 1;

    const totalRefillCount = (totalRefillsResult as any).count || totalRefillRows.length;
    const achievements = [
      { id: 'first_drop', name: 'First Drop', desc: 'Satu kali refill air', icon: '💧', required: 1, unlocked: totalRefillCount >= 1 },
      { id: 'eco_warrior_1', name: 'Eco Warrior Tier 1', desc: '10 kali refill', icon: '🌱', required: 10, unlocked: totalRefillCount >= 10 },
      { id: 'eco_warrior_2', name: 'Eco Warrior Tier 2', desc: '50 kali refill', icon: '🌿', required: 50, unlocked: totalRefillCount >= 50 },
      { id: 'eco_warrior_3', name: 'Eco Warrior Tier 3', desc: '100 kali refill', icon: '🌳', required: 100, unlocked: totalRefillCount >= 100 },
      { id: 'bottle_saver', name: 'Bottle Saver', desc: '500 botol terselamatkan', icon: '♻️', required: 500, unlocked: bottlesSaved >= 500 },
      { id: 'point_hunter', name: 'Point Hunter', desc: '1,000 eco points', icon: '⭐', required: 1000, unlocked: ecoPoints >= 1000 },
    ];

    return NextResponse.json({
      bottlesSaved,
      bottlesThisWeek,
      ecoPoints,
      rank,
      achievements,
    });
  } catch (error) {
    console.error('USER_DASHBOARD_FETCH_ERROR:', error);
    return NextResponse.json({ error: 'Gagal memuat dashboard pengguna.' }, { status: 500 });
  }
}
