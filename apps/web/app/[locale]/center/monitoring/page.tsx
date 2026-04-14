'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RedirectMonitoringPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  useEffect(() => {
    router.replace(`/${locale}/center`);
  }, [router, locale]);

  return null;
}
