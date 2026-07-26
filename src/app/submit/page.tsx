'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import dynamic from 'next/dynamic';
import { CompetitionCategory } from '@/lib/dhack2026';
const RoundSubmissionForm = dynamic(
  () => import('@/components/forms/RoundSubmissionForm'),
  {
    ssr: false,
    loading: () => (
      <div className='p-4 text-center'>Loading submission form...</div>
    ),
  }
);
const ResultsCheck = dynamic(() => import('@/components/forms/ResultsCheck'), {
  ssr: false,
  loading: () => (
    <div className='p-4 text-center'>Loading results checker...</div>
  ),
});

type TopTab = CompetitionCategory | 'registration' | 'results';

export default function SubmitPage() {
  const [activeTab, setActiveTab] = useState<TopTab>('inter_university');
  const [activeRound, setActiveRound] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (
      activeTab === 'inter_university' ||
      activeTab === 'inter_school' ||
      activeTab === 'rebrand'
    ) {
      setActiveRound(1);
    }
  }, [activeTab]);

  // Mark body for page-scoped styles (show reCAPTCHA badge, hide BackToTop)
  useEffect(() => {
    document.body.classList.add('submit-page');
    return () => {
      document.body.classList.remove('submit-page');
    };
  }, []);

  return (
    <main className='min-h-screen bg-dhack-base text-foreground'>
      <Navbar />
      <section className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-20'>
        <h1 className='text-3xl md:text-4xl font-heading font-bold text-center mb-8'>
          Submit Center
        </h1>

        {/* Top Tabs */}
        <div className='mb-6'>
          {/* Mobile: Horizontal scroll */}
          <div className='flex gap-3 overflow-x-auto pb-2 sm:hidden'>
            <Button
              variant={activeTab === 'inter_university' ? 'default' : 'outline'}
              className='flex-shrink-0 rounded-xl px-6'
              onClick={() => setActiveTab('inter_university')}
            >
              University
            </Button>
            <Button
              variant={activeTab === 'inter_school' ? 'default' : 'outline'}
              className='flex-shrink-0 rounded-xl px-6'
              onClick={() => setActiveTab('inter_school')}
            >
              School
            </Button>
            <Button
              variant={activeTab === 'rebrand' ? 'default' : 'outline'}
              className='flex-shrink-0 rounded-xl px-6'
              onClick={() => setActiveTab('rebrand')}
            >
              ReBrand
            </Button>
            <Button
              variant={activeTab === 'results' ? 'default' : 'outline'}
              className='flex-shrink-0 rounded-xl px-6'
              onClick={() => setActiveTab('results')}
            >
              Results
            </Button>
          </div>
          {/* Desktop: Grid layout */}
          <div className='hidden sm:grid sm:grid-cols-4 gap-4'>
            <Button
              variant={activeTab === 'inter_university' ? 'default' : 'outline'}
              className='w-full rounded-xl'
              onClick={() => setActiveTab('inter_university')}
            >
              University
            </Button>
            <Button
              variant={activeTab === 'inter_school' ? 'default' : 'outline'}
              className='w-full rounded-xl'
              onClick={() => setActiveTab('inter_school')}
            >
              School
            </Button>
            <Button
              variant={activeTab === 'rebrand' ? 'default' : 'outline'}
              className='w-full rounded-xl'
              onClick={() => setActiveTab('rebrand')}
            >
              ReBrand
            </Button>
            <Button
              variant={activeTab === 'results' ? 'default' : 'outline'}
              className='w-full rounded-xl'
              onClick={() => setActiveTab('results')}
            >
              Results
            </Button>
          </div>
        </div>

        {/* Round selectors (Innovation/ReBrand only) */}
        {(activeTab === 'inter_university' ||
          activeTab === 'inter_school' ||
          activeTab === 'rebrand') && (
          <div className='mb-6'>
            {/* Mobile: Horizontal scroll */}
            <div className='flex gap-3 overflow-x-auto pb-2 mb-6 sm:hidden'>
              <Button
                variant={activeRound === 1 ? 'default' : 'outline'}
                className='flex-shrink-0 rounded-xl px-6'
                onClick={() => setActiveRound(1)}
              >
                Round 1
              </Button>
              <Button
                variant={activeRound === 2 ? 'default' : 'outline'}
                className='flex-shrink-0 rounded-xl px-6'
                onClick={() => setActiveRound(2)}
              >
                Round 2
              </Button>
              <Button
                variant={activeRound === 3 ? 'default' : 'outline'}
                className='flex-shrink-0 rounded-xl px-6'
                onClick={() => setActiveRound(3)}
              >
                Final Round
              </Button>
            </div>
            {/* Desktop: Grid layout */}
            <div
              className='hidden sm:grid gap-4 mb-6 sm:grid-cols-3'
            >
              <Button
                variant={activeRound === 1 ? 'default' : 'outline'}
                className='w-full rounded-xl'
                onClick={() => setActiveRound(1)}
              >
                Round 1
              </Button>
              <Button
                variant={activeRound === 2 ? 'default' : 'outline'}
                className='w-full rounded-xl'
                onClick={() => setActiveRound(2)}
              >
                Round 2
              </Button>
              <Button
                variant={activeRound === 3 ? 'default' : 'outline'}
                className='w-full rounded-xl'
                onClick={() => setActiveRound(3)}
              >
                Final Round
              </Button>
            </div>
            <div>
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className='p-4 text-center'>
                      Loading submission form...
                    </div>
                  }
                >
                  <RoundSubmissionForm
                    roundId={activeRound}
                    category={activeTab}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* Content area */}
        {activeTab === 'registration' && (
          <Card className='rounded-2xl border-dhack-teal/30'>
            <CardHeader>
              <CardTitle className='text-xl'>Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-center font-semibold text-red-300'>
                Registration Closed
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'results' && (
          <Card className='rounded-2xl border-dhack-teal/30'>
            <CardHeader>
              <CardTitle className='text-xl'>Check Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className='p-4 text-center'>
                      Loading results checker...
                    </div>
                  }
                >
                  <ResultsCheck />
                </Suspense>
              </ErrorBoundary>
            </CardContent>
          </Card>
        )}
      </section>
      <Footer />
    </main>
  );
}
