'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ReCAPTCHA from 'react-google-recaptcha';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompetitionCategory } from '@/lib/dhack2026';

const schema = z
  .object({
    team_name: z.string().optional().or(z.literal('')),
    school_name: z.string().optional().or(z.literal('')),
    submission_link: z
      .string()
      .url('Google Drive link is required')
      .refine(
        value => value.startsWith('https://drive.google.com/'),
        'Must be a Google Drive link'
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.team_name?.trim() && !data.school_name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['team_name'],
        message: 'Team name or school name is required.',
      });
    }
  });

type Values = z.infer<typeof schema>;

export default function RoundSubmissionForm({
  roundId,
  category,
}: {
  roundId: 1 | 2 | 3;
  category: CompetitionCategory;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [windowStatus, setWindowStatus] = useState<
    'upcoming' | 'open' | 'closed'
  >('closed');
  const [windowLabel, setWindowLabel] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      team_name: '',
      school_name: '',
      submission_link: '',
    },
  });

  useEffect(() => {
    reset({ team_name: '', school_name: '', submission_link: '' });
    setMessage(null);
    setError(null);
  }, [roundId, category, reset]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/config', { cache: 'no-store' });
        const json = await res.json();
        const windows = json?.submissionWindows || [];
        const window = windows.find(
          (item: any) =>
            item.round === roundId &&
            (!item.competition_category ||
              item.competition_category === category)
        );
        if (!window) {
          if (mounted) {
            setWindowStatus('closed');
            setWindowLabel('Submission window is not configured.');
          }
          return;
        }

        const now = Date.now();
        const open = new Date(window.opens_at).getTime();
        const close = new Date(window.closes_at).getTime();
        if (mounted) {
          if (now < open) {
            setWindowStatus('upcoming');
            setWindowLabel(`Opens on ${new Date(window.opens_at).toLocaleString()}`);
          } else if (now >= open && now < close) {
            setWindowStatus('open');
            setWindowLabel(`Closes on ${new Date(window.closes_at).toLocaleString()}`);
          } else {
            setWindowStatus('closed');
            setWindowLabel('Submission closed');
          }
        }
      } catch {
        if (mounted) {
          setWindowStatus('closed');
          setWindowLabel('Submission window unavailable.');
        }
      }
    };

    load();
    const id = setInterval(load, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [roundId, category]);

  const onSubmit = async (values: Values) => {
    setError(null);
    setMessage(null);

    if (windowStatus !== 'open') {
      setError(windowLabel || 'Submission closed');
      return;
    }

    const recaptchaToken = recaptchaSiteKey ? recaptchaRef.current?.getValue() : '';
    if (recaptchaSiteKey && !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    const res = await fetch('/api/round-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        competition_category: category,
        round: roundId,
        team_name: category === 'inter_school' ? '' : values.team_name,
        school_name: category === 'inter_school' ? values.school_name : '',
        submission_link: values.submission_link,
        recaptchaToken,
      }),
    });
    const data = await res.json();
    recaptchaRef.current?.reset();

    if (!res.ok) {
      setError(data?.error || 'Submission failed.');
      return;
    }

    setMessage('Submission received successfully.');
    reset({ team_name: '', school_name: '', submission_link: '' });
  };

  return (
    <Card>
      <CardContent className='space-y-6 pt-6'>
        <div
          className={`rounded-lg p-3 text-sm ${
            windowStatus === 'open'
              ? 'border border-dhack-teal/30 bg-dhack-teal/10 text-dhack-teal'
              : windowStatus === 'upcoming'
                ? 'border border-yellow-400/30 bg-yellow-400/10 text-yellow-300'
                : 'border border-red-400/40 bg-red-500/10 text-red-200'
          }`}
        >
          {windowLabel}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div>
            <Label>
              {category === 'inter_school' ? 'School Name' : 'Team Name'}
            </Label>
            <Controller
              name={category === 'inter_school' ? 'school_name' : 'team_name'}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={
                    category === 'inter_school'
                      ? 'Registered school name'
                      : 'Registered team name'
                  }
                />
              )}
            />
            {(errors.team_name || errors.school_name) && (
              <p className='mt-1 text-sm text-red-400'>
                {errors.team_name?.message || errors.school_name?.message}
              </p>
            )}
          </div>

          <div>
            <Label>Google Drive Link</Label>
            <Controller
              name='submission_link'
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder='https://drive.google.com/...' />
              )}
            />
            {errors.submission_link && (
              <p className='mt-1 text-sm text-red-400'>
                {errors.submission_link.message}
              </p>
            )}
          </div>

          {recaptchaSiteKey && (
            <div className='flex justify-center overflow-hidden py-2'>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={recaptchaSiteKey}
                size='normal'
                theme='light'
              />
            </div>
          )}

          {error && <div className='text-sm text-red-400'>{error}</div>}
          {message && <div className='text-sm text-dhack-teal'>{message}</div>}

          <Button
            type='submit'
            disabled={isSubmitting || windowStatus !== 'open'}
            className='w-full'
          >
            {isSubmitting ? 'Submitting...' : `Submit Round ${roundId}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
