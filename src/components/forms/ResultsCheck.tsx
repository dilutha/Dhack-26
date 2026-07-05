'use client';

import React, { useState, useEffect, useRef } from 'react';
// Removed client Supabase usage for security; use results API endpoint
import ReCAPTCHA from 'react-google-recaptcha';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResultsCheck() {
  const [teamId, setTeamId] = useState('');
  const [nic, setNic] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout | null>(null);
  const [successTimeout, setSuccessTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const onCheck = async () => {
    // Clear any existing timeouts
    if (errorTimeout) {
      clearTimeout(errorTimeout);
      setErrorTimeout(null);
    }
    if (successTimeout) {
      clearTimeout(successTimeout);
      setSuccessTimeout(null);
    }

    setError(null);
    setSuccess(null);
    const id = teamId.trim().toUpperCase();
    const nicValue = nic.trim().toUpperCase();
    if (!id) {
      setError('Enter a team ID to check results.');
      setRows([]);
      // Auto-clear error after 4 seconds
      const timeout = setTimeout(() => setError(null), 4000);
      setErrorTimeout(timeout);
      return;
    }
    if (!nicValue) {
      setError('Enter your NIC number to verify team membership.');
      setRows([]);
      // Auto-clear error after 4 seconds
      const timeout = setTimeout(() => setError(null), 4000);
      setErrorTimeout(timeout);
      return;
    }

    // Get reCAPTCHA token
    try {
      const token = recaptchaRef.current?.getValue();
      if (!token) {
        setError('Please complete the reCAPTCHA verification.');
        return;
      }
      recaptchaRef.current?.reset();

      const resp = await fetch(
        `/api/results?id=${encodeURIComponent(id)}&nic=${encodeURIComponent(nicValue)}&recaptcha=${encodeURIComponent(token)}`,
        {
          cache: 'no-store',
        }
      );
      const json = await resp.json();
      if (!resp.ok) {
        setError(json?.error || 'Failed to fetch results');
        setRows([]);
        const timeout = setTimeout(() => setError(null), 4000);
        setErrorTimeout(timeout);
        return;
      }
      setRows(json.data || []);
      if (json.data && json.data.length > 0) {
        setSuccess(`✅ Found ${json.data.length} result(s) for team ${id}`);
        const timeout = setTimeout(() => setSuccess(null), 5000);
        setSuccessTimeout(timeout);
      } else {
        setSuccess(`ℹ️ No results found for team ${id}`);
        const timeout = setTimeout(() => setSuccess(null), 5000);
        setSuccessTimeout(timeout);
      }
    } catch (e) {
      setError('Failed to fetch results');
      setRows([]);
      const timeout = setTimeout(() => setError(null), 4000);
      setErrorTimeout(timeout);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
      if (successTimeout) {
        clearTimeout(successTimeout);
      }
    };
  }, [errorTimeout, successTimeout]);

  return (
    <Card>
      <CardContent className='space-y-6 pt-6'>
        <div className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <Label>Team ID</Label>
              <Input
                value={teamId}
                onChange={e => setTeamId(e.target.value.toUpperCase())}
                placeholder='DH001'
              />
            </div>
            <div>
              <Label>Your NIC Number</Label>
              <Input
                value={nic}
                onChange={e => setNic(e.target.value.toUpperCase())}
                placeholder='123456789V or 200112345678'
              />
            </div>
          </div>
          <div className='flex justify-center'>
            <Button onClick={onCheck} className='w-full sm:w-auto px-8'>
              Check Results
            </Button>
          </div>
        </div>

        <div className='flex justify-center w-full overflow-hidden px-4 py-2'>
          <div className='w-full max-w-xs sm:max-w-sm flex justify-center'>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
              size='normal'
              theme='light'
            />
          </div>
        </div>

        {error && <div className='text-red-500'>{error}</div>}
        {success && <div className='text-green-600 font-medium'>{success}</div>}

        {rows.length > 0 && (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left border-b border-dhack-teal/30'>
                  <th className='py-2 pr-4'>Round</th>
                  <th className='py-2 pr-4'>Status</th>
                  <th className='py-2 pr-4'>Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr
                    key={r.round_id}
                    className='border-b border-dhack-teal/20'
                  >
                    <td className='py-2 pr-4'>Round {r.round_id}</td>
                    <td className='py-2 pr-4'>{r.status}</td>
                    <td className='py-2 pr-4'>
                      {new Date(r.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className='mt-2 text-xs text-muted-foreground'>
          This site is protected by reCAPTCHA and the Google Privacy Policy and
          Terms of Service apply.
        </p>
      </CardContent>
    </Card>
  );
}
