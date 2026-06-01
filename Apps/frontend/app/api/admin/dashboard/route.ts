import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Run all queries in parallel
    const [
      refillResult,
      facilitiesResult,
      reportsResult,
      reportsPendingResult,
      weeklyRefillResult,
      prevWeekRefillResult,
      leaderboardResult,
      reviewsResult,
      userCountResult,
      newUserResult,
    ] = await Promise.all([
      // 1. Total refills
      serviceSupabase.from('refill_activity').select('id', { count: 'exact', head: true }).eq('activity_type', 'refill'),
      // 2. All facilities
      serviceSupabase.from('facilities').select('*'),
      // 3. Recent reports (last 5)
      serviceSupabase.from('reports').select('*').order('created_at', { ascending: false }).limit(5),
      // 4. Pending reports count
      serviceSupabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      // 5. Weekly refills (current week)
      serviceSupabase.from('refill_activity').select('created_at').eq('activity_type', 'refill').gte('created_at', startOfWeek.toISOString()),
      // 6. Previous week refills (for growth %)
      serviceSupabase.from('refill_activity').select('id', { count: 'exact', head: true }).eq('activity_type', 'refill').gte('created_at', new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()).lt('created_at', startOfWeek.toISOString()),
      // 7. Leaderboard top 4
      serviceSupabase.from('users').select('id, username, total_points').order('total_points', { ascending: false }).limit(4),
      // 8. Recent reviews (last 5)
      serviceSupabase.from('reviews').select('*, users(username)').order('created_at', { ascending: false }).limit(5),
      // 9. Total user count
      serviceSupabase.from('users').select('id', { count: 'exact', head: true }),
      // 10. New users this month
      serviceSupabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    ]);

    // ── Aggregate results ──────────────────────────────────────────

    // Total refills
    const totalRefills = refillResult.count || 0;

    // Parse facilities
    const facilities = facilitiesResult.data || [];
    const activeRefillStations = facilities.filter(
      (f: any) => f.type === 'refill_air' && f.status === 'aktif'
    ).length;
    const activeWasteBins = facilities.filter(
      (f: any) => f.type === 'tempat_sampah' && f.status === 'aktif'
    ).length;

    // Pending reports
    const reportsPending = reportsPendingResult.count || 0;
    const recentReports = (reportsResult.data || []).map((r: any) => ({
      id: r.id,
      title: r.description?.slice(0, 60) || 'No description',
      location: r.location_ref || r.facility_type || 'Unknown',
      time: getRelativeTime(r.created_at),
      status: r.status || 'PENDING',
      statusClass: getStatusClass(r.status),
    }));

    // Weekly refill bar chart
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyBars = days.map((d) => ({ day: d, value: 0 }));
    (weeklyRefillResult.data || []).forEach((row: any) => {
      const d = new Date(row.created_at);
      const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      if (idx >= 0 && idx < 7) weeklyBars[idx].value++;
    });

    // Refill growth percentage
    const prevWeekCount = prevWeekRefillResult.count || 0;
    const thisWeekCount = (weeklyRefillResult.data || []).length;
    const refillGrowthPct = prevWeekCount > 0
      ? Math.round(((thisWeekCount - prevWeekCount) / prevWeekCount) * 100)
      : 0;

    // Station growth this month
    const prevMonthStations = facilities.filter(
      (f: any) => f.type === 'refill_air' && f.status === 'aktif' && new Date(f.created_at) < new Date(startOfMonth)
    ).length;
    const stationGrowth = activeRefillStations - prevMonthStations;
    const binGrowth = activeWasteBins - facilities.filter(
      (f: any) => f.type === 'tempat_sampah' && f.status === 'aktif' && new Date(f.created_at) < new Date(startOfMonth)
    ).length;

    // Active locations (group by address regex)
    const zoneMap: Record<string, number> = {};
    facilities.forEach((f: any) => {
      const name = f.name || '';
      let zone = f.address || 'Lainnya';
      if (/FMIPA|Golden Corner|Gedung Fisika|CCR/i.test(name)) zone = 'FMIPA';
      else if (/Fapet|Peternakan/i.test(name)) zone = 'Fapet';
      else if (/Fahutan|Kehutanan/i.test(name)) zone = 'Fahutan';
      else if (/Satari/i.test(name)) zone = 'Satari';
      else if (/Perpus/i.test(name)) zone = 'Perpustakaan';
      else if (/GPK/i.test(name)) zone = 'GPK';
      zoneMap[zone] = (zoneMap[zone] || 0) + 1;
    });
    const totalZone = Object.values(zoneMap).reduce((s, v) => s + v, 0);
    const activeLocations = Object.entries(zoneMap)
      .map(([name, count]) => ({ name, pct: totalZone > 0 ? Math.round((count / totalZone) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);

    // Leaderboard
    const leaderboard = (leaderboardResult.data || []).map((u: any) => ({
      name: u.username || 'User',
      pts: u.total_points || 0,
      initials: (u.username || 'U').slice(0, 2).toUpperCase(),
      isMvp: false,
    }));
    if (leaderboard.length > 0) leaderboard[0].isMvp = true;

    // User growth
    const totalUsers = userCountResult.count || 0;
    const newUsers = newUserResult.count || 0;
    const activeUsers = totalUsers; // simplified

    // Eco score
    const refillBonus = Math.min(15, Math.floor(totalRefills / 100));
    const reportPenalty = Math.min(10, reportsPending);
    const ecoScore = Math.max(0, Math.min(100, 80 + refillBonus - reportPenalty));

    // Facility table (top 6)
    const facilityTable = facilities.slice(0, 6).map((f: any, idx: number) => ({
      id: `FAC-${String(idx + 1).padStart(3, '0')}`,
      dbId: f.id,
      name: f.name,
      category: f.type === 'refill_air' ? 'Refill' : 'Waste Bin',
      status: f.status === 'aktif' ? 'ACTIVE' : f.status === 'maintenance' ? 'MAINTENANCE' : 'OFFLINE',
      statusClass: f.status === 'aktif' ? 'bg-green-100 text-green-700' : f.status === 'maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700',
    }));

    // Reviews
    const reviews = (reviewsResult.data || []).map((r: any) => ({
      user: r.users?.username || 'User',
      text: r.comment?.slice(0, 100) || '',
      stars: r.stars || 5,
    }));
    if (reviews.length === 0) {
      reviews.push(
        { user: 'Alya', text: 'Refill station sangat membantu. Airnya segar!', stars: 5 },
        { user: 'Dimas', text: 'Tempat sampah perlu ditambah jadwal pengangkutan.', stars: 3 }
      );
    }

    return NextResponse.json({
      campusName: 'IPB University',
      ecoScore,
      stats: [
        { label: 'Total Refill Saved', value: formatNum(totalRefills), trend: `${refillGrowthPct >= 0 ? '+' : ''}${refillGrowthPct}% this week` },
        { label: 'Active Refill Stations', value: String(activeRefillStations), trend: `${stationGrowth >= 0 ? '+' : ''}${stationGrowth} this month` },
        { label: 'Active Waste Bins', value: String(activeWasteBins), trend: `${binGrowth >= 0 ? '+' : ''}${binGrowth} this month` },
        { label: 'Reports Pending', value: String(reportsPending), trend: `${reportsPending} pending`, trendRed: true },
      ],
      recentReports,
      weeklyRefill: weeklyBars,
      activeLocations,
      userGrowth: { active: formatNum(activeUsers), new: newUsers, target: formatNum(totalUsers + 500) },
      facilityTable,
      leaderboard,
      reviews,
    });
  } catch (error) {
    console.error('DASHBOARD_FETCH_ERROR:', error);
    return NextResponse.json({ error: 'Gagal memuat dashboard.' }, { status: 500 });
  }
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function getRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Baru saja';
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

function getStatusClass(status: string): string {
  if (status === 'PENDING') return 'bg-amber-100 text-amber-700';
  if (status === 'IN PROGRESS') return 'bg-blue-100 text-blue-700';
  if (status === 'RESOLVED') return 'bg-green-100 text-green-700';
  return 'bg-red-100 text-red-700';
}