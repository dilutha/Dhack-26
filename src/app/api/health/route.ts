import { NextResponse } from 'next/server';
import { healthCheckEndpoints } from '@/components/HealthCheck';

export async function GET() {
  try {
    const healthData = healthCheckEndpoints.main();
    return NextResponse.json(healthData);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
