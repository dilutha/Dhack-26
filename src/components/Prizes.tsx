'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import gsap from 'gsap';
import { PRIZES } from '@/lib/constants';

const Prizes = () => {
  const totalPool = React.useMemo(() => {
    const sum = PRIZES.reduce(
      (acc, p) => acc + parseInt(p.amount.replace(/,/g, ''), 10),
      0
    );
    return sum.toLocaleString('en-LK');
  }, []);

  const getAmount = (rank: number) =>
    PRIZES.find(p => p.rank === rank)?.amount || '';

  const placeSrc = (rank: 1 | 2 | 3) => {
    const name =
      rank === 1 ? '1st place' : rank === 2 ? '2nd place' : '3rd place';
    return encodeURI(`/places/${name}.png`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  // GSAP rolling number animation for Total Prize Pool
  const totalRef = React.useRef<HTMLDivElement | null>(null);
  const amountRef = React.useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(totalRef, { once: true, margin: '-100px' });

  // Per-place animation refs
  const place1WrapRef = React.useRef<HTMLDivElement | null>(null);
  const place2WrapRef = React.useRef<HTMLDivElement | null>(null);
  const place3WrapRef = React.useRef<HTMLDivElement | null>(null);
  const place1AmountRef = React.useRef<HTMLSpanElement | null>(null);
  const place2AmountRef = React.useRef<HTMLSpanElement | null>(null);
  const place3AmountRef = React.useRef<HTMLSpanElement | null>(null);
  const inViewP1 = useInView(place1WrapRef, { once: true, margin: '-100px' });
  const inViewP2 = useInView(place2WrapRef, { once: true, margin: '-100px' });
  const inViewP3 = useInView(place3WrapRef, { once: true, margin: '-100px' });

  React.useEffect(() => {
    if (!isInView || !amountRef.current) return;
    const target = parseInt(totalPool.replace(/,/g, ''), 10);
    const state = { val: 0 };
    amountRef.current.textContent = '0';
    const tween = gsap.to(state, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        if (amountRef.current) {
          amountRef.current.textContent = Math.round(state.val).toLocaleString(
            'en-LK'
          );
        }
      },
    });
    return () => {
      tween.kill();
    };
  }, [isInView, totalPool]);

  const animatePlace = (
    ref: React.RefObject<HTMLSpanElement>,
    amount: string
  ) => {
    if (!ref.current) return;
    const target = parseInt(amount.replace(/,/g, ''), 10);
    const state = { val: 0 };
    ref.current.textContent = '0';
    const tween = gsap.to(state, {
      val: target,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(state.val).toLocaleString(
            'en-LK'
          );
        }
      },
    });
    return () => {
      tween.kill();
    };
  };

  React.useEffect(() => {
    if (inViewP1) animatePlace(place1AmountRef, getAmount(1));
  }, [inViewP1]);
  React.useEffect(() => {
    if (inViewP2) animatePlace(place2AmountRef, getAmount(2));
  }, [inViewP2]);
  React.useEffect(() => {
    if (inViewP3) animatePlace(place3AmountRef, getAmount(3));
  }, [inViewP3]);

  return (
    <section id='prizes' className='py-16 relative overflow-hidden'>
      <div className='max-w-1200 mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Heading */}
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className='text-center mb-12'
        >
          <h2 className='text-4xl md:text-5xl font-heading font-bold'>
            <span className='gradient-text'>Prizes</span>
          </h2>
          <div className='w-24 h-1 bg-gradient-to-r from-dhack-orange to-dhack-teal mx-auto mt-6' />
        </motion.div>

        {/* Places row: Mobile: 1 - 2 - 3, Desktop: 2 - 1 - 3 */}
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className='flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 md:gap-32 lg:gap-40 mb-12 sm:mb-20'
        >
          {/* 1st (center on desktop, first on mobile) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className='flex flex-col items-center sm:order-2'
            ref={place1WrapRef}
          >
            <div className='relative w-40 h-40 md:w-64 md:h-64 rounded-3xl bg-background/60 overflow-hidden'>
              <Image
                src={placeSrc(1)}
                alt='1st place'
                fill
                className='object-contain p-4'
                sizes='(max-width: 768px) 10rem, 16rem'
              />
            </div>
            <div className='mt-4 text-lg md:text-xl lg:text-2xl font-semibold'>
              <span className='text-muted-foreground'>LKR </span>
              <span className='gradient-text' ref={place1AmountRef}>
                {getAmount(1)}
              </span>
            </div>
          </motion.div>

          {/* 2nd */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className='flex flex-col items-center order-1 sm:order-1'
            ref={place2WrapRef}
          >
            <div className='relative w-28 h-28 md:w-40 md:h-40 rounded-2xl bg-background/60 overflow-hidden'>
              <Image
                src={placeSrc(2)}
                alt='2nd place'
                fill
                className='object-contain p-3'
                sizes='(max-width: 768px) 7rem, 10rem'
              />
            </div>
            <div className='mt-3 md:mt-4 text-lg md:text-xl lg:text-2xl font-semibold'>
              <span className='text-muted-foreground'>LKR </span>
              <span className='gradient-text' ref={place2AmountRef}>
                {getAmount(2)}
              </span>
            </div>
          </motion.div>

          {/* 3rd */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className='flex flex-col items-center order-3'
            ref={place3WrapRef}
          >
            <div className='relative w-24 h-24 md:w-36 md:h-36 rounded-2xl bg-background/60 overflow-hidden'>
              <Image
                src={placeSrc(3)}
                alt='3rd place'
                fill
                className='object-contain p-3'
                sizes='(max-width: 768px) 6rem, 9rem'
              />
            </div>
            <div className='mt-3 md:mt-4 text-lg md:text-xl lg:text-2xl font-semibold'>
              <span className='text-muted-foreground'>LKR </span>
              <span className='gradient-text' ref={place3AmountRef}>
                {getAmount(3)}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Total Prize Pool */}
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={containerVariants}
          className='text-center'
          ref={totalRef}
        >
          <h3 className='text-3xl md:text-4xl lg:text-5xl font-heading font-semibold mb-6'>
            Total <span className='gradient-text'>Prize Pool</span>
          </h3>
          <div className='inline-block rounded-3xl border border-dhack-teal/20 bg-background/60 px-8 py-6 md:px-12 md:py-8'>
            <span className='text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground'>
              LKR{' '}
            </span>
            <span
              ref={amountRef}
              className='text-2xl md:text-3xl lg:text-4xl font-heading font-bold gradient-text'
            >
              0
            </span>
          </div>
        </motion.div>
      </div>

      {/* Background effects */}
      <div className='absolute top-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl' />
      <div className='absolute bottom-0 right-0 w-96 h-96 bg-dhack-teal/5 rounded-full blur-3xl' />
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-dhack-orange/5 rounded-full blur-3xl' />
    </section>
  );
};

export default Prizes;
