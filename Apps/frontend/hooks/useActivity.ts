import { useState, useCallback } from 'react';
import { useActivityStore } from '../store/activityStore';
import { showToast } from '../components/ui/Toast';

export const useActivity = () => {
  // Mengambil data dari global store
  const { leaderboardData } = useActivityStore();
  
  // State lokal untuk loading status saat mengirim data
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk mencatat aktivitas pengguna (misal: isi air, buang sampah)
  const recordActivity = useCallback(async (activityName: string, pointsEarned: number) => {
    setIsSubmitting(true);
    
    try {
      // Simulasi proses pengiriman data ke backend/Supabase
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Tampilkan notifikasi berhasil dapet poin
      showToast(`Aktivitas dicatat: ${activityName} (+${pointsEarned} Poin)`, '🌟');
      
      return true;
    } catch (error) {
      console.error('Gagal mencatat aktivitas:', error);
      showToast('Gagal mencatat aktivitas. Coba lagi.', '❌');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    leaderboardData,
    recordActivity,
    isSubmitting
  };
};