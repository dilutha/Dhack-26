// Simple in-memory cache implementation
// In production, replace with Redis or similar

interface CacheItem<T> {
  value: T;
  expires: number;
  createdAt: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 1000; // Maximum number of items
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    // Clean up expired items if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const item: CacheItem<T> = {
      value,
      expires: Date.now() + ttl,
      createdAt: Date.now(),
    };

    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, item] of entries) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    const values = Array.from(this.cache.values());
    for (const item of values) {
      if (now > item.expires) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize,
    };
  }
}

// Singleton cache instance
export const cache = new CacheManager();

// Cache decorator for functions
export function cached<T extends any[], R>(
  keyGenerator: (...args: T) => string,
  ttl: number = 5 * 60 * 1000
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const cacheKey = keyGenerator(...args);

      // Try to get from cache first
      const cached = cache.get<R>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute the method and cache the result
      const result = await method.apply(this, args);
      cache.set(cacheKey, result, ttl);

      return result;
    };
  };
}

// Utility functions for common cache patterns
export const CacheKeys = {
  events: () => 'events:all',
  teams: () => 'teams:all',
  members: () => 'members:all',
  results: () => 'results:all',
  submissions: () => 'submissions:all',
  adminStats: () => 'admin:stats',
  healthCheck: () => 'health:check',
} as const;

// Cache invalidation helpers
export function invalidatePattern(pattern: string): void {
  const regex = new RegExp(pattern);
  const keys = Array.from(cache['cache'].keys());
  for (const key of keys) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

export function invalidateAll(): void {
  cache.clear();
}
