'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RedirectStatsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  useEffect(() => {
    router.replace(`/${locale}`);
  }, [router, locale]);

  return null;
}
