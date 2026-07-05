'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { COMPETITIONS } from '@/lib/dhack2026';

const RegistrationForm = dynamic(
  () => import('@/components/forms/RegistrationForm'),
  {
    ssr: false,
    loading: () => (
      <div className='rounded-lg border border-dhack-teal/20 p-6 text-center text-muted-foreground'>
        Loading registration form...
      </div>
    ),
  }
);

export default function RegistrationPage() {
  return (
    <main className='min-h-screen bg-dhack-base text-foreground'>
      <Navbar />
      <section className='relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='mb-10 text-center'>
            <p className='mb-3 text-sm font-semibold uppercase tracking-wide text-dhack-orange'>
              Official Registration
            </p>
            <h1 className='text-4xl md:text-5xl font-heading font-bold'>
              DHACK&apos;26 <span className='gradient-text'>Registration</span>
            </h1>
            <p className='mx-auto mt-5 max-w-3xl text-muted-foreground leading-7'>
              Register your team for Inter-University, InterSchool, or ReBrand
              Hackathon using the competition-specific flow below.
            </p>
          </div>

          <div className='mb-8 grid gap-4 md:grid-cols-3'>
            {Object.values(COMPETITIONS).map(competition => (
              <div
                key={competition.id}
                className='rounded-lg border border-dhack-teal/25 bg-background/70 p-4'
              >
                <h2 className='font-heading text-lg font-semibold'>
                  {competition.title}
                </h2>
                <p className='mt-2 text-sm text-muted-foreground'>
                  {competition.exactMembers
                    ? `Exactly ${competition.exactMembers} members`
                    : `${competition.minMembers}-${competition.maxMembers} members`}
                </p>
              </div>
            ))}
          </div>

          <RegistrationForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
