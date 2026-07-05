import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export function usePerformance() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          logger.performance(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }

        // Log navigation timing
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          logger.performance('Navigation Timing', {
            domContentLoaded:
              navEntry.domContentLoadedEventEnd -
              navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
            timestamp: new Date().toISOString(),
          });
        }

        // Log paint timing
        if (entry.entryType === 'paint') {
          logger.performance(
            `Paint Timing - ${entry.name}: ${entry.startTime.toFixed(2)}ms`
          );
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    } catch (e) {
      logger.warn('Performance monitoring not supported');
    }

    // Monitor memory usage if available
    const logMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        logger.performance('Memory Usage', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Log memory usage every 30 seconds in development
    const memoryInterval =
      process.env.NODE_ENV === 'development'
        ? setInterval(logMemoryUsage, 30000)
        : null;

    return () => {
      observer.disconnect();
      if (memoryInterval) clearInterval(memoryInterval);
    };
  }, []);
}
