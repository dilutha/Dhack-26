'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HackEvent,
  compareByStartThenEnd,
  formatDateRange,
  getStatusBadge,
  EventCategory,
} from '../lib/eventUtils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  MapPin,
  Lightbulb,
  FileText,
  Palette,
  Rocket,
  Zap,
  Trophy,
  Users,
  GraduationCap,
} from 'lucide-react';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: HackEvent[];
  dateKey: string;
}

interface TabbedCalendarProps {
  events: HackEvent[];
}

const TabbedCalendar: React.FC<TabbedCalendarProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<'innovation' | 'rebrand'>(
    'innovation'
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState<HackEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<
    HackEvent[] | null
  >(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarHeight, setCalendarHeight] = useState<number>(0);

  // Intersection Observer hooks for animations
  const { elementRef: headerRef } = useIntersectionObserver({ threshold: 0.1 });
  const { elementRef: calendarAnimRef } = useIntersectionObserver({
    threshold: 0.1,
  });
  const { elementRef: eventPanelRef } = useIntersectionObserver({
    threshold: 0.1,
  });

  // Filter events by active category
  const filteredEvents = useMemo(() => {
    return events.filter(event => event.category === activeTab);
  }, [events, activeTab]);

  useEffect(() => {
    const updateHeight = () => {
      if (calendarRef.current) {
        setCalendarHeight(calendarRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [currentDate, activeTab]);

  // Map events by day (start dates only)
  const eventMap = useMemo(() => {
    const map = new Map<string, HackEvent[]>();
    for (const e of filteredEvents) {
      // Map the event only to its start date
      const start = new Date(e.start_at);
      const key = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
      const arr = map.get(key) || [];
      arr.push(e);
      map.set(key, arr);
    }
    return map;
  }, [filteredEvents]);

  // Color/icon helpers by event type
  const getTypeBgColor = (type: string) => {
    const colors: Record<string, string> = {
      registration: 'bg-green-600',
      proposal: 'bg-orange-500',
      wireframe: 'bg-purple-600',
      final: 'bg-teal-600',
      judging: 'bg-yellow-500',
      ceremony: 'bg-pink-600',
      workshop: 'bg-blue-600',
      awareness: 'bg-sky-600',
      announcement: 'bg-rose-500',
      meeting: 'bg-indigo-500',
      other: 'bg-gray-600',
    };
    return colors[type] || 'bg-gray-600';
  };

  const getTypeTextColor = (type: string) => {
    const colors: Record<string, string> = {
      registration: 'text-green-400',
      proposal: 'text-orange-400',
      wireframe: 'text-purple-400',
      final: 'text-teal-400',
      judging: 'text-yellow-400',
      ceremony: 'text-pink-400',
      workshop: 'text-blue-400',
      awareness: 'text-sky-400',
      announcement: 'text-rose-400',
      meeting: 'text-indigo-400',
      other: 'text-gray-400',
    };
    return colors[type] || 'text-gray-400';
  };

  const getTypeIcon = (type: string) => {
    const iconProps = 'w-4 h-4';
    const icons: Record<string, React.ReactNode> = {
      awareness: <Lightbulb className={iconProps} />,
      registration: <FileText className={iconProps} />,
      workshop: <Palette className={iconProps} />,
      proposal: <Rocket className={iconProps} />,
      wireframe: <Zap className={iconProps} />,
      judging: <Calendar className={iconProps} />,
      announcement: <Calendar className={iconProps} />,
      meeting: <Calendar className={iconProps} />,
      final: <Trophy className={iconProps} />,
      ceremony: <Trophy className={iconProps} />,
      other: <Calendar className={iconProps} />,
    };
    return icons[type] || <Calendar className={iconProps} />;
  };

  const statusBadgeClass = (status: 'open' | 'upcoming' | 'closed') => {
    if (status === 'open')
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300';
    if (status === 'upcoming')
      return 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300';
    return 'bg-gray-200 text-gray-800 dark:bg-gray-700/40 dark:text-gray-200';
  };

  // Get calendar data for current month
  const getCalendarData = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateKey = `${currentDateObj.getFullYear()}-${currentDateObj.getMonth()}-${currentDateObj.getDate()}`;
      const eventsOnDay = eventMap.get(dateKey) || [];
      const isCurrentMonth = currentDateObj.getMonth() === month;

      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth,
        events: eventsOnDay,
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

  const tabs = [
    {
      id: 'innovation' as const,
      label: 'Innovation',
      icon: <Lightbulb className='w-4 h-4' />,
    },
    {
      id: 'rebrand' as const,
      label: 'ReBrand',
      icon: <Palette className='w-4 h-4' />,
    },
  ];

  return (
    <section
      id='timeline'
      className='py-20 relative overflow-hidden bg-background'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div ref={headerRef} className='text-center mb-16 animate-on-scroll'>
          <h2 className='text-4xl md:text-5xl font-heading font-bold mb-6'>
            Event <span className='gradient-text'>Timeline</span>
          </h2>
          <div className='w-24 h-1 bg-gradient-to-r from-dhack-orange to-dhack-teal mx-auto mb-8' />
          <p className='text-lg text-muted-foreground max-w-3xl mx-auto description-text'>
            Mark your calendar! Here&apos;s the complete schedule of
            DHACK 2026 events.
          </p>
        </div>

        <div className='flex flex-col lg:flex-row justify-center items-start gap-6 lg:gap-8 max-w-6xl mx-auto'>
          {/* Calendar Container */}
          <div
            ref={calendarAnimRef}
            className='flex-shrink-0 w-full lg:w-auto flex justify-center animate-on-scroll'
          >
            <div
              ref={calendarRef}
              className='bg-gradient-to-br from-muted to-muted/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 border border-border w-full max-w-lg lg:w-[36rem]'
              id='calendar-container'
            >
              {/* Tab Navigation */}
              <div className='flex mb-6 bg-muted/50 rounded-lg p-1'>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* BIS Exclusive Message for ReBrand */}
              {activeTab === 'rebrand' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='mb-6 p-4 bg-gradient-to-r from-dhack-teal/10 to-dhack-orange/10 border border-dhack-teal/20 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex-shrink-0'>
                      <GraduationCap className='w-5 h-5 text-dhack-teal' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-foreground'>
                        Exclusive for BIS Students at USJ
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        This category is specifically designed for Bachelor of
                        Science in Business Information Systems students
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Calendar Header */}
              <div className='flex items-center justify-between mb-4 sm:mb-6'>
                <div className='flex items-center space-x-2 sm:space-x-3'>
                  <div className='text-sm sm:text-base text-muted-foreground'>
                    Month
                  </div>
                  <div className='text-sm sm:text-base text-muted-foreground'>
                    Year
                  </div>
                </div>
                <div className='flex items-center space-x-1 sm:space-x-3'>
                  <button
                    onClick={() => navigateMonth('prev')}
                    className='p-2 sm:p-3 hover:bg-muted rounded-lg transition-colors'
                  >
                    <ChevronLeft className='w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className='p-2 sm:p-3 hover:bg-muted rounded-lg transition-colors'
                  >
                    <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
                  </button>
                </div>
              </div>

              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center space-x-2 sm:space-x-4'>
                  <h3 className='text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground'>
                    {monthNames[currentDate.getMonth()]}
                  </h3>
                  <span className='text-xl sm:text-2xl md:text-3xl font-heading font-bold text-muted-foreground'>
                    {currentDate.getFullYear()}
                  </span>
                </div>
              </div>

              {/* Day Headers */}
              <div className='grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 mb-4'>
                {dayNames.map(day => (
                  <div
                    key={day}
                    className='text-center text-dhack-orange font-semibold text-xs sm:text-sm md:text-base py-1 sm:py-2'
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className='grid grid-cols-7 gap-1 sm:gap-2 md:gap-3'>
                {calendarDays.map((day, index) => {
                  const hasEvent = day.events && day.events.length > 0;
                  const isCurrentMonth = day.isCurrentMonth;

                  return (
                    <div
                      key={index}
                      className={`
                        relative aspect-square flex items-center justify-center text-sm sm:text-base md:text-lg rounded-lg cursor-pointer transition-all duration-200
                        ${
                          isCurrentMonth
                            ? 'text-foreground hover:bg-muted/50 hover:scale-[1.05]'
                            : ''
                        }
                      `}
                      onMouseEnter={() => {
                        if (hasEvent && isCurrentMonth) {
                          const sorted = [...day.events].sort(
                            compareByStartThenEnd
                          );
                          setSelectedDayEvents(sorted);
                          setSelectedDay(day.date);
                          setHoveredEvent(null);
                        }
                      }}
                      onMouseLeave={() => setHoveredEvent(null)}
                      onClick={() => {
                        if (!isCurrentMonth) return;
                        if (hasEvent) {
                          const sorted = [...day.events].sort(
                            compareByStartThenEnd
                          );
                          setSelectedDayEvents(sorted);
                          setSelectedDay(day.date);
                        } else {
                          setSelectedDayEvents(null);
                          setSelectedDay(null);
                        }
                      }}
                    >
                      {isCurrentMonth && (
                        <>
                          {hasEvent ? (
                            <div className='w-full h-full flex items-center justify-center'>
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base shadow-lg ${getTypeBgColor(
                                  day.events[0].type
                                )}`}
                              >
                                {day.date.getDate()}
                              </div>
                            </div>
                          ) : (
                            day.date.getDate()
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Event Details Panel */}
          <div
            ref={eventPanelRef}
            className='flex-shrink-0 w-full lg:w-auto mt-6 lg:mt-0 animate-on-scroll'
          >
            {/* Current Event Display */}
            <div
              className='bg-foreground/10 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-foreground/20 w-full lg:w-[28rem] flex flex-col mx-auto lg:mx-0'
              style={{ height: calendarHeight || 'auto', minHeight: '300px' }}
            >
              <h3 className='text-lg md:text-xl font-heading font-bold text-foreground mb-4 flex items-center'>
                <Calendar className='w-5 h-5 mr-3 text-dhack-orange' />
                {hoveredEvent ? 'EVENT DETAILS' : 'UPCOMING EVENTS'}
              </h3>

              <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent pr-1'>
                {selectedDayEvents ? (
                  <div className='space-y-3 animate-fade-in-up'>
                    <div className='mb-2 text-sm text-muted-foreground'>
                      {selectedDay
                        ? selectedDay.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : ''}
                    </div>
                    {selectedDayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className='flex items-center space-x-4 p-3 rounded-lg bg-muted border border-border'
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${getTypeBgColor(ev.type)}`}
                        />
                        <div className='flex-1'>
                          <p className='font-medium text-base text-foreground'>
                            {ev.name}
                          </p>
                          <p className='text-muted-foreground text-sm md:text-base'>
                            {formatDateRange(ev.start_at, ev.end_at)}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium capitalize ${statusBadgeClass(
                            getStatusBadge(new Date(), ev).label as any
                          )}`}
                        >
                          {getStatusBadge(new Date(), ev).label}
                        </span>
                      </div>
                    ))}
                    <div className='pt-2'>
                      <button
                        className='text-xs text-dhack-orange underline'
                        onClick={() => {
                          setSelectedDayEvents(null);
                          setSelectedDay(null);
                        }}
                      >
                        Clear selection
                      </button>
                    </div>
                  </div>
                ) : hoveredEvent ? (
                  <div className='space-y-4 animate-fade-in-up'>
                    <div className='flex items-center space-x-3'>
                      <div className={getTypeTextColor(hoveredEvent.type)}>
                        {getTypeIcon(hoveredEvent.type)}
                      </div>
                      <div>
                        <h4 className={`font-bold text-base text-foreground`}>
                          {hoveredEvent.name}
                        </h4>
                        <p className='font-medium text-base text-muted-foreground'>
                          {formatDateRange(
                            hoveredEvent.start_at,
                            hoveredEvent.end_at
                          )}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center text-muted-foreground'>
                      <Clock className='w-4 h-4 mr-3' />
                      <span className='text-base capitalize'>
                        {getStatusBadge(new Date(), hoveredEvent).label}
                      </span>
                    </div>

                    <div className='flex items-center text-muted-foreground'>
                      <MapPin className='w-4 h-4 mr-3' />
                      <span className='text-base'>Online</span>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {[...filteredEvents]
                      .sort(compareByStartThenEnd)
                      .map((event, index) => (
                        <div
                          key={index}
                          className='flex items-center space-x-4 p-3 rounded-lg bg-muted border border-border hover:bg-muted/70 transition-colors'
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${getTypeBgColor(event.type)}`}
                          />
                          <div className='flex-1'>
                            <p className='font-medium text-base text-foreground'>
                              {event.name}
                            </p>
                            <p className='text-muted-foreground text-sm md:text-base'>
                              {formatDateRange(event.start_at, event.end_at)}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium capitalize ${statusBadgeClass(
                              getStatusBadge(new Date(), event).label as any
                            )}`}
                          >
                            {getStatusBadge(new Date(), event).label}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TabbedCalendar;
