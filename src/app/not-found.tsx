'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4'>
      <div className='max-w-2xl mx-auto text-center'>
        {/* Robotic Animation */}
        <div className='mb-8 relative'>
          <div className='w-32 h-32 mx-auto relative'>
            {/* Robot Head */}
            <div className='w-24 h-24 bg-gray-800 border-2 border-blue-500 rounded-lg mx-auto relative animate-pulse'>
              {/* Eyes */}
              <div className='absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full animate-ping'></div>
              <div
                className='absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full animate-ping'
                style={{ animationDelay: '0.5s' }}
              ></div>
              {/* Mouth */}
              <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-400 rounded'></div>
            </div>
            {/* Robot Body */}
            <div className='w-20 h-16 bg-gray-700 border border-blue-500 rounded-b-lg mx-auto -mt-2 relative'>
              {/* Chest Panel */}
              <div className='absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-blue-600 rounded animate-pulse'></div>
            </div>
            {/* Arms */}
            <div className='absolute -left-4 top-8 w-4 h-12 bg-gray-700 border border-blue-500 rounded animate-bounce'></div>
            <div
              className='absolute -right-4 top-8 w-4 h-12 bg-gray-700 border border-blue-500 rounded animate-bounce'
              style={{ animationDelay: '0.5s' }}
            ></div>
          </div>
        </div>

        <h1 className='text-6xl md:text-8xl font-bold text-blue-500 mb-4 animate-pulse'>
          404
        </h1>
        <h2 className='text-2xl md:text-3xl font-semibold text-white mb-4'>
          Page Not Found
        </h2>
        <p className='text-gray-400 mb-8 text-lg'>
          Oops! It seems like this page has been abducted by robots. Don&apos;t
          worry, our robotic team is working on it!
        </p>

        <div className='space-y-4'>
          <Link href='/'>
            <Button className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 transform-gpu shadow-lg hover:shadow-xl'>
              Go Back Home
            </Button>
          </Link>
          <p className='text-sm text-gray-500'>
            If you think this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
