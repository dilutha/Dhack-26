'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TIMELINE } from '../lib/constants';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  MapPin,
} from 'lucide-react';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  event: any;
  dateKey: string;
}

const Timeline = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026
  const [hoveredEvent, setHoveredEvent] = useState<any>(null);

  // Create a map of dates to events for quick lookup
  const eventMap = useMemo(() => {
    const map = new Map();
    TIMELINE.forEach(event => {
      const date = new Date(event.date);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      map.set(dateKey, event);
    });
    return map;
  }, []);

  const getPhaseColor = (phase: string) => {
    const colors = {
      awareness: 'bg-blue-500',
      registration: 'bg-green-500',
      workshops: 'bg-purple-500',
      round1: 'bg-dhack-orange',
      round2: 'bg-red-500',
      judging: 'bg-yellow-500',
      announcement: 'bg-sky-500',
      'semi-final': 'bg-pink-500',
      rebrand: 'bg-rose-500',
      'final-round': 'bg-dhack-teal',
      finale: 'bg-dhack-teal',
    } as Record<string, string>;
    return colors[phase] || 'bg-gray-500';
  };

  const getPhaseIcon = (phase: string) => {
    const icons = {
      awareness: '💡',
      registration: '📝',
      workshops: '🎨',
      round1: '🚀',
      round2: '⚡',
      judging: '⚖️',
      announcement: '📣',
      'semi-final': '🥈',
      rebrand: '🔄',
      'final-round': '🏁',
      finale: '🏆',
    } as Record<string, string>;
    return icons[phase] || '⭐';
  };

  // Get calendar data for current month
  const getCalendarData = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateKey = `${currentDateObj.getFullYear()}-${currentDateObj.getMonth()}-${currentDateObj.getDate()}`;
      const event = eventMap.get(dateKey);
      const isCurrentMonth = currentDateObj.getMonth() === month;

      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth,
        event,
        dateKey,
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const calendarDays = getCalendarData();

  return (
    <section
      id='timeline'
      className='py-20 relative overflow-hidden bg-background'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-6'>
            Event <span className='gradient-text'>Timeline</span>
          </h2>
          <div className='w-24 h-1 bg-gradient-to-r from-dhack-orange to-dhack-teal mx-auto mb-8' />
          <p className='text-lg text-muted-foreground max-w-3xl mx-auto description-text'>
            Mark your calendar! Here&apos;s the complete schedule of
            DHACK 2026 events.
          </p>
        </motion.div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className='lg:col-span-2'
          >
            <div className='bg-gradient-to-br from-muted to-muted/70 backdrop-blur-sm rounded-3xl p-6 border border-border'>
              {/* Calendar Header */}
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center space-x-4'>
                  <div className='text-sm text-muted-foreground'>Month</div>
                  <div className='text-sm text-muted-foreground'>Year</div>
                </div>
                <div className='flex items-center space-x-4'>
                  <button
                    onClick={() => navigateMonth('prev')}
                    className='p-2 hover:bg-muted rounded-lg transition-colors'
                  >
                    <ChevronLeft className='w-5 h-5 text-muted-foreground' />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className='p-2 hover:bg-muted rounded-lg transition-colors'
                  >
                    <ChevronRight className='w-5 h-5 text-muted-foreground' />
                  </button>
                </div>
              </div>

              <div className='flex items-center justify-between mb-8'>
                <div className='flex items-center space-x-6'>
                  <h3 className='text-2xl font-bold text-foreground'>
                    {monthNames[currentDate.getMonth()]}
                  </h3>
                  <span className='text-2xl font-bold text-muted-foreground'>
                    {currentDate.getFullYear()}
                  </span>
                </div>
              </div>

              {/* Day Headers */}
              <div className='grid grid-cols-7 gap-2 mb-4'>
                {dayNames.map(day => (
                  <div
                    key={day}
                    className='text-center text-dhack-orange font-semibold text-sm py-2'
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className='grid grid-cols-7 gap-2'>
                {calendarDays.map((day, index) => {
                  const hasEvent = day.event;
                  return (
                    <motion.div
                      key={index}
                      className={`
                        relative aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-200
                        ${
                          day.isCurrentMonth
                            ? hasEvent
                              ? `${getPhaseColor(
                                  day.event.phase
                                )} text-white font-bold hover:scale-110 hover:shadow-lg`
                              : 'text-foreground hover:bg-muted/50'
                            : 'text-muted-foreground'
                        }
                      `}
                      onMouseEnter={() =>
                        hasEvent && setHoveredEvent(day.event)
                      }
                      onMouseLeave={() => setHoveredEvent(null)}
                      whileHover={hasEvent ? { scale: 1.1 } : {}}
                    >
                      {day.date.getDate()}
                      {hasEvent && (
                        <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full' />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Event Details Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className='space-y-6'
          >
            {/* Current Event Display */}
            <div className='bg-card backdrop-blur-sm rounded-3xl p-6 border border-border'>
              <h3 className='text-xl font-bold text-foreground mb-4 flex items-center'>
                <Calendar className='w-5 h-5 mr-2 text-dhack-orange' />
                {hoveredEvent ? 'EVENT DETAILS' : 'UPCOMING EVENTS'}
              </h3>

              {hoveredEvent ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='space-y-4'
                >
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>
                      {getPhaseIcon(hoveredEvent.phase)}
                    </span>
                    <div>
                      <h4 className='font-bold text-foreground'>
                        {hoveredEvent.title}
                      </h4>
                      <p className='text-dhack-orange font-semibold'>
                        {new Date(hoveredEvent.date).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center text-muted-foreground'>
                    <Clock className='w-4 h-4 mr-2' />
                    <span className='text-sm'>Event Duration: Full Day</span>
                  </div>

                  <div className='flex items-center text-muted-foreground'>
                    <MapPin className='w-4 h-4 mr-2' />
                    <span className='text-sm'>
                      {hoveredEvent.location || 'Online'}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className='space-y-3'>
                  {TIMELINE.slice(0, 6).map(event => (
                    <div
                      key={event.phase + event.date}
                      className='flex items-center space-x-3 p-3 rounded-lg bg-card border border-border hover:bg-muted transition-colors shadow-sm'
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${getPhaseColor(
                          event.phase
                        )}`}
                      />
                      <div className='flex-1'>
                        <p className='text-foreground font-medium text-sm'>
                          {event.title}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className='bg-card backdrop-blur-sm rounded-2xl p-4 border border-border'>
              <h4 className='text-foreground font-semibold mb-3 text-sm'>
                EVENT TYPES
              </h4>
              <div className='space-y-2'>
                {Array.from(new Set(TIMELINE.map(event => event.phase))).map(
                  (phase: string) => (
                    <div key={phase} className='flex items-center space-x-2'>
                      <div
                        className={`w-3 h-3 rounded-full ${getPhaseColor(
                          phase
                        )}`}
                      />
                      <span className='text-muted-foreground text-xs capitalize'>
                        {phase.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
