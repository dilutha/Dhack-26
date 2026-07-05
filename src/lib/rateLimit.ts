// Simple in-memory IP-based rate limiter per route. Suitable for single-instance deployments.
// For multi-instance, use a shared store (e.g., Redis). Kept minimal with zero cost.

type WindowConfig = {
  windowMs: number;
  max: number;
};

type Counter = {
  timestamps: number[];
};

const routeIpToCounter: Map<string, Counter> = new Map();

function getKey(routeId: string, ip: string) {
  return `${routeId}::${ip}`;
}

export function rateLimit(
  routeId: string,
  ip: string | null | undefined,
  cfg: WindowConfig
) {
  if (!ip) return { allowed: true } as const; // cannot rate limit without IP
  const now = Date.now();
  const key = getKey(routeId, ip);
  let bucket = routeIpToCounter.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    routeIpToCounter.set(key, bucket);
  }

  // drop old timestamps outside the window
  const windowStart = now - cfg.windowMs;
  bucket.timestamps = bucket.timestamps.filter(ts => ts > windowStart);

  if (bucket.timestamps.length >= cfg.max) {
    const retryAfterMs = cfg.windowMs - (now - bucket.timestamps[0]);
    return { allowed: false, retryAfterMs } as const;
  }

  bucket.timestamps.push(now);
  return { allowed: true } as const;
}
