export interface UserProfile {
  id: string;
  email: string;
  role: 'Mahasiswa' | 'Dosen';
  nim?: string | null;
  nip?: string | null;
  is_verified: boolean;
}