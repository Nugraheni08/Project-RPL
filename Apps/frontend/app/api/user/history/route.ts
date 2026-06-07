import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
    }

    // ── Step 1: Extract token from Authorization header ───────────
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.error('USER_HISTORY_ERROR — Token tidak ditemukan di header.');
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    // ── Step 2: Verify token and get user ─────────────────────────
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('USER_HISTORY_ERROR — Verifikasi token gagal:', userError);
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const userId = userData.user.id;

    // ── Step 3: Privileged queries via service_role ────────────────
    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [refillCount, wasteCount, recentActivity] = await Promise.all([
      // Monthly refills
      serviceSupabase
        .from('refill_activity')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('activity_type', 'refill')
        .gte('created_at', startOfMonth),
      // Monthly waste
      serviceSupabase
        .from('refill_activity')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('activity_type', 'waste_deposit')
        .gte('created_at', startOfMonth),
      // Recent 20 activities with facility join
      serviceSupabase
        .from('refill_activity')
        .select('id, activity_type, points_earned, volume_ml, created_at, facilities(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const monthlyRefills = refillCount.count || 0;
    const monthlyWaste = wasteCount.count || 0;

    // Calculate this month's points
    const thisMonthPoints = (recentActivity.data || [])
      .filter((r: any) => new Date(r.created_at) >= new Date(startOfMonth))
      .reduce((sum: number, r: any) => sum + (r.points_earned || 0), 0);

    const activities = (recentActivity.data || []).map((row: any) => {
      const isRefill = row.activity_type === 'refill';
      return {
        id: row.id,
        type: isRefill ? 'water' : 'recycle',
        icon: isRefill ? '💧' : '♻️',
        name: isRefill
          ? `Refill air at ${row.facilities?.name || 'Unknown'}`
          : `Waste deposit at ${row.facilities?.name || 'Unknown'}`,
        time: getRelativeTime(row.created_at),
        pts: `+${row.points_earned || 0} pt`,
        created_at: row.created_at,
      };
    });

    return NextResponse.json({
      monthlyRefills,
      monthlyWaste,
      monthlyPoints: thisMonthPoints,
      activities,
    });
  } catch (error) {
    console.error('USER_HISTORY_FETCH_ERROR:', error);
    return NextResponse.json({ error: 'Gagal memuat riwayat aktivitas.' }, { status: 500 });
  }
}

function getRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Baru saja';
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}