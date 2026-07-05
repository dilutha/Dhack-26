'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Reusable Eye component (no per-eye animation; uses CSS variable for exact sync)
const Eye = ({ rotation, start }: { rotation: number; start: number }) => (
  <div className='eye'>
    <div className='eye__orbit' style={{ ['--rot' as any]: `${rotation}deg` }}>
      {/* pass start angle via CSS variable */}
      <div
        className='eye__pupil'
        style={{ ['--start' as any]: `${start}deg` }}
      />
    </div>
  </div>
);

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(true); // keep behavior
  const [isHovering, setIsHovering] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      ticking.current = false;
      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;

      setScrollProgress(prev => (prev !== progress ? progress : prev));
      const nextVisible = scrollTop > 50;
      setIsVisible(prev => (prev !== nextVisible ? nextVisible : prev));
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll as any);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const eyeRotation = scrollProgress * 360; // shared rotation for both eyes

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id='back-to-top'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-50 cursor-pointer w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-white dark:bg-gradient-to-br dark:from-[#0b1220] dark:via-[#101a2b] dark:to-[#0b1220] border-2 border-black dark:border-white shadow-lg flex items-center justify-center'
          onClick={scrollToTop}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
          onTouchStart={() => setIsHovering(true)}
          onTouchEnd={() => setIsHovering(false)}
        >
          <div className='relative z-10 flex gap-2'>
            {/* Duplicate the same Eye component for both sides to avoid mismatch */}
            <Eye rotation={eyeRotation} start={21} />
            <Eye rotation={eyeRotation} start={21} />
          </div>

          {/* Mouth: smile (default) -> 'O' on hover */}
          {isHovering ? (
            <svg
              className='absolute z-0 bottom-1 sm:bottom-1.5 lg:bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 pointer-events-none text-black dark:text-white'
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <circle
                cx='12'
                cy='14'
                r='3.6'
                stroke='currentColor'
                strokeWidth='2.2'
                fill='none'
              />
            </svg>
          ) : (
            <svg
              className='absolute z-0 bottom-1 sm:bottom-1.5 lg:bottom-2 left-1/2 -translate-x-1/2 w-6 h-3 sm:w-7 sm:h-3.5 lg:w-8 lg:h-4 pointer-events-none text-black dark:text-white'
              viewBox='0 0 20 10'
              aria-hidden='true'
            >
              <path
                d='M3 6 C 7 11, 13 11, 17 6'
                stroke='currentColor'
                strokeWidth='1.2'
                fill='none'
                strokeLinecap='round'
              />
              <path
                d='M4 6 C 7 9.5, 13 9.5, 16 6'
                stroke='currentColor'
                strokeWidth='0.6'
                fill='none'
                strokeLinecap='round'
              />
            </svg>
          )}

          <style jsx>{`
            :global(.eye) {
              width: 1rem;
              height: 1rem;
              background: white;
              border: solid 0.08rem rgba(0, 0, 0, 0.25);
              border-radius: 100%;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
              overflow: hidden;
              will-change: transform;
            }

            @media (min-width: 640px) {
              :global(.eye) {
                width: 1.2rem;
                height: 1.2rem;
                border-width: 0.1rem;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
              }
            }

            @media (min-width: 1024px) {
              :global(.eye) {
                width: 1.35rem;
                height: 1.35rem;
                border-width: 0.12rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
              }
            }

            /* Light mode: invert eyes (black eye, white pupil) */
            :global(html:not(.dark) .eye) {
              background: #000;
              border-color: rgba(255, 255, 255, 0.7);
            }

            /* Rotates around the eye center */
            :global(.eye__orbit) {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 0;
              height: 0;
              transform: translate(-50%, -50%) rotate(var(--rot, 0deg));
              will-change: transform;
            }

            /* The pupil sits offset from center, the orbit rotates it */
            :global(.eye__pupil) {
              width: 0.3rem;
              height: 0.3rem;
              background: #000;
              border-radius: 100%;
              transform: translate(-50%, -50%) rotate(var(--start, 0deg))
                translateY(-0.28rem);
              position: absolute;
              will-change: transform;
            }

            @media (min-width: 640px) {
              :global(.eye__pupil) {
                width: 0.36rem;
                height: 0.36rem;
                transform: translate(-50%, -50%) rotate(var(--start, 0deg))
                  translateY(-0.32rem);
              }
            }

            @media (min-width: 1024px) {
              :global(.eye__pupil) {
                width: 0.42rem;
                height: 0.42rem;
                transform: translate(-50%, -50%) rotate(var(--start, 0deg))
                  translateY(-0.38rem);
              }
            }

            /* Light mode pupil: white */
            :global(html:not(.dark) .eye__pupil) {
              background: #ffffff;
            }

            :global(.eye__pupil::after) {
              content: '';
              width: 0.14rem;
              height: 0.14rem;
              background: white;
              border-radius: 100%;
              position: absolute;
              top: 20%;
              left: 20%;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
