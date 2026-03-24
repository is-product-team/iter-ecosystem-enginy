'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import Loading from '@/components/Loading';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.rol.nom_rol === ROLES.ADMIN) {
          router.push('/admin');
        } else if (user.rol.nom_rol === ROLES.COORDINATOR) {
          router.push('/center');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <Loading fullScreen message="Loading platform..." />
  );
}
