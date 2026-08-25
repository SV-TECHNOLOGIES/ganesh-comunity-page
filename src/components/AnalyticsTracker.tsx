'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { DataStore } from '@/lib/data-store';
import { trackPageView } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    DataStore.init();
    if (pathname) {
      trackPageView(pathname, document.title);
    }
  }, [pathname]);

  return null;
}
