'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Clock, Flag, Sparkles } from 'lucide-react';
import { DHACK_2026_EVENTS } from '@/lib/dhack2026';
import { HackEvent } from '@/lib/eventUtils';

const TimelineWithEvents: React.FC = () => {
  const fallbackEvents = DHACK_2026_EVENTS as unknown as (HackEvent & {
    displayDate?: string;
  })[];
  const [events, setEvents] = useState(fallbackEvents);
  const icons = [CalendarDays, Clock, Flag, CheckCircle2, Sparkles, Sparkles];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' });
        const json = await res.json();
        if (mounted && Array.isArray(json?.data) && json.data.length > 0) {
          setEvents(json.data);
        }
      } catch {
        if (mounted) setEvents(fallbackEvents);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      id='timeline'
      className='py-20 relative overflow-hidden bg-background'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-heading font-bold mb-6'>
            Event <span className='gradient-text'>Timeline</span>
          </h2>
          <div className='w-24 h-1 bg-gradient-to-r from-dhack-orange to-dhack-teal mx-auto mb-8' />
          <p className='text-lg text-muted-foreground max-w-3xl mx-auto description-text'>
            Mark your calendar for the official DHACK&apos;26 schedule.
          </p>
        </motion.div>

        <div className='relative mx-auto max-w-5xl'>
          <div className='absolute left-5 top-4 bottom-4 w-px bg-gradient-to-b from-dhack-orange via-dhack-teal to-dhack-accent md:left-1/2 md:-translate-x-1/2' />

          <div className='space-y-8'>
            {events.map((event, index) => {
              const Icon = icons[index] || CalendarDays;
              const isRebrand = event.category === 'rebrand';
              const markerSide =
                index % 2 === 0
                  ? 'md:right-[-4.35rem]'
                  : 'md:left-[-4.35rem]';
              const markerRingSide =
                index % 2 === 0
                  ? 'md:right-[-4.55rem]'
                  : 'md:left-[-4.55rem]';

              return (
                <motion.article
                  key={event.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className={`relative pl-14 md:grid md:grid-cols-2 md:gap-12 md:pl-0 ${
                    index % 2 === 0 ? '' : 'md:[&>div:first-child]:col-start-2'
                  }`}
                >
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`group relative rounded-lg border p-5 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                      isRebrand
                        ? 'border-dhack-accent/40 bg-dhack-accent/10 hover:border-dhack-accent'
                        : 'border-dhack-teal/30 bg-background/80 hover:border-dhack-orange/70'
                    }`}
                  >
                    <div
                      className={`absolute -left-[2.85rem] top-5 flex h-10 w-10 items-center justify-center rounded-full border border-dhack-teal/40 bg-background text-dhack-teal shadow-lg md:left-auto ${markerRingSide}`}
                    />
                    <div
                      className={`absolute -left-[2.65rem] top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-dhack-orange to-dhack-teal text-white shadow-lg md:left-auto ${markerSide}`}
                    >
                      <Icon className='h-4 w-4' aria-hidden='true' />
                    </div>

                    <div className='mb-4 flex items-center justify-between gap-4'>
                      <span className='rounded-md border border-dhack-orange/30 bg-dhack-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-dhack-orange'>
                        {event.displayDate}
                      </span>
                      <span className='text-xs font-medium text-muted-foreground'>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className='text-xl font-heading font-semibold text-foreground'>
                      {event.name}
                    </h3>
                    <p className='mt-3 text-sm leading-6 text-muted-foreground'>
                      {event.description}
                    </p>
                  </motion.div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineWithEvents;
