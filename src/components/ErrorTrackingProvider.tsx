'use client';

import { useErrorTracking } from '@/hooks/useErrorTracking';
import { usePerformance } from '@/hooks/usePerformance';

export default function ErrorTrackingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useErrorTracking();
  usePerformance();
  return <>{children}</>;
}
