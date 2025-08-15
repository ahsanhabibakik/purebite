'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

interface TrackEventOptions {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  immediate?: boolean;
}

interface PerformanceMetrics {
  pageLoadTime?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
  totalBlockingTime?: number;
}

// Generate session ID
function generateSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Queue for batching events
class EventQueue {
  private queue: Array<TrackEventOptions & { timestamp: number }> = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Flush queue before page unload
      window.addEventListener('beforeunload', () => this.flush());
      window.addEventListener('visibilitychange', () => {
        if (document.hidden) this.flush();
      });
    }
  }

  add(event: TrackEventOptions) {
    this.queue.push({
      ...event,
      timestamp: Date.now()
    });

    if (event.immediate || this.queue.length >= this.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  private scheduleFlush() {
    if (this.timer) return;
    
    this.timer = setTimeout(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events on failure (with limit to prevent infinite growth)
      if (this.queue.length < 100) {
        this.queue.unshift(...events);
      }
    }
  }
}

// Global event queue
const eventQueue = typeof window !== 'undefined' ? new EventQueue() : null;

export function useAnalytics() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const pageLoadTime = useRef<number>(Date.now());
  const sessionId = useRef<string>('');

  // Initialize session ID
  useEffect(() => {
    sessionId.current = generateSessionId();
  }, []);

  // Track page views automatically
  useEffect(() => {
    const startTime = Date.now();
    pageLoadTime.current = startTime;

    // Track page view
    trackEvent('page_view', {
      url: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    });

    return () => {
      // Track time spent on page
      const timeSpent = Date.now() - startTime;
      if (timeSpent > 1000) { // Only track if user spent more than 1 second
        trackEvent('page_time', {
          url: pathname,
          timeSpent
        });
      }
    };
  }, [pathname]);

  // Track performance metrics
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const trackPerformanceMetrics = () => {
      if ('performance' in window && 'getEntriesByType' in window.performance) {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        const paintEntries = performance.getEntriesByType('paint') as PerformanceEntry[];
        
        if (navigationEntries.length > 0) {
          const nav = navigationEntries[0];
          const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          
          const metrics: PerformanceMetrics = {
            pageLoadTime: nav.loadEventEnd - nav.loadEventStart,
            firstContentfulPaint: fcp?.startTime,
          };

          // Get LCP and CLS if available
          if ('PerformanceObserver' in window) {
            // LCP
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1] as any;
              metrics.largestContentfulPaint = lastEntry.startTime;
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // CLS
            let cumulativeLayoutShift = 0;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as any[]) {
                if (!entry.hadRecentInput) {
                  cumulativeLayoutShift += entry.value;
                }
              }
              metrics.cumulativeLayoutShift = cumulativeLayoutShift;
            }).observe({ entryTypes: ['layout-shift'] });

            // FID
            new PerformanceObserver((list) => {
              const firstInput = list.getEntries()[0] as any;
              metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime;
            }).observe({ entryTypes: ['first-input'] });
          }

          // Send metrics after a delay to collect all data
          setTimeout(() => {
            trackEvent('performance_metric', {
              ...metrics,
              url: pathname
            });
          }, 2000);
        }
      }
    };

    // Track performance on load
    if (document.readyState === 'complete') {
      trackPerformanceMetrics();
    } else {
      window.addEventListener('load', trackPerformanceMetrics);
    }

    return () => {
      window.removeEventListener('load', trackPerformanceMetrics);
    };
  }, [pathname]);

  // Track errors
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleError = (event: ErrorEvent) => {
      trackEvent('error_occurred', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        url: pathname
      }, true); // Send immediately
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent('error_occurred', {
        message: 'Unhandled Promise Rejection',
        reason: event.reason?.toString(),
        url: pathname
      }, true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [pathname]);

  const trackEvent = useCallback((
    event: string,
    properties?: Record<string, any>,
    immediate?: boolean
  ) => {
    if (!eventQueue) return;

    const userId = session?.user?.email;
    
    eventQueue.add({
      event,
      properties: {
        ...properties,
        sessionId: sessionId.current,
        timestamp: new Date().toISOString(),
        url: pathname
      },
      userId,
      immediate
    });
  }, [session, pathname]);

  // Specific tracking methods
  const trackProductView = useCallback((productId: string, source?: string) => {
    trackEvent('product_view', {
      productId,
      source: source || 'direct'
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback((productId: string, quantity: number, price: number) => {
    trackEvent('product_add_to_cart', {
      productId,
      quantity,
      price,
      value: quantity * price
    });
  }, [trackEvent]);

  const trackRemoveFromCart = useCallback((productId: string, quantity: number) => {
    trackEvent('product_remove_from_cart', {
      productId,
      quantity
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, results: number) => {
    trackEvent('search', {
      query,
      results,
      queryLength: query.length
    });
  }, [trackEvent]);

  const trackCheckoutStep = useCallback((step: string, value?: number, orderId?: string) => {
    trackEvent(`checkout_${step}`, {
      step,
      value,
      orderId
    });
  }, [trackEvent]);

  const trackPurchase = useCallback((orderId: string, value: number, items: any[]) => {
    trackEvent('purchase', {
      orderId,
      value,
      items,
      itemCount: items.length
    });
  }, [trackEvent]);

  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    trackEvent(`user_${action}`, properties);
  }, [trackEvent]);

  const trackEngagement = useCallback((type: string, properties?: Record<string, any>) => {
    trackEvent(`engagement_${type}`, properties);
  }, [trackEvent]);

  const trackRecommendation = useCallback((
    type: 'view' | 'click',
    recommendationType: string,
    productId: string,
    position?: number
  ) => {
    trackEvent(`recommendation_${type}`, {
      recommendationType,
      productId,
      position
    });
  }, [trackEvent]);

  // Scroll tracking
  const trackScrollDepth = useCallback(() => {
    if (typeof window === 'undefined') return;

    let maxScroll = 0;
    const thresholds = [25, 50, 75, 100];
    const tracked = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      maxScroll = Math.max(maxScroll, scrollPercent);

      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !tracked.has(threshold)) {
          tracked.add(threshold);
          trackEvent('scroll_depth', {
            depth: threshold,
            url: pathname
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Track final scroll depth
      if (maxScroll > 0) {
        trackEvent('scroll_depth_final', {
          maxDepth: maxScroll,
          url: pathname
        });
      }
    };
  }, [trackEvent, pathname]);

  return {
    trackEvent,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackSearch,
    trackCheckoutStep,
    trackPurchase,
    trackUserAction,
    trackEngagement,
    trackRecommendation,
    trackScrollDepth
  };
}