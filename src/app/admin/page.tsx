'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseBrowser';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const go = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/admin/overview');
      } else {
        router.replace('/admin/login');
      }
    };
    go();
  }, [router]);

  return (
    <div className='min-h-screen bg-gray-900 text-gray-100 p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-4 text-gray-300'>Redirecting...</p>
        </div>
      </div>
    </div>
  );
}
