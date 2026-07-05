// Minimal sanitization utilities to mitigate XSS without adding dependencies.
// We avoid DOMPurify to keep zero-cost. We encode outputs and validate inputs with zod.

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeString(input: unknown, maxLen = 500): string {
  const s = typeof input === 'string' ? input : '';
  const trimmed = s.slice(0, maxLen);
  return escapeHtml(trimmed);
}

// For database storage: trim and bound length only; do not HTML-escape.
// We rely on React's escaping during render and on strict CSP.
export function sanitizeForDbString(input: unknown, maxLen = 500): string {
  const s = typeof input === 'string' ? input : '';
  return s.slice(0, maxLen);
}

export function sanitizeUrl(input: string): string | null {
  try {
    const url = new URL(input);
    // Allow only https
    if (url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}
