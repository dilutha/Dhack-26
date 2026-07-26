'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Clock, Flag, Sparkles } from 'lucide-react';
import { DHACK_2026_EVENTS } from '@/lib/dhack2026';
import { HackEvent } from '@/lib/eventUtils';

const fallbackEvents = DHACK_2026_EVENTS as unknown as (HackEvent & {
  displayDate?: string;
})[];

const TimelineWithEvents: React.FC = () => {
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
          {/* Vertical center line */}
          <div className='absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-dhack-orange via-dhack-teal to-dhack-accent md:left-1/2 md:-translate-x-1/2' />

          <div className='space-y-10'>
            {events.map((event, index) => {
              const Icon = icons[index] || CalendarDays;
              const isRebrand = event.category === 'rebrand';
              const isEven = index % 2 === 0;
              const now = Date.now();
              const start = new Date(event.start_at).getTime();
              const end = new Date(event.end_at).getTime();
              const state =
                now > end ? 'Completed' : now >= start ? 'Active' : 'Upcoming';
              const isActive = state === 'Active';

              return (
                <motion.article
                  key={event.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className='relative flex items-start pl-14 md:pl-0'
                >
                  {/* Icon marker — centered on the vertical line */}
                  <div className='absolute left-5 top-5 z-10 -translate-x-1/2 md:left-1/2'>
                    {/* Ring */}
                    <div className='absolute inset-0 -m-1 rounded-full border border-dhack-teal/40 bg-background shadow-lg' />
                    {/* Icon circle */}
                    <div className='relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-dhack-orange to-dhack-teal text-white shadow-lg'>
                      <Icon className='h-4 w-4' aria-hidden='true' />
                    </div>
                  </div>

                  {/* Card — alternates left/right on desktop */}
                  <div
                    className={`w-full md:w-[calc(50%-2.5rem)] ${
                      isEven ? 'md:mr-auto md:pr-4' : 'md:ml-auto md:pl-4'
                    }`}
                  >
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      className={`group rounded-lg border p-5 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                        isRebrand
                          ? 'border-dhack-accent/40 bg-dhack-accent/10 hover:border-dhack-accent'
                          : 'border-dhack-teal/30 bg-background/80 hover:border-dhack-orange/70'
                      }`}
                    >
                      <div className='mb-4 flex items-center justify-between gap-4'>
                        <span className='rounded-md border border-dhack-orange/30 bg-dhack-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-dhack-orange'>
                          {event.displayDate}
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            isActive
                              ? 'bg-dhack-teal/15 text-dhack-teal'
                              : state === 'Completed'
                                ? 'bg-green-500/10 text-green-300'
                                : 'bg-muted/20 text-muted-foreground'
                          }`}
                        >
                          {state}
                        </span>
                      </div>
                      <h3 className='text-xl font-heading font-semibold text-foreground'>
                        {event.name}
                      </h3>
                      <p className='mt-3 text-sm leading-6 text-muted-foreground'>
                        {event.description}
                      </p>
                    </motion.div>
                  </div>
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
