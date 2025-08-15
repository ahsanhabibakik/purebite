import { NextRequest, NextResponse } from 'next/server';
import { getDBHealth, getDBStats, connectDB } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // First ensure we have a connection
    await connectDB();
    
    // Get health check and stats
    const [health, stats] = await Promise.all([
      getDBHealth(),
      getDBStats().catch(() => null) // Stats might fail in some cases, so make it optional
    ]);

    const response = {
      timestamp: new Date().toISOString(),
      database: {
        health,
        stats,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      }
    };

    const status = health.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(response, { status });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: {
        health: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: null
        },
        stats: null,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      }
    }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'reconnect':
        await connectDB();
        const health = await getDBHealth();
        return NextResponse.json({
          success: true,
          message: 'Database reconnection attempted',
          health
        });
        
      case 'stats':
        const stats = await getDBStats();
        return NextResponse.json({
          success: true,
          stats
        });
        
      default:
        return NextResponse.json({
          error: 'Invalid action. Supported actions: reconnect, stats'
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Action failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}