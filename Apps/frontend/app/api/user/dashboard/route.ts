import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

    // ── Verifikasi session ──────────────────────────────────────────
    const { data: sessionData, error: sessionError } = await serviceSupabase.auth.getUser();
    if (sessionError || !sessionData?.user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const userId = sessionData.user.id;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);

    // ── Run all queries in parallel ─────────────────────────────────
    const [
      totalRefillsResult,
      weekRefillsResult,
      userPointsResult,
      allUsersResult,
    ] = await Promise.all([
      // 1. Total refills user (all time)
      serviceSupabase
        .from('refill_activity')
        .select('id, volume_ml', { count: 'exact' })
        .eq('user_id', userId)
        .eq('activity_type', 'refill'),
      // 2. Refills minggu ini
      serviceSupabase
        .from('refill_activity')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('activity_type', 'refill')
        .gte('created_at', weekStart.toISOString()),
      // 3. Points user
      serviceSupabase
        .from('users')
        .select('total_points')
        .eq('id', userId)
        .single(),
      // 4. Semua user untuk rank
      serviceSupabase
        .from('users')
        .select('id, total_points')
        .order('total_points', { ascending: false }),
    ]);

    // ── Kalkulasi ───────────────────────────────────────────────────
    const totalRefillRows = totalRefillsResult.data || [];
    const totalMl = totalRefillRows.reduce((sum: number, r: any) => sum + (r.volume_ml || 0), 0);
    const bottlesSaved = Math.round(totalMl / 500);
    const bottlesThisWeek = weekRefillsResult.count || 0;
    const ecoPoints = userPointsResult.data?.total_points || 0;

    // Rank: 1-based index di sorted array
    let rank = 0;
    const allUsers = allUsersResult.data || [];
    const userIdx = allUsers.findIndex((u: any) => u.id === userId);
    rank = userIdx >= 0 ? userIdx + 1 : allUsers.length + 1;

    // ── Achievements ────────────────────────────────────────────────
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