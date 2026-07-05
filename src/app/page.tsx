'use client';

import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import About from '@/components/About';
import Categories from '@/components/Categories';
import RegistrationSection from '@/components/RegistrationSection';
import TimelineWithEvents from '@/components/TimelineWithEvents';
import Prizes from '@/components/Prizes';
import Workshops from '@/components/Workshops';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { HeroSkeleton, GallerySkeleton } from '@/components/LoadingSkeletons';
import { usePerformance } from '@/hooks/usePerformance';
import { logger } from '@/lib/logger';

// Lazy load heavy components for better performance
const LazyHero = dynamic(() => import('@/components/Hero'), {
  loading: () => <HeroSkeleton />,
  ssr: false, // Disable SSR for 3D components
});

const LazyGallery = dynamic(() => import('@/components/Gallery'), {
  loading: () => <GallerySkeleton />,
  ssr: false, // Disable SSR for heavy image components
});

// Loading component for better UX
const LoadingSpinner = () => <HeroSkeleton />;

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use the logger for error tracking
    logger.error('React Error Boundary', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent:
        typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='min-h-screen bg-dhack-base flex items-center justify-center'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-dhack-teal mb-4'>
                Oops! Something went wrong
              </h2>
              <p className='text-muted-foreground mb-6'>
                We&apos;re experiencing technical difficulties. Please refresh
                the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className='px-6 py-3 bg-gradient-to-r from-dhack-orange to-dhack-teal text-white rounded-lg font-medium hover:shadow-lg transition-shadow duration-300'
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default function Home() {
  // Initialize performance monitoring
  usePerformance();

  return (
    <ErrorBoundary>
      <main
        className='min-h-screen bg-dhack-base text-foreground overflow-x-hidden max-w-full'
        role='main'
        aria-label="DHACK'26 Website"
      >
        {/* Skip to content link for accessibility */}
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-dhack-teal text-white px-4 py-2 rounded-lg z-50'
          aria-label='Skip to main content'
        >
          Skip to main content
        </a>

        {/* Fixed Navigation */}
        <Navbar />

        {/* Hero Section with 3D Background */}
        <section id='main-content' aria-label='Hero section'>
          <LazyHero />
        </section>

        {/* About Section with SDG Values */}
        <section id='about' aria-label="About DHACK'26">
          <About />
        </section>

        <Categories />

        <RegistrationSection />

        {/* Interactive Timeline */}
        <section id='timeline' aria-label='Event timeline'>
          <TimelineWithEvents />
        </section>

        <Workshops />

        {/* Prizes Section */}
        <section id='prizes' aria-label='Competition prizes'>
          <Prizes />
        </section>

        {/* Gallery with Horizontal Scroll */}
        <section id='gallery' aria-label='Event gallery'>
          <LazyGallery />
        </section>

        {/* FAQ Accordion */}
        <section id='faq' aria-label='Frequently asked questions'>
          <FAQ />
        </section>

        {/* Contact Section */}
        <section id='contact' aria-label='Contact information'>
          <Contact />
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </ErrorBoundary>
  );
}
