import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // ── 1. Total Refills (successful rows in refill_activity with type 'refill') ──
    const { count: totalRefills, error: refillErr } = await serviceSupabase
      .from('refill_activity')
      .select('*', { count: 'exact', head: true })
      .eq('activity_type', 'refill');

    if (refillErr) console.error('ANALYTICS_ERROR — total refills:', refillErr);

    // ── 2. Waste Collected ───────────────────────────────────────────
    // Sum the weight_kg field from refill_activity where activity_type is 'waste' or 'disposal'
    // Fallback: sum volume_ml from all refill_activity rows and convert to estimated kg
    const { data: wasteData, error: wasteErr } = await serviceSupabase
      .from('refill_activity')
      .select('weight_kg, volume_ml');

    let wasteKg = 0;
    if (!wasteErr && wasteData) {
      // Prefer weight_kg if available, else estimate from volume_ml
      for (const row of wasteData) {
        if (row.weight_kg) {
          wasteKg += Number(row.weight_kg);
        } else if (row.volume_ml) {
          // 1L = 1000ml; estimated plastic waste saved ≈ 0.025kg per refill liter
          wasteKg += (Number(row.volume_ml) / 1000) * 0.025;
        }
      }
    }

    // Format: show as "X.Xt" for kg ≥ 1000, else "X.Xkg"
    const wasteLabel = wasteKg >= 1000
      ? (wasteKg / 1000).toFixed(1) + 't'
      : wasteKg.toFixed(1) + 'kg';

    // ── 3. Reports This Month ──────────────────────────────────────
    const { count: reportsMonth, error: repMonthErr } = await serviceSupabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    if (repMonthErr) console.error('ANALYTICS_ERROR — reports this month:', repMonthErr);

    // ── 4. Active Users ────────────────────────────────────────────
    // Count distinct users active in the last 30 days AND total registered users
    const [activeUsersRes, totalUsersRes] = await Promise.all([
      serviceSupabase
        .from('refill_activity')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo),
      serviceSupabase
        .from('users')
        .select('id', { count: 'exact', head: true }),
    ]);

    let activeCount = 0;
    if (!activeUsersRes.error && activeUsersRes.data) {
      const distinct = new Set(activeUsersRes.data.map((r: any) => r.user_id));
      activeCount = distinct.size;
    }

    const totalUserCount = totalUsersRes.count || 0;

    // Format: "2.4K" style for active / "1.2K" for total
    const fmtNum = (n: number): string =>
      n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M'
        : n >= 1_000 ? (n / 1_000).toFixed(1) + 'K'
        : String(n);

    const activeLabel = fmtNum(activeCount);
    const totalUserLabel = fmtNum(totalUserCount);

    // ── 5. Weekly Refill Chart (past 7 days by day-of-week) ────────
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const weekStart = monday.toISOString();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyRefill: { day: string; refill: number }[] = days.map((d) => ({ day: d, refill: 0 }));

    const { data: weekRefills, error: weekErr } = await serviceSupabase
      .from('refill_activity')
      .select('created_at')
      .eq('activity_type', 'refill')
      .gte('created_at', weekStart);

    if (!weekErr && weekRefills) {
      for (const row of weekRefills) {
        const d = new Date(row.created_at);
        const idx = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0, Sun=6
        if (idx >= 0 && idx < 7) weeklyRefill[idx].refill++;
      }
    }

    // ── 6. Monthly Reports Chart (all of this year, grouped by month) ──
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyReports: { month: string; reports: number }[] = monthLabels.map((m) => ({
      month: m,
      reports: 0,
    }));

    const { data: yearReports, error: yearErr } = await serviceSupabase
      .from('reports')
      .select('created_at')
      .gte('created_at', startOfYear);

    if (!yearErr && yearReports) {
      for (const row of yearReports) {
        const d = new Date(row.created_at);
        const monthIdx = d.getMonth(); // 0=Jan
        if (monthIdx >= 0 && monthIdx < 12) monthlyReports[monthIdx].reports++;
      }
    }

    // ── 7. Top Locations (highest count of refill activities) ─────
    // Join refill_activity with facilities to get location names
    const { data: locData, error: locErr } = await serviceSupabase
      .from('refill_activity')
      .select('facilities!inner(name, address, location)')
      .eq('activity_type', 'refill');

    type ZoneAcc = Record<string, number>;
    let zoneMap: ZoneAcc = {};
    if (!locErr && locData) {
      const zonePatterns: [RegExp, string][] = [
        [/FMIPA|Golden Corner|Student Corner|Gedung Fisika|CCR/i, 'FMIPA'],
        [/Fahutan|Forestry|Kehutanan/i, 'Fahutan'],
        [/Fapet|Peternakan|Fakultas Peternakan/i, 'Fapet'],
        [/Satari/i, 'Satari'],
        [/Perpus|Library|Perpustakaan/i, 'Perpus'],
        [/GPK|Graha/i, 'GPK'],
      ];

      for (const row of locData) {
        const facility: any = row.facilities;
        const name: string = facility?.name || facility?.address || '';
        let matched = 'Lainnya';
        for (const [rx, label] of zonePatterns) {
          if (rx.test(name)) {
            matched = label;
            break;
          }
        }
        zoneMap[matched] = (zoneMap[matched] || 0) + 1;
      }
    }

    // Convert to percentages
    const totalZoneCount = Object.values(zoneMap).reduce((s, v) => s + v, 0);
    const topLocations = Object.entries(zoneMap)
      .map(([name, count]) => ({
        name,
        percentage: totalZoneCount > 0 ? Math.round((count / totalZoneCount) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    // Ensure at least 3 items shown for visual consistency
    if (topLocations.length < 3) {
      const defaults = [
        { name: 'FMIPA', percentage: 0 },
        { name: 'Fapet', percentage: 0 },
        { name: 'Fahutan', percentage: 0 },
      ];
      for (const d of defaults) {
        if (!topLocations.find((l) => l.name === d.name)) {
          topLocations.push(d);
        }
      }
    }

    // ── 8. Campus Eco Score (dynamic formula) ──────────────────────
    // Formula: base 80 + refill_bonus - report_penalty, clamped 0–100
    //   refill_bonus = min(15, totalRefills / 100)
    //   report_penalty = min(10, pending reports this month)
    const { count: pendingReports } = (await serviceSupabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING')
      .gte('created_at', startOfMonth)) || { count: 0 };

    const refillBonus = Math.min(15, Math.floor((totalRefills || 0) / 100));
    const reportPenalty = Math.min(10, pendingReports || 0);
    const rawEcoScore = 80 + refillBonus - reportPenalty;
    const ecoScore = Math.max(0, Math.min(100, rawEcoScore));

    let ecoStatus = 'Good';
    if (ecoScore >= 90) ecoStatus = 'Excellent';
    else if (ecoScore >= 75) ecoStatus = 'Good';
    else if (ecoScore >= 50) ecoStatus = 'Fair';
    else ecoStatus = 'Needs Improvement';

    return NextResponse.json({
      totalRefills: totalRefills || 0,
      wasteCollected: { value: wasteKg, label: wasteLabel },
      reportsThisMonth: reportsMonth || 0,
      activeUsers: { value: activeCount, label: activeLabel },
      totalUsers: { value: totalUserCount, label: totalUserLabel },
      weeklyRefill,
      monthlyReports,
      topLocations,
      ecoScore: { score: ecoScore, status: ecoStatus },
    });
  } catch (error) {
    console.error('ANALYTICS_ERROR — Unhandled exception:', error);
    return NextResponse.json({ error: 'Gagal memuat data analitik.' }, { status: 500 });
  }
}
