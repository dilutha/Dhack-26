'use client';

import React from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { DHACK_2026_MISSION, WHATSAPP_COMMUNITY_URL } from '@/lib/dhack2026';

const About = () => {
  const { elementRef: missionRef } = useIntersectionObserver({
    threshold: 0.1,
  });
  const { elementRef: competitionRef } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <section id='about' className='py-16 relative overflow-x-hidden'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Mobile: About DHack Section First */}
        <div className='block lg:hidden mb-8'>
          <div ref={competitionRef} className='relative z-10'>
            <div className='animate-fade-in-up-delay-300 relative z-10'>
              <h3 className='font-heading text-2xl sm:text-3xl font-bold mb-4 text-center'>
                About <span className='gradient-text'>DHack</span>
              </h3>
              <p className='text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl description-text text-justify mx-auto mb-6'>
                DHACK&apos;26 is a multi-category innovation challenge for
                university teams, school students, and ReBrand participants.
                Build AI-assisted, sustainable digital solutions through
                creative collaboration and human-centered design.
              </p>

              <div className='flex flex-col items-center gap-4 relative z-30'>
                <a
                  href={WHATSAPP_COMMUNITY_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full px-6 py-3 rounded-xl bg-dhack-teal/80 hover:bg-dhack-teal text-white transition-colors font-mono tracking-wide text-center relative z-30 mobile-touch-button'
                >
                  Join Community Group
                </a>
                <a
                  href='https://drive.google.com/drive/folders/1XqcSoQPnSrH9Mz_U_3V0UfKtrdXsdoMe?usp=sharing'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full px-6 py-3 rounded-xl bg-muted text-foreground border border-border shadow-sm tech-label text-center hover:bg-muted/80 transition-colors relative z-30 mobile-touch-button'
                >
                  Download Guidelines
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Mission Section Second */}
        <div className='block lg:hidden mb-8'>
          <div ref={missionRef} className='relative'>
            <div className='text-center mb-4'>
              <span className='font-mono text-2xl sm:text-3xl font-bold'>
                <span className='gradient-text'>MISSION</span>
              </span>
            </div>
            <p className='text-base sm:text-lg text-muted-foreground leading-relaxed text-justify max-w-3xl mx-auto'>
              {DHACK_2026_MISSION}
            </p>
          </div>
        </div>

        {/* Desktop: Original Layout */}
        <div className='hidden lg:block'>
          {/* Mission Section */}
          <div ref={missionRef} className='relative mb-8 animate-on-scroll'>
            <div className='flex flex-col lg:flex-row items-end'>
              <div className='flex-1 animate-fade-in-up-delay-200'>
                <p className='text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed text-justify sm:text-justify lg:text-right max-w-2xl mx-auto lg:ml-auto lg:mr-0'>
                  {DHACK_2026_MISSION}
                </p>
              </div>
              <div className='relative z-10 flex-shrink-0 mt-6 lg:mt-0 lg:-ml-10 animate-fade-in-left-delay-400'>
                {/* Desktop Mission Heading - unchanged */}
                <div className='rotate-90 origin-center lg:-translate-y-2 xl:-translate-y-3'>
                  <span className='font-mono text-4xl md:text-5xl font-bold whitespace-nowrap'>
                    <span className='gradient-text'>MISSION</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Arrow Decoration (moved inside and absolutely positioned) */}
            <Image
              src='/assests/arrow.png'
              alt='Arrow pointing to About DHack'
              width={100}
              height={80}
              className='pointer-events-none absolute z-20 right-32 sm:right-48 md:right-64 -bottom-16 sm:-bottom-24 md:-bottom-28 w-16 h-auto sm:w-20 md:w-28 opacity-100 dark:opacity-80 scale-x-[-1] invert dark:invert-0 brightness-125 contrast-125 drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)]'
            />
          </div>

          {/* The Competition Section */}
          <div ref={competitionRef} className='relative animate-on-scroll'>
            <div className='animate-fade-in-up-delay-300'>
              <h3 className='font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-center sm:text-left'>
                About <span className='gradient-text'>DHack</span>
              </h3>
              <p className='text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl description-text text-justify sm:text-justify lg:text-left mx-auto lg:mx-0'>
                DHACK&apos;26 brings together Inter-University, InterSchool,
                and ReBrand competitors to solve real-world challenges with AI,
                sustainability goals, and thoughtful digital product design.
              </p>

              <div className='mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-6'>
                <a
                  href={WHATSAPP_COMMUNITY_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl bg-dhack-teal/80 hover:bg-dhack-teal text-white transition-colors font-mono tracking-wide text-center'
                >
                  Join Community Group

                </a>
                <a
                  href='https://drive.google.com/drive/folders/1XqcSoQPnSrH9Mz_U_3V0UfKtrdXsdoMe?usp=sharing'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl bg-muted text-foreground border border-border shadow-sm tech-label text-center hover:bg-muted/80 transition-colors'
                >
                  Download Guidelines
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className='absolute top-1/2 left-0 w-64 h-64 bg-dhack-orange/5 rounded-full blur-3xl -translate-y-1/2 -z-10 pointer-events-none' />
      <div className='absolute bottom-0 right-0 w-64 h-64 bg-dhack-teal/5 rounded-full blur-3xl -z-10 pointer-events-none' />
    </section>
  );
};

export default About;
