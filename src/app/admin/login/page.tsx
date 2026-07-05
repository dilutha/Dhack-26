'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = search?.get('next') || '/admin';
  const unauthorized = search?.get('unauthorized');

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/send-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      setMessage('Check your email for a magic link to log in.');
    } catch (err: any) {
      setError(err?.message || 'Failed to send magic link');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-900 p-6'>
      <div className='w-full max-w-md bg-gray-800/60 backdrop-blur rounded-xl border border-gray-700 p-6'>
        <div className='mb-6 text-center'>
          <Image
            src='/assests/dhack logo.png'
            alt='D-Hack'
            width={48}
            height={48}
            className='w-12 h-12 mx-auto'
            priority
          />
          <h1 className='mt-2 text-xl font-semibold text-white'>Admin Login</h1>
          {unauthorized && (
            <p className='mt-2 text-sm text-red-300'>
              Your account is not authorized for admin access.
            </p>
          )}
        </div>
        <form onSubmit={sendMagicLink} className='space-y-4'>
          <div>
            <Label htmlFor='email' className='text-gray-200'>
              Email
            </Label>
            <Input
              id='email'
              type='email'
              inputMode='email'
              placeholder='you@example.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {message && <p className='text-sm text-green-300'>{message}</p>}
          {error && <p className='text-sm text-red-300'>{error}</p>}
          <Button
            type='submit'
            className='w-full bg-blue-600 hover:bg-blue-700'
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </form>
      </div>
    </div>
  );
}
