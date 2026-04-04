'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import Loading from '@/components/Loading';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const params = useParams();
  const locale = params?.locale || 'ca';

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role.name === ROLES.ADMIN) {
          router.push(`/${locale}/admin`);
        } else if (user.role.name === ROLES.COORDINATOR) {
          router.push(`/${locale}/center`);
        }
      } else {
        router.push(`/${locale}/login`);
      }
    }
  }, [user, loading, router, locale]);

  return (
    <Loading fullScreen message="Loading platform..." />
  );
}
