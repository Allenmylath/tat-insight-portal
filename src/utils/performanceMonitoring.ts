declare const gtag: Function;

export interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export const reportWebVitals = (metric: WebVitalsMetric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
    });
  }

  // Send to Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_rating: metric.rating,
      non_interaction: true,
    });
  }

  // Track LCP specifically for monitoring
  if (metric.name === 'LCP') {
    console.log('🎯 LCP Performance:', {
      value: `${(metric.value / 1000).toFixed(2)}s`,
      rating: metric.rating,
      target: '< 2.5s',
    });
  }
};
