/* eslint-disable no-console */

/**
 * Production-safe logging utility
 * Logs are only shown in development or when explicitly enabled
 */

const isDev = process.env.NODE_ENV === 'development';
const enableProdLogs = process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';

export const logger = {
  info: (message: string, data?: any) => {
    if (isDev || enableProdLogs) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },

  warn: (message: string, data?: any) => {
    if (isDev || enableProdLogs) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },

  error: (message: string, data?: any) => {
    // Always log errors
    console.error(`[ERROR] ${message}`, data || '');
    // Track error summary for HealthCheck
    try {
      const summary =
        typeof data === 'string'
          ? data
          : data?.error?.message || data?.message || message;
      (logger as any)._errors.push({
        message: String(summary || message),
        severity: 'critical',
        timestamp: Date.now(),
      });
      if ((logger as any)._errors.length > 100) (logger as any)._errors.shift();
    } catch {}
  },

  performance: (message: string, data?: any) => {
    if (isDev) {
      console.log(`[PERF] ${message}`, data || '');
    }
  },

  debug: (message: string, data?: any) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  },

  // Lightweight in-memory metrics and error tracking for HealthCheck
  _metrics: [] as Array<{
    name: string;
    value: number;
    type: string;
    ts: number;
  }>,
  _errors: [] as Array<{
    message: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: number;
  }>,

  track(
    name: string,
    value: number,
    type: 'gauge' | 'counter' | 'timer' = 'gauge'
  ) {
    // Keep last 100 metrics
    if ((this as any)._metrics.length > 100) (this as any)._metrics.shift();
    (this as any)._metrics.push({ name, value, type, ts: Date.now() });
  },

  getMetrics() {
    return (this as any)._metrics as Array<{
      name: string;
      value: number;
      type: string;
      ts: number;
    }>;
  },

  getErrors() {
    return (this as any)._errors as Array<{
      message: string;
      severity: 'info' | 'warning' | 'critical';
      timestamp: number;
    }>;
  },
};
