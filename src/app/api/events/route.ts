import { NextResponse } from 'next/server';
import { getTimelineEvents } from '@/lib/platformConfig';

export async function GET() {
  const data = await getTimelineEvents();
  return NextResponse.json(
    { data },
    {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
