import { create } from 'zustand';

interface AuthState {
  currentRole: 'mahasiswa' | 'dosen';
  currentOTP: string;
  appReady: boolean;
  session: any | null;
  displayName: string;
  phone: string;
  location: string;

  setRole: (role: 'mahasiswa' | 'dosen') => void;
  setOTP: (otp: string) => void;
  setAppReady: (isReady: boolean) => void;
  setSession: (session: any | null) => void;
  setDisplayName: (name: string) => void;
  setPhone: (phone: string) => void;
  setLocation: (location: string) => void;
}

// Tambahkan tipe (set: any) di sini
export const useAuthStore = create<AuthState>((set: any) => ({
  currentRole: 'mahasiswa', 
  currentOTP: '',
  appReady: false,
  session: null,
  displayName: '',
  phone: '',
  location: '',

  // Tambahkan tipe parameter eksplisit di setiap fungsinya
  setRole: (role: 'mahasiswa' | 'dosen') => set({ currentRole: role }),
  setOTP: (otp: string) => set({ currentOTP: otp }),
  setAppReady: (isReady: boolean) => set({ appReady: isReady }),
  setSession: (session: any | null) => set({ session: session }),
  setDisplayName: (name: string) => set({ displayName: name }),
  setPhone: (phone: string) => set({ phone }),
  setLocation: (location: string) => set({ location }),
}));
