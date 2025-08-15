'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface PerformanceMonitorProps {
  enabled?: boolean;
  sampleRate?: number; // Percentage of users to monitor (0-100)
}

export default function PerformanceMonitor({ 
  enabled = true, 
  sampleRate = 100 
}: PerformanceMonitorProps) {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Check if we should monitor this user based on sample rate
    if (Math.random() * 100 > sampleRate) return;

    // Web Vitals monitoring
    const observeWebVitals = () => {
      // Core Web Vitals
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          trackEvent('web_vital_lcp', {
            value: lastEntry.startTime,
            url: window.location.pathname,
            metric: 'LCP'
          });
        });

        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP observer not supported');
        }

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const firstInput = list.getEntries()[0] as any;
          
          trackEvent('web_vital_fid', {
            value: firstInput.processingStart - firstInput.startTime,
            url: window.location.pathname,
            metric: 'FID'
          });
        });

        try {
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.warn('FID observer not supported');
        }

        // Cumulative Layout Shift (CLS)
        let cumulativeLayoutShift = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              cumulativeLayoutShift += entry.value;
            }
          }
        });

        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('CLS observer not supported');
        }

        // Send CLS when page is hidden
        const sendCLS = () => {
          trackEvent('web_vital_cls', {
            value: cumulativeLayoutShift,
            url: window.location.pathname,
            metric: 'CLS'
          });
        };

        window.addEventListener('visibilitychange', () => {
          if (document.hidden) sendCLS();
        });

        window.addEventListener('beforeunload', sendCLS);
      }

      // Navigation Timing API
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigationEntry) {
          trackEvent('navigation_timing', {
            dns: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
            tcp: navigationEntry.connectEnd - navigationEntry.connectStart,
            request: navigationEntry.responseStart - navigationEntry.requestStart,
            response: navigationEntry.responseEnd - navigationEntry.responseStart,
            dom: navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart,
            load: navigationEntry.loadEventEnd - navigationEntry.navigationStart,
            url: window.location.pathname
          });
        }
      }
    };

    // Resource timing monitoring
    const observeResourceTiming = () => {
      if ('PerformanceObserver' in window) {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry: any) => {
            // Only track slow resources (>1s) or large resources
            if (entry.duration > 1000 || entry.transferSize > 100000) {
              trackEvent('resource_timing', {
                name: entry.name,
                type: entry.initiatorType,
                duration: entry.duration,
                size: entry.transferSize,
                url: window.location.pathname
              });
            }
          });
        });

        try {
          resourceObserver.observe({ entryTypes: ['resource'] });
        } catch (e) {
          console.warn('Resource observer not supported');
        }
      }
    };

    // Memory usage monitoring (Chrome only)
    const observeMemoryUsage = () => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        
        trackEvent('memory_usage', {
          usedJSMemory: memoryInfo.usedJSMemory,
          totalJSMemory: memoryInfo.totalJSMemory,
          jsMemoryLimit: memoryInfo.jsMemoryLimit,
          url: window.location.pathname
        });
      }
    };

    // Long tasks monitoring
    const observeLongTasks = () => {
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry: any) => {
            trackEvent('long_task', {
              duration: entry.duration,
              startTime: entry.startTime,
              url: window.location.pathname
            });
          });
        });

        try {
          longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          console.warn('Long task observer not supported');
        }
      }
    };

    // Device and connection info
    const trackDeviceInfo = () => {
      const deviceInfo: any = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenWidth: screen.width,
        screenHeight: screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        url: window.location.pathname
      };

      // Network information (experimental)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        deviceInfo.connectionType = connection.effectiveType;
        deviceInfo.downlink = connection.downlink;
        deviceInfo.rtt = connection.rtt;
        deviceInfo.saveData = connection.saveData;
      }

      trackEvent('device_info', deviceInfo);
    };

    // Initialize monitoring
    const initMonitoring = () => {
      observeWebVitals();
      observeResourceTiming();
      observeLongTasks();
      trackDeviceInfo();
      
      // Track memory usage periodically (Chrome only)
      if ('memory' in performance) {
        observeMemoryUsage();
        setInterval(observeMemoryUsage, 30000); // Every 30 seconds
      }
    };

    // Start monitoring when page is loaded
    if (document.readyState === 'complete') {
      initMonitoring();
    } else {
      window.addEventListener('load', initMonitoring);
    }

    // Track page visibility changes
    const handleVisibilityChange = () => {
      trackEvent('page_visibility', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        url: window.location.pathname
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track online/offline status
    const handleOnline = () => {
      trackEvent('connection_status', {
        online: true,
        url: window.location.pathname
      });
    };

    const handleOffline = () => {
      trackEvent('connection_status', {
        online: false,
        url: window.location.pathname
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('load', initMonitoring);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, sampleRate, trackEvent]);

  // This component doesn't render anything
  return null;
}