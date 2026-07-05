'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    api: boolean;
    database: boolean;
    performance: boolean;
    errors: boolean;
  };
  lastChecked: number;
  uptime: number;
}

export function HealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'healthy',
    checks: {
      api: true,
      database: true,
      performance: true,
      errors: true,
    },
    lastChecked: Date.now(),
    uptime: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    const checkHealth = async () => {
      try {
        // Check API health
        const apiCheck = await fetch('/api/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(res => res.ok)
          .catch(() => false);

        // Check database connectivity (via a simple query)
        const dbCheck = await fetch('/api/health/db', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(res => res.ok)
          .catch(() => false);

        // Check performance metrics
        const metrics = logger.getMetrics();
        const recentErrors = logger.getErrors().filter(
          error => Date.now() - error.timestamp < 300000 // Last 5 minutes
        );

        const performanceCheck = metrics.length > 0 && recentErrors.length < 10;
        const errorsCheck =
          recentErrors.filter(e => e.severity === 'critical').length === 0;

        const checks = {
          api: apiCheck,
          database: dbCheck,
          performance: performanceCheck,
          errors: errorsCheck,
        };

        const healthyChecks = Object.values(checks).filter(Boolean).length;
        const totalChecks = Object.values(checks).length;

        let status: 'healthy' | 'degraded' | 'unhealthy';
        if (healthyChecks === totalChecks) {
          status = 'healthy';
        } else if (healthyChecks >= totalChecks / 2) {
          status = 'degraded';
        } else {
          status = 'unhealthy';
        }

        setHealthStatus({
          status,
          checks,
          lastChecked: Date.now(),
          uptime: Date.now() - startTime,
        });

        logger.track('health_check', healthyChecks / totalChecks, 'gauge');
      } catch (error) {
        logger.error('Health check failed', { error });
        setHealthStatus(prev => ({
          ...prev,
          status: 'unhealthy',
          lastChecked: Date.now(),
        }));
      }
    };

    // Initial check
    checkHealth();

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  // Show health status in development or when there are issues
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' ||
      healthStatus.status !== 'healthy'
    ) {
      setIsVisible(true);
    }
  }, [healthStatus.status]);

  if (!isVisible) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'unhealthy':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'unhealthy':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      <div className='bg-background border border-dhack-teal/30 rounded-lg p-3 shadow-lg max-w-xs'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium'>System Health</span>
          <span className={`text-lg ${getStatusColor(healthStatus.status)}`}>
            {getStatusIcon(healthStatus.status)}
          </span>
        </div>

        <div className='space-y-1 text-xs'>
          <div className='flex justify-between'>
            <span>API:</span>
            <span
              className={
                healthStatus.checks.api ? 'text-green-500' : 'text-red-500'
              }
            >
              {healthStatus.checks.api ? '✓' : '✗'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Database:</span>
            <span
              className={
                healthStatus.checks.database ? 'text-green-500' : 'text-red-500'
              }
            >
              {healthStatus.checks.database ? '✓' : '✗'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Performance:</span>
            <span
              className={
                healthStatus.checks.performance
                  ? 'text-green-500'
                  : 'text-red-500'
              }
            >
              {healthStatus.checks.performance ? '✓' : '✗'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Errors:</span>
            <span
              className={
                healthStatus.checks.errors ? 'text-green-500' : 'text-red-500'
              }
            >
              {healthStatus.checks.errors ? '✓' : '✗'}
            </span>
          </div>
        </div>

        <div className='mt-2 pt-2 border-t border-dhack-teal/20 text-xs text-muted-foreground'>
          <div>Uptime: {Math.round(healthStatus.uptime / 1000)}s</div>
          <div>
            Last check:{' '}
            {new Date(healthStatus.lastChecked).toLocaleTimeString()}
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setIsVisible(false)}
            className='mt-2 text-xs text-dhack-teal hover:text-dhack-orange transition-colors'
          >
            Hide
          </button>
        )}
      </div>
    </div>
  );
}
// Health check API endpoints (these would be implemented in your API routes)
export const healthCheckEndpoints = {
  // /api/health
  main: () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  }),

  // /api/health/db
  database: async () => {
    try {
      // This would check your actual database connection
      // For now, we'll just return a mock response
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Database connection failed');
    }
  },
};
