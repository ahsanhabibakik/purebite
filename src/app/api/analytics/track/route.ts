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

    // Get client information
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '';
    const referer = request.headers.get('referer') || '';

    // Process each event
    const trackingPromises = events.map(async (eventData) => {
      try {
        await AnalyticsService.track({
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
      } catch (error) {
        console.error(`Failed to track event ${eventData.event}:`, error);
      }
    });

    await Promise.allSettled(trackingPromises);

    return NextResponse.json({ success: true, tracked: events.length });

  } catch (error) {
    console.error('Error in analytics tracking:', error);
    return NextResponse.json(
      { error: 'Failed to track events' },
      { status: 500 }
    );
  }
}