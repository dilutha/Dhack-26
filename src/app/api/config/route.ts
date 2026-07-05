import { NextResponse } from 'next/server';
import {
  getPlatformSettings,
  getSubmissionWindows,
  getTimelineEvents,
} from '@/lib/platformConfig';

export async function GET() {
  const [settings, timelineEvents, submissionWindows] = await Promise.all([
    getPlatformSettings(),
    getTimelineEvents(),
    getSubmissionWindows(),
  ]);

  return NextResponse.json(
    {
      settings,
      timelineEvents,
      submissionWindows,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export const dynamic = 'force-dynamic';
