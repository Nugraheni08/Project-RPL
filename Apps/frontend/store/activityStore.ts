import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Mendefinisikan tipe data untuk entri Leaderboard (dari DB view user_rankings)
export interface LeaderboardUser {
  id: string;
  name: string;
  role: string;
  pts: number;
  rank: number;
  avatar_url?: string | null;
}

// Mendefinisikan tipe data untuk Aktivitas
export interface Activity {
  icon: string;
  name: string;
  time: string;
  pts: string;
  isRecycle?: boolean;
}

// Tipe untuk user rank dari RPC get_user_rank
export interface UserRank {
  id: string;
  email: string;
  username: string | null;
  role: string;
  total_points: number;
  rank: number;
  avatar_url: string | null;
  full_name: string | null;
}

interface ActivityState {
  // Poin & rank pengguna dari DB
  userPoints: number;
  userRank: number;

  // Data Leaderboard dari DB
  leaderboardData: LeaderboardUser[];

  // Daftar aktivitas dari DB
  recentActivities: Activity[];

  // Loading states
  isLoadingRank: boolean;
  isLoadingLeaderboard: boolean;

  // Actions
  setUserPoints: (points: number) => void;
  setUserRank: (rank: number) => void;
  setLeaderboard: (data: LeaderboardUser[]) => void;
  addPoints: (points: number) => void;
  addActivity: (activity: Activity) => void;

  // Fetch dari DB
  fetchUserRank: (userId: string) => Promise<void>;
  fetchLeaderboard: (limit?: number) => Promise<void>;
  fetchRecentActivities: (userId: string, limit?: number) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  // Nilai awal default (0 sebelum fetch dari DB)
  userPoints: 0,
  userRank: 0,

  leaderboardData: [],
  recentActivities: [],

  isLoadingRank: false,
  isLoadingLeaderboard: false,

  setUserPoints: (points) => set({ userPoints: points }),
  setUserRank: (rank) => set({ userRank: rank }),
  setLeaderboard: (data) => set({ leaderboardData: data }),

  // Fungsi untuk menambah poin (optimistic update)
  addPoints: (points) => set((state) => ({
    userPoints: state.userPoints + points
  })),

  // Fungsi untuk menambah aktivitas ke urutan paling atas daftar
  addActivity: (activity) => set((state) => ({
    recentActivities: [activity, ...state.recentActivities]
  })),

  // ============ FETCH DARI SUPABASE ============

  // Ambil rank & points user saat ini via RPC get_user_rank
  fetchUserRank: async (userId: string) => {
    set({ isLoadingRank: true });
    try {
      const { data, error } = await supabase
        .rpc('get_user_rank', { user_id: userId })
        .single();

      if (error) throw error;

      const row = data as UserRank | null;
      if (row) {
        set({
          userPoints: row.total_points ?? 0,
          userRank: row.rank ? Number(row.rank) : 0,
        });
      }
    } catch (error) {
      console.error('Gagal fetch user rank:', error);
    } finally {
      set({ isLoadingRank: false });
    }
  },

  // Ambil leaderboard dari view user_rankings
  fetchLeaderboard: async (limit = 10) => {
    set({ isLoadingLeaderboard: true });
    try {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('*')
        .order('rank', { ascending: true })
        .limit(limit);

      if (error) throw error;

      if (data) {
        const mapped: LeaderboardUser[] = data.map((row: any) => ({
          id: row.id,
          name: row.full_name || row.username || row.email?.split('@')[0] || 'User',
          role: row.role || '',
          pts: row.total_points ?? 0,
          rank: row.rank ? Number(row.rank) : 0,
          avatar_url: row.avatar_url || null,
        }));
        set({ leaderboardData: mapped });
      }
    } catch (error) {
      console.error('Gagal fetch leaderboard:', error);
    } finally {
      set({ isLoadingLeaderboard: false });
    }
  },

  // Ambil aktivitas terbaru dari refill_activity
  fetchRecentActivities: async (userId: string, limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('refill_activity')
        .select('id, activity_type, points_earned, volume_ml, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      if (data) {
        const mapped: Activity[] = data.map((row: any) => {
          const typeLabel =
            row.activity_type === 'refill' ? '💧' :
            row.activity_type === 'waste_deposit' ? '♻️' :
            row.activity_type === 'report' ? '📋' : '💧';

          const nameMap: Record<string, string> = {
            refill: `Refill air · ${row.volume_ml || 500}ml`,
            waste_deposit: 'Deposit sampah',
            report: 'Laporan fasilitas',
          };

          const timeAgo = getTimeAgo(new Date(row.created_at));
          const isRecycle = row.activity_type === 'waste_deposit';

          return {
            icon: typeLabel,
            name: nameMap[row.activity_type] || row.activity_type,
            time: timeAgo,
            pts: `+${row.points_earned} pt`,
            isRecycle,
          };
        });
        set({ recentActivities: mapped });
      }
    } catch (error) {
      console.error('Gagal fetch recent activities:', error);
    }
  },
}));

// Helper: format waktu relatif
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return 'Kemarin';
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString('id-ID');
}
