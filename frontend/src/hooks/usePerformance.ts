'use client';

import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiCalls: number;
  errors: number;
  memoryUsage?: number;
}

interface PerformanceOptions {
  trackApiCalls?: boolean;
  trackErrors?: boolean;
  trackMemory?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = (
  componentName: string,
  options: PerformanceOptions = {}
) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0,
    errors: 0
  });

  const [startTime] = useState(() => performance.now());

  // Track component load time
  useEffect(() => {
    const loadTime = performance.now() - startTime;
    setMetrics(prev => ({ ...prev, loadTime }));
  }, [startTime]);

  // Track render time
  useEffect(() => {
    const renderTime = performance.now() - startTime;
    setMetrics(prev => {
      const newMetrics = { ...prev, renderTime };
      options.onMetricsUpdate?.(newMetrics);
      return newMetrics;
    });
  });

  // Track API call
  const trackApiCall = useCallback(() => {
    if (options.trackApiCalls) {
      setMetrics(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
    }
  }, [options.trackApiCalls]);

  // Track error
  const trackError = useCallback(() => {
    if (options.trackErrors) {
      setMetrics(prev => ({ ...prev, errors: prev.errors + 1 }));
    }
  }, [options.trackErrors]);

  // Track memory usage
  const trackMemory = useCallback(() => {
    if (options.trackMemory && 'memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
      }));
    }
  }, [options.trackMemory]);

  // Log performance data in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, metrics);
    }
  }, [componentName, metrics]);

  return {
    metrics,
    trackApiCall,
    trackError,
    trackMemory
  };
};

// Hook để track page performance
export const usePagePerformance = () => {
  const [pageMetrics, setPageMetrics] = useState({
    domContentLoaded: 0,
    loadComplete: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0
  });

  useEffect(() => {
    // Get navigation timing
    const updateNavigationMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        setPageMetrics({
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0
        });
      }
    };

    // Get paint metrics
    const updatePaintMetrics = () => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      // LCP requires observer
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          
          setPageMetrics(prev => ({
            ...prev,
            firstContentfulPaint: fcp ? fcp.startTime : 0,
            largestContentfulPaint: lcp ? lcp.startTime : 0
          }));
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        return () => observer.disconnect();
      }
    };

    updateNavigationMetrics();
    updatePaintMetrics();
  }, []);

  return pageMetrics;
};

// Hook để track API performance
export const useApiPerformance = () => {
  const [apiMetrics, setApiMetrics] = useState<{
    [endpoint: string]: {
      calls: number;
      averageTime: number;
      errors: number;
      lastCallTime: number;
    };
  }>({});

  const trackApiCall = useCallback((
    endpoint: string,
    duration: number,
    isError: boolean = false
  ) => {
    setApiMetrics(prev => {
      const existing = prev[endpoint] || {
        calls: 0,
        averageTime: 0,
        errors: 0,
        lastCallTime: 0
      };

      const newCalls = existing.calls + 1;
      const newAverageTime = (existing.averageTime * existing.calls + duration) / newCalls;

      return {
        ...prev,
        [endpoint]: {
          calls: newCalls,
          averageTime: newAverageTime,
          errors: existing.errors + (isError ? 1 : 0),
          lastCallTime: duration
        }
      };
    });
  }, []);

  const getSlowApis = useCallback((threshold: number = 2000) => {
    return Object.entries(apiMetrics)
      .filter(([_, metrics]) => metrics.averageTime > threshold)
      .sort(([_, a], [__, b]) => b.averageTime - a.averageTime);
  }, [apiMetrics]);

  const getErrorProneApis = useCallback(() => {
    return Object.entries(apiMetrics)
      .filter(([_, metrics]) => metrics.errors > 0)
      .sort(([_, a], [__, b]) => (b.errors / b.calls) - (a.errors / a.calls));
  }, [apiMetrics]);

  return {
    apiMetrics,
    trackApiCall,
    getSlowApis,
    getErrorProneApis
  };
};
