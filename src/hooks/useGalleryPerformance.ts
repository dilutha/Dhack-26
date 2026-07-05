'use client';

import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  imageLoadTime: number;
  totalImages: number;
  loadedImages: number;
  averageLoadTime: number;
}

export const useGalleryPerformance = () => {
  const metrics = useRef<PerformanceMetrics>({
    imageLoadTime: 0,
    totalImages: 0,
    loadedImages: 0,
    averageLoadTime: 0,
  });

  const loadStartTimes = useRef<Map<string, number>>(new Map());

  const trackImageLoadStart = useCallback((imageSrc: string) => {
    loadStartTimes.current.set(imageSrc, performance.now());
  }, []);

  const trackImageLoadComplete = useCallback((imageSrc: string) => {
    const startTime = loadStartTimes.current.get(imageSrc);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      metrics.current.imageLoadTime += loadTime;
      metrics.current.loadedImages += 1;
      metrics.current.averageLoadTime =
        metrics.current.imageLoadTime / metrics.current.loadedImages;

      loadStartTimes.current.delete(imageSrc);
    }
  }, []);

  const reportPerformance = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Gallery Performance Metrics:', {
        totalLoadTime: `${metrics.current.imageLoadTime.toFixed(2)}ms`,
        loadedImages: metrics.current.loadedImages,
        averageLoadTime: `${metrics.current.averageLoadTime.toFixed(2)}ms`,
        efficiency:
          metrics.current.averageLoadTime < 500 ? 'Good' : 'Needs Optimization',
      });
    }
  }, []);

  // Report performance metrics periodically
  useEffect(() => {
    const interval = setInterval(reportPerformance, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [reportPerformance]);

  return {
    trackImageLoadStart,
    trackImageLoadComplete,
    getMetrics: () => ({ ...metrics.current }),
  };
};
