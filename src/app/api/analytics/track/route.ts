import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics';

interface TrackEventRequest {
  events: Array<{
    event: string;
    properties?: Record<string, any>;
    userId?: string;
    timestamp: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackEventRequest = await request.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      );
    }

    // In development or when database is unavailable, gracefully handle analytics
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      console.log('Analytics tracking disabled in development (no DATABASE_URL)');
      return NextResponse.json({ success: true, tracked: events.length, note: 'Analytics disabled in development' });
    }

    // Get client information
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '';
    const referer = request.headers.get('referer') || '';

    // Process each event with timeout
    const trackingPromises = events.map(async (eventData) => {
      try {
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Analytics tracking timeout')), 5000);
        });

        const trackingPromise = AnalyticsService.track({
          event: eventData.event as any,
          userId: eventData.userId,
          properties: eventData.properties,
          userAgent,
          ipAddress,
          referrer: referer,
          url: eventData.properties?.url,
          sessionId: eventData.properties?.sessionId,
          timestamp: new Date(eventData.timestamp)
        });

        await Promise.race([trackingPromise, timeoutPromise]);
      } catch (error) {
        // Only log in development to avoid spam
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to track event ${eventData.event}:`, error instanceof Error ? error.message : error);
        }
      }
    });

    // Use allSettled to ensure we don't fail if some events fail
    const results = await Promise.allSettled(trackingPromises);
    const successCount = results.filter(result => result.status === 'fulfilled').length;

    return NextResponse.json({ 
      success: true, 
      tracked: successCount,
      attempted: events.length 
    });

  } catch (error) {
    // Log error but don't fail - analytics should be non-critical
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics tracking error:', error instanceof Error ? error.message : error);
    }
    
    // Return success even on error to prevent client-side failures
    return NextResponse.json({ 
      success: true, 
      tracked: 0, 
      note: 'Analytics temporarily unavailable' 
    });
  }
}