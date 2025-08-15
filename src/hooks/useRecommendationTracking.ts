'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect } from 'react';
import { RecommendationType } from '@prisma/client';

interface TrackingMetadata {
  sessionId?: string;
  deviceType?: string;
  source?: string;
  duration?: number;
  position?: number;
  section?: string;
  referrer?: string;
  [key: string]: any;
}

export function useRecommendationTracking() {
  const { data: session } = useSession();

  // Generate session ID for tracking user sessions
  const sessionId = useCallback(() => {
    if (typeof window === 'undefined') return undefined;
    
    let id = sessionStorage.getItem('recommendation_session_id');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('recommendation_session_id', id);
    }
    return id;
  }, []);

  // Get device type
  const getDeviceType = useCallback(() => {
    if (typeof window === 'undefined') return 'unknown';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  // Generic tracking function
  const trackAction = useCallback(async (
    action: string,
    productId: string,
    additionalData?: TrackingMetadata & {
      type?: RecommendationType;
    }
  ) => {
    if (!session?.user) return;

    try {
      const metadata = {
        sessionId: sessionId(),
        deviceType: getDeviceType(),
        source: additionalData?.source || 'direct',
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        timestamp: new Date().toISOString(),
        ...additionalData
      };

      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          productId,
          type: additionalData?.type,
          metadata
        })
      });
    } catch (error) {
      console.error('Error tracking recommendation action:', error);
    }
  }, [session, sessionId, getDeviceType]);

  // Track product view
  const trackView = useCallback((
    productId: string, 
    metadata?: TrackingMetadata & { type?: RecommendationType }
  ) => {
    trackAction('track_view', productId, metadata);
  }, [trackAction]);

  // Track recommendation click
  const trackClick = useCallback((
    productId: string,
    type: RecommendationType,
    metadata?: TrackingMetadata
  ) => {
    trackAction('track_click', productId, { ...metadata, type });
  }, [trackAction]);

  // Track add to cart
  const trackAddToCart = useCallback((
    productId: string,
    metadata?: TrackingMetadata & { type?: RecommendationType }
  ) => {
    trackAction('track_add_to_cart', productId, metadata);
  }, [trackAction]);

  // Track purchase
  const trackPurchase = useCallback((
    productId: string,
    metadata?: TrackingMetadata
  ) => {
    trackAction('track_purchase', productId, metadata);
  }, [trackAction]);

  // Track wishlist add
  const trackWishlistAdd = useCallback((
    productId: string,
    metadata?: TrackingMetadata
  ) => {
    trackAction('track_wishlist_add', productId, metadata);
  }, [trackAction]);

  // Track share
  const trackShare = useCallback((
    productId: string,
    metadata?: TrackingMetadata
  ) => {
    trackAction('track_share', productId, metadata);
  }, [trackAction]);

  // Track page view with duration
  const trackPageView = useCallback((productId: string, startTime?: number) => {
    if (!startTime) return;
    
    const duration = Math.round((Date.now() - startTime) / 1000); // Duration in seconds
    trackView(productId, { duration, source: 'page_view' });
  }, [trackView]);

  // Hook for tracking time spent on page
  const usePageViewTracking = (productId: string) => {
    useEffect(() => {
      const startTime = Date.now();
      
      // Track view immediately
      trackView(productId, { source: 'page_view' });

      // Track duration when user leaves
      const handleBeforeUnload = () => {
        trackPageView(productId, startTime);
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          trackPageView(productId, startTime);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        trackPageView(productId, startTime);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [productId]);
  };

  // Hook for tracking scroll depth on product page
  const useScrollTracking = (productId: string) => {
    useEffect(() => {
      let maxScrollDepth = 0;
      const trackingIntervals = [25, 50, 75, 100]; // Percentage thresholds
      const trackedDepths = new Set<number>();

      const handleScroll = () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        
        maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);

        // Track when user reaches certain scroll depths
        trackingIntervals.forEach(threshold => {
          if (scrollPercent >= threshold && !trackedDepths.has(threshold)) {
            trackedDepths.add(threshold);
            trackAction('track_view', productId, {
              source: 'scroll_tracking',
              scrollDepth: threshold,
              maxScrollDepth
            });
          }
        });
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        
        // Track final scroll depth
        if (maxScrollDepth > 0) {
          trackAction('track_view', productId, {
            source: 'scroll_tracking_final',
            maxScrollDepth
          });
        }
      };
    }, [productId, trackAction]);
  };

  return {
    trackView,
    trackClick,
    trackAddToCart,
    trackPurchase,
    trackWishlistAdd,
    trackShare,
    trackPageView,
    usePageViewTracking,
    useScrollTracking,
    sessionId: sessionId(),
    deviceType: getDeviceType()
  };
}