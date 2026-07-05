'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseBrowser';
import AdminGuard from '@/components/admin/AdminGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [estimatedReturn, setEstimatedReturn] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const authHeaders = async () => {
    const { data } = await supabase.auth.getSession();
    const headers: HeadersInit = {};
    if (data.session?.access_token) {
      headers.Authorization = `Bearer ${data.session.access_token}`;
    }
    return headers;
  };

  useEffect(() => {
    const load = async () => {
      const headers = await authHeaders();
      const res = await fetch('/api/admin/maintenance', { headers });
      if (!res.ok) return;
      const data = await res.json();
      setEnabled(Boolean(data.enabled));
      setMessage(data.message || '');
      setEstimatedReturn(data.estimatedReturn || '');
    };
    load();
  }, []);

  const save = async () => {
    setStatus(null);
    const headers = await authHeaders();
    const res = await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ enabled, message, estimatedReturn }),
    });
    const data = await res.json();
    setStatus(res.ok ? data.message : data.error || 'Failed to save settings');
  };

  return (
    <AdminGuard>
      <main className='min-h-screen bg-gray-900 p-6 text-gray-100'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-6 flex items-center justify-between'>
            <h1 className='text-3xl font-bold'>Admin Settings</h1>
            <Link href='/admin/overview' className='text-blue-300 underline'>
              Back to dashboard
            </Link>
          </div>

          <Card className='border-gray-700 bg-gray-900/60'>
            <CardContent className='space-y-5 p-6'>
              <label className='flex items-center gap-3 text-sm font-medium'>
                <input
                  type='checkbox'
                  checked={enabled}
                  onChange={event => setEnabled(event.target.checked)}
                />
                Maintenance mode enabled
              </label>

              <div>
                <Label>Maintenance message</Label>
                <Input
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                  className='bg-gray-950 text-gray-100'
                />
              </div>

              <div>
                <Label>Estimated return</Label>
                <Input
                  value={estimatedReturn}
                  onChange={event => setEstimatedReturn(event.target.value)}
                  placeholder='Optional'
                  className='bg-gray-950 text-gray-100'
                />
              </div>

              {status && <p className='text-sm text-dhack-teal'>{status}</p>}

              <Button onClick={save} className='bg-blue-600 hover:bg-blue-700'>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </AdminGuard>
  );
}
