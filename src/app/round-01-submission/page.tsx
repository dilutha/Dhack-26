'use client';

import React, { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CompetitionCategory, COMPETITIONS } from '@/lib/dhack2026';

const RoundSubmissionForm = dynamic(
  () => import('@/components/forms/RoundSubmissionForm'),
  {
    ssr: false,
    loading: () => (
      <div className='rounded-lg border border-dhack-teal/20 p-6 text-center text-muted-foreground'>
        Loading submission form...
      </div>
    ),
  }
);

const categories: CompetitionCategory[] = [
  'inter_university',
  'inter_school',
  'rebrand',
];

export default function RoundOneSubmissionPage() {
  const [category, setCategory] =
    useState<CompetitionCategory>('inter_university');

  useEffect(() => {
    document.body.classList.add('submit-page');
    return () => document.body.classList.remove('submit-page');
  }, []);

  return (
    <main className='min-h-screen bg-dhack-base text-foreground'>
      <Navbar />
      <section className='relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='mb-10 text-center'>
            <p className='mb-3 text-sm font-semibold uppercase tracking-wide text-dhack-orange'>
              Round 01 Submission
            </p>
            <h1 className='text-4xl md:text-5xl font-heading font-bold'>
              Submit Your <span className='gradient-text'>Deliverables</span>
            </h1>
            <p className='mx-auto mt-5 max-w-3xl text-muted-foreground leading-7'>
              Registration is closed. Registered DHACK&apos;26 teams can submit
              their Round 01 Google Drive folder or file link here.
            </p>
          </div>

          <div className='mb-6 rounded-lg border border-dhack-teal/25 bg-dhack-teal/10 p-4 text-center font-semibold text-dhack-teal'>
            Registration Closed
          </div>

          <div className='mb-6 grid gap-3 md:grid-cols-3'>
            {categories.map(item => (
              <Button
                key={item}
                type='button'
                variant={category === item ? 'default' : 'outline'}
                className='rounded-xl'
                onClick={() => setCategory(item)}
              >
                {COMPETITIONS[item].shortTitle}
              </Button>
            ))}
          </div>

          <Card className='border-dhack-teal/30 bg-background/80 backdrop-blur-sm'>
            <CardContent className='pt-6'>
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className='p-4 text-center'>
                      Loading submission form...
                    </div>
                  }
                >
                  <RoundSubmissionForm roundId={1} category={category} />
                </Suspense>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </main>
  );
}
