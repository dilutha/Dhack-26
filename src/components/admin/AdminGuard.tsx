'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseBrowser';

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      // Allow the login page itself without checks
      if (pathname?.startsWith('/admin/login')) {
        if (mounted) setChecking(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session) {
          router.replace(
            '/admin/login?next=' + encodeURIComponent(pathname || '/admin')
          );
          return;
        }

        const accessToken = session.access_token;
        const resp = await fetch('/api/admin/verify', {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (resp.ok) {
          return; // authorized
        }

        await supabase.auth.signOut();
        router.replace('/admin/login?unauthorized=1');
      } catch (e) {
        try {
          await supabase.auth.signOut();
        } catch {}
        router.replace('/admin/login');
      } finally {
        if (mounted) setChecking(false);
      }
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange(_event => {
      check();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (checking) {
    return (
      <div className='min-h-screen grid place-items-center bg-gray-900 text-gray-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-4 text-gray-300'>Checking permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
