'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // If Supabase appended credentials in the URL hash, keep them when redirecting
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    // Redirect to admin landing where AdminGuard will verify access
    router.replace(`/admin${hash || ''}`);
  }, [router]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-900 text-gray-100'>
      Redirecting to admin...
    </div>
  );
}
