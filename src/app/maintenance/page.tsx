'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Maintenance() {
  const [bypassCode, setBypassCode] = useState('');
  const [isBypassed, setIsBypassed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [maintenanceStatus, setMaintenanceStatus] = useState<{
    bypassed: boolean;
    maintenanceMode: boolean;
    message?: string;
    estimatedReturn?: string;
    contactEmail?: string;
  } | null>(null);

  useEffect(() => {
    // Check current bypass and maintenance status
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/maintenance-bypass');
      const data = await response.json();
      const configResponse = await fetch('/api/config', { cache: 'no-store' });
      const config = await configResponse.json();
      setMaintenanceStatus({
        ...data,
        message: config?.settings?.maintenanceMessage,
        estimatedReturn: config?.settings?.maintenanceEstimatedReturn,
        contactEmail: config?.settings?.contactEmail,
      });
      setIsBypassed(data.bypassed);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const handleBypass = async () => {
    if (!bypassCode.trim()) {
      setError('Please enter a bypass code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/maintenance-bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: bypassCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsBypassed(true);
        setMaintenanceStatus(prev =>
          prev ? { ...prev, bypassed: true } : null
        );
        setBypassCode('');
      } else {
        setError(data.error || 'Invalid bypass code');
      }
    } catch (error) {
      console.error('Bypass error:', error);
      setError('Failed to verify bypass code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBypass();
    }
  };

  if (isBypassed) {
    return (
      <div className='min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4'>
        <Card className='border border-gray-700 bg-gray-900/40 max-w-md mx-auto'>
          <CardContent className='p-6 text-center'>
            <div className='mb-4'>
              <div className='w-16 h-16 mx-auto relative'>
                <div className='w-12 h-12 bg-green-600 rounded-full mx-auto animate-pulse'></div>
                <div className='absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full'></div>
              </div>
            </div>
            <h2 className='text-xl font-semibold text-white mb-2'>
              Access Granted
            </h2>
            <p className='text-gray-400 mb-4'>
              You have bypass access to the site during maintenance.
            </p>
            <Link href='/'>
              <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4'>
      <div className='max-w-2xl mx-auto text-center'>
        <div className='mb-8 flex justify-center'>
          <Image
            src='/assests/dhack logo.png'
            alt="DHACK'26 Logo"
            width={220}
            height={80}
            className='h-24 w-auto object-contain'
            priority
          />
        </div>

        <h1 className='text-4xl md:text-6xl font-bold text-yellow-500 mb-4 animate-pulse'>
          Under Maintenance
        </h1>
        <h2 className='text-xl md:text-2xl font-semibold text-white mb-4'>
          We&apos;re Upgrading Our Systems
        </h2>
        <p className='text-gray-400 mb-8 text-lg'>
          {maintenanceStatus?.message ||
            "We're making DHACK better. We'll be back online soon."}
        </p>
        {maintenanceStatus?.estimatedReturn && (
          <p className='text-sm text-gray-300 mb-6'>
            Estimated return: {maintenanceStatus.estimatedReturn}
          </p>
        )}

        {/* Status Info */}
        {maintenanceStatus && (
          <div className='mb-6'>
            <div className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'>
              <div className='w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse'></div>
              Maintenance Mode Active
            </div>
          </div>
        )}

        {/* Bypass Section */}
        <Card className='border border-gray-700 bg-gray-900/40 max-w-sm mx-auto mb-6'>
          <CardContent className='p-4'>
            <h3 className='text-sm font-semibold text-gray-300 mb-2'>
              Authorized Access
            </h3>
            <p className='text-xs text-gray-500 mb-4'>
              Enter bypass code if you have been granted access.
            </p>
            <div className='space-y-3'>
              <Input
                type='password'
                placeholder='Enter bypass code'
                value={bypassCode}
                onChange={e => setBypassCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className='bg-gray-800 border-gray-600 text-gray-100'
                disabled={isLoading}
              />
              {error && <p className='text-red-400 text-sm'>{error}</p>}
              <Button
                onClick={handleBypass}
                disabled={isLoading}
                className='w-full bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50'
              >
                {isLoading ? 'Verifying...' : 'Bypass Maintenance'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className='text-sm text-gray-500'>
          For urgent inquiries, contact{' '}
          <a
            href={`mailto:${maintenanceStatus?.contactEmail || 'info@dhack.lk'}`}
            className='text-yellow-400 underline'
          >
            {maintenanceStatus?.contactEmail || 'info@dhack.lk'}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
