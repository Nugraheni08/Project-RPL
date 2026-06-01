'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import SplashScreen from '../components/auth/SplashScreen';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace('/map');
      } else {
        router.replace('/auth'); // <--- Diubah dari /login menjadi /auth
      }
    };

    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <main id="auth-wrapper">
      <SplashScreen />
    </main>
  );
}