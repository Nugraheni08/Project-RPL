import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // ── 1. Total Refills ────────────────────────────────────────────
    const { count: totalRefills, error: refillErr } = await serviceSupabase
      .from('refill_activity')
      .select('*', { count: 'exact', head: true })
      .eq('activity_type', 'refill');

    if (refillErr) console.error('ANALYTICS_ERROR — total refills:', refillErr);

    // ── 2. Waste Collected (total volume_ml → liters → kg waste prevented) ──
    const { data: volumeData, error: volumeErr } = await serviceSupabase
      .from('refill_activity')
      .select('volume_ml');

    let wasteKg = 0;
    if (!volumeErr && volumeData) {
      const totalMl = volumeData.reduce((sum: number, row: any) => sum + (row.volume_ml || 0), 0);
      // 1 liter = 1000ml; 1 bottle refill ≈ 0.5L; plastic saved ≈ 0.025kg per liter
      wasteKg = Math.round((totalMl / 1000) * 0.025 * 10) / 10;
    }

    // Format: show as "X.XT" for kg ≥ 1000, else "X.Xkg"
    const wasteLabel = wasteKg >= 1000
      ? (wasteKg / 1000).toFixed(1) + 'T'
      : wasteKg.toFixed(1) + 'kg';

    // ── 3. Reports This Month ──────────────────────────────────────
    const { count: reportsMonth, error: repMonthErr } = await serviceSupabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    if (repMonthErr) console.error('ANALYTICS_ERROR — reports this month:', repMonthErr);

    // ── 4. Active Users (distinct users with refill in last 30 days) ──
    const { data: activeUsers, error: activeErr } = await serviceSupabase
      .from('refill_activity')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo);

    let activeCount = 0;
    if (!activeErr && activeUsers) {
      const distinct = new Set(activeUsers.map((r: any) => r.user_id));
      activeCount = distinct.size;
    }

    // Format: "2.4K" style
    const activeLabel = activeCount >= 1000
      ? (activeCount / 1000).toFixed(1) + 'K'
      : String(activeCount);

    // ── 5. Weekly Refill Chart ──────────────────────────────────────
    // Get current week's day boundaries
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
      weekRefills.forEach((row: any) => {
        const d = new Date(row.created_at);
        const idx = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0, Sun=6
        if (idx >= 0 && idx < 7) weeklyRefill[idx].refill++;
      });
    }

    // ── 6. Monthly Reports Chart ────────────────────────────────────
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
      yearReports.forEach((row: any) => {
        const d = new Date(row.created_at);
        const monthIdx = d.getMonth(); // 0=Jan
        if (monthIdx >= 0 && monthIdx < 12) monthlyReports[monthIdx].reports++;
      });
    }

    // ── 7. Top Locations (by facility category from refill_activity) ──
    const { data: locData, error: locErr } = await serviceSupabase
      .from('refill_activity')
      .select('facility_id, facilities!inner(name)')
      .eq('activity_type', 'refill');

    type ZoneAcc = Record<string, number>;
    let zoneMap: ZoneAcc = {};
    if (!locErr && locData) {
      const zonePatterns: [RegExp, string][] = [
        [/FMIPA|Golden Corner|Student Corner|Gedung Fisika|CCR/, 'FMIPA'],
        [/Fahutan|Forestry|Kehutanan/, 'Fahutan'],
        [/Fapet|Peternakan|Fakultas Peternakan/, 'Fapet'],
        [/Satari/, 'Satari'],
        [/Perpus|Library|Perpustakaan/, 'Perpus'],
        [/GPK|Graha/, 'GPK'],
      ];

      locData.forEach((row: any) => {
        const name: string = row.facilities?.name || '';
        let matched = 'Lainnya';
        for (const [rx, label] of zonePatterns) {
          if (rx.test(name)) {
            matched = label;
            break;
          }
        }
        zoneMap[matched] = (zoneMap[matched] || 0) + 1;
      });
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

    // Ensure at least 3 items shown
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

    // ── 8. Campus Eco Score ─────────────────────────────────────────
    // Formula: base 80 + bonus for active refills, minus penalty for reports
    //  refill_bonus = min(15, totalRefills / 100)
    //  report_penalty = min(10, reportsMonth)
    //  ecoScore = clamp(80 + refill_bonus - report_penalty, 0, 100)
    const refillBonus = Math.min(15, Math.floor((totalRefills || 0) / 100));
    const reportPenalty = Math.min(10, reportsMonth || 0);
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