'use client';

import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

export default function InitialLoader() {
  const [show, setShow] = useState(true);
  const [counter, setCounter] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only show on first visit per tab
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('dhack_seen_loader') === '1') {
      setShow(false);
      return;
    }

    // Capture current ref values for cleanup
    const titleElement = titleRef.current;
    const counterElement = counterRef.current;
    const progressBarElement = progressBarRef.current;
    const containerElement = containerRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('dhack_seen_loader', '1');
        // Fade out the entire loader
        gsap.to(containerElement, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => setShow(false),
        });
      },
    });

    // Animate counter from 0 to 100
    tl.to(
      {},
      {
        duration: 2.5,
        ease: 'power2.out',
        onUpdate: function () {
          const progress = this.progress();
          const currentCount = Math.floor(progress * 100);
          setCounter(currentCount);

          // Update progress bar
          if (progressBarElement) {
            gsap.set(progressBarElement, {
              width: `${progress * 100}%`,
            });
          }
        },
      }
    );

    // Animate title on load
    if (titleElement) {
      gsap.fromTo(
        titleElement,
        {
          opacity: 0,
          y: 30,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'back.out(1.7)',
          delay: 0.2,
        }
      );

      // Add subtle pulsing animation to title
      gsap.to(titleElement, {
        scale: 1.05,
        duration: 1.5,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1,
      });
    }

    // Animate counter on load
    if (counterElement) {
      gsap.fromTo(
        counterElement,
        {
          opacity: 0,
          scale: 0.5,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
          delay: 0.5,
        }
      );
    }

    // Add small delay before starting
    tl.delay(0.3);

    // Cleanup function to kill all animations and prevent memory leaks
    return () => {
      tl.kill();
      gsap.killTweensOf([titleElement, counterElement, progressBarElement]);
      gsap.set([titleElement, counterElement, progressBarElement], {
        clearProps: 'all',
      });
    };
  }, []);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8'
      aria-label="Loading D-Hack'26"
      role='dialog'
      aria-modal='true'
      onClick={e => e.stopPropagation()}
    >
      {/* D-Hack'26 Title */}
      <div ref={titleRef} className='mb-16 text-center'>
        <h1 className='text-4xl md:text-6xl lg:text-7xl font-heading font-bold gradient-text'>
          D-Hack&apos;26
        </h1>
      </div>

      {/* Counter */}
      <div className='flex flex-col items-center space-y-8'>
        <div className='text-center'>
          <span
            ref={counterRef}
            className='text-6xl md:text-8xl lg:text-9xl font-heading font-bold text-dhack-teal'
          >
            {counter}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className='w-64 md:w-80 lg:w-96 h-1 bg-border rounded-full overflow-hidden'>
          <div
            ref={progressBarRef}
            className='h-full bg-gradient-to-r from-dhack-orange to-dhack-teal rounded-full'
            style={{ width: '0%' }}
          />
        </div>

        {/* Loading Text */}
        <p className='text-sm md:text-base font-mono tracking-wider uppercase text-muted-foreground opacity-70'>
          Loading Experience...
        </p>
      </div>
    </div>
  );
}
