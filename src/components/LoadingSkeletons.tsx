'use client';

import { Skeleton } from '@/components/ui/skeleton';

// Gallery Loading Skeleton
export const GallerySkeleton = () => {
  return (
    <div className='flex space-x-4 overflow-hidden p-4'>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className='flex-shrink-0'>
          <Skeleton className='h-48 w-64 rounded-lg' />
        </div>
      ))}
    </div>
  );
};

// Hero Loading Skeleton
export const HeroSkeleton = () => {
  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center space-y-8 p-8'>
      <Skeleton className='h-16 w-96 rounded-lg' />
      <Skeleton className='h-8 w-64 rounded-lg' />
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-8'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-24 w-24 rounded-lg' />
        ))}
      </div>
      <Skeleton className='h-12 w-32 rounded-lg' />
    </div>
  );
};

// Form Loading Skeleton
export const FormSkeleton = () => {
  return (
    <div className='max-w-2xl mx-auto p-6 space-y-6'>
      <Skeleton className='h-8 w-48 rounded-lg' />
      <div className='space-y-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-24 rounded' />
            <Skeleton className='h-10 w-full rounded-lg' />
          </div>
        ))}
      </div>
      <Skeleton className='h-12 w-32 rounded-lg' />
    </div>
  );
};

// Timeline Loading Skeleton
export const TimelineSkeleton = () => {
  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Skeleton className='h-8 w-64 mx-auto mb-8 rounded-lg' />
      <div className='space-y-8'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='flex items-center space-x-4'>
            <Skeleton className='h-12 w-12 rounded-full flex-shrink-0' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-6 w-32 rounded' />
              <Skeleton className='h-4 w-48 rounded' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Card Loading Skeleton
export const CardSkeleton = () => {
  return (
    <div className='p-6 space-y-4'>
      <Skeleton className='h-6 w-32 rounded' />
      <Skeleton className='h-4 w-full rounded' />
      <Skeleton className='h-4 w-3/4 rounded' />
      <Skeleton className='h-10 w-24 rounded-lg' />
    </div>
  );
};
