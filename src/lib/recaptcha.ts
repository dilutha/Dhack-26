export async function verifyRecaptchaToken(token: string, remoteIp?: string) {
  const secret =
    process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_V2_SECRET;
  if (!secret) {
    // In development, bypass recaptcha if secret is not configured to avoid blocking local testing
    if (process.env.NODE_ENV !== 'production') {
      return { ok: true } as const;
    }
    return { ok: false, reason: 'Missing reCAPTCHA secret' } as const;
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    if (remoteIp) params.append('remoteip', remoteIp);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      cache: 'no-store',
    });
    const data = (await res.json()) as {
      success: boolean;
      challenge_ts?: string;
      hostname?: string;
      'error-codes'?: string[];
      score?: number;
      action?: string;
    };

    if (!data.success) {
      return {
        ok: false,
        reason: (data['error-codes'] || []).join(', ') || 'verification_failed',
      } as const;
    }

    return { ok: true } as const;
  } catch (error) {
    return { ok: false, reason: 'verification_error' } as const;
  }
}
