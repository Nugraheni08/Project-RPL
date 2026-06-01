import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { showToast } from '../components/ui/Toast';

export const useAuth = () => {
  const { setSession, setRole } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Panggil API Supabase untuk otentikasi
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Simpan sesi ke Zustand global store
      setSession(data.session);
      showToast('Berhasil login!', '✅');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error login:', error);
      showToast(error.message || 'Gagal login. Periksa kembali email dan password Anda.', '❌');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk Register
  const register = async (email: string, password: string, role: 'mahasiswa' | 'dosen') => {
    setIsLoading(true);
    try {
      // Panggil API Supabase untuk pendaftaran
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Simpan role ke Zustand
      setRole(role);
      showToast('Registrasi berhasil! Silakan verifikasi email Anda.', '📧');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error register:', error);
      showToast(error.message || 'Gagal melakukan registrasi.', '❌');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Hapus sesi dari global store
      setSession(null);
      showToast('Berhasil keluar akun', '👋');
      return { success: true };
    } catch (error: any) {
      console.error('Error logout:', error);
      showToast('Gagal keluar dari akun.', '❌');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    login,
    register,
    logout
  };
};