'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import Loading from '@/components/Loading';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const role = user.rol?.nom_rol;
        if (role === 'ADMIN') {
          router.push('/admin');
        } else if (role === 'COORDINADOR') {
          router.push('/centro');
        } else {
          // If role is missing or invalid, redirect to login
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <Loading fullScreen message="Carregant plataforma..." />
  );
}
