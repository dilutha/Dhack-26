import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    // Test database connection with a simple query
    const { data, error } = await supabaseServer
      .from('usj_bis_registrations')
      .select('count')
      .limit(1);

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      queryTime: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
