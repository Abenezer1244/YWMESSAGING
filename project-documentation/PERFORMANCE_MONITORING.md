# Performance Monitoring Setup Guide

**Project**: YWMESSAGING
**Date**: December 2, 2025
**Purpose**: Production metrics collection and monitoring for Core Web Vitals

---

## Overview

After implementing frontend optimizations, it's critical to:
1. **Measure** actual user experience in production
2. **Baseline** performance metrics for comparison
3. **Alert** on regressions automatically
4. **Optimize** based on real user data

---

## Core Web Vitals Monitoring

### What to Monitor

| Metric | Threshold | Status |
|--------|-----------|--------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | Critical |
| **INP** (Interaction to Next Paint) | ≤ 200ms | Critical |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | Critical |
| **TTFB** (Time to First Byte) | ≤ 600ms | Important |
| **FCP** (First Contentful Paint) | ≤ 1.8s | Important |

---

## Implementation Option 1: Google Analytics 4 (Recommended for Startups)

### Setup Steps

#### 1. Create Google Analytics Property

```bash
# Visit https://analytics.google.com
# Create new property for your domain
# Copy your Measurement ID (G-XXXXXXXXXX)
```

#### 2. Install GA4 Package

```bash
cd frontend
npm install @react-ga/core @react-ga/event-tracker
```

#### 3. Initialize GA4 in main.tsx

```typescript
import { initializeAppInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

// For Google Analytics 4
import ReactGA from 'react-ga4';

const initializeAnalytics = () => {
  // Initialize GA4
  ReactGA.initialize('G-XXXXXXXXXX'); // Replace with your measurement ID

  // Track Web Vitals
  import('web-vitals').then(({ getCLS, getFCP, getLCP, getFID, getTTFB }) => {
    getCLS((metric) => ReactGA.event('CLS', { value: metric.value }));
    getFCP((metric) => ReactGA.event('FCP', { value: metric.value }));
    getLCP((metric) => ReactGA.event('LCP', { value: metric.value }));
    getFID((metric) => ReactGA.event('FID', { value: metric.value }));
    getTTFB((metric) => ReactGA.event('TTFB', { value: metric.value }));
  });
};

// Call in App.tsx useEffect
initializeAnalytics();
```

#### 4. Add Web Vitals Hook

Create `src/hooks/useWebVitals.ts`:

```typescript
import { useEffect } from 'react';
import { getCLS, getFCP, getLCP, getINP, getTTFB } from 'web-vitals';
import ReactGA from 'react-ga4';

export function useWebVitals() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Largest Contentful Paint
      getLCP((metric) => {
        console.log('LCP:', metric.value);
        ReactGA.event('web_vitals_lcp', {
          value: metric.value,
          rating: metric.rating,
        });
      });

      // Interaction to Next Paint
      getINP((metric) => {
        console.log('INP:', metric.value);
        ReactGA.event('web_vitals_inp', {
          value: metric.value,
          rating: metric.rating,
        });
      });

      // Cumulative Layout Shift
      getCLS((metric) => {
        console.log('CLS:', metric.value);
        ReactGA.event('web_vitals_cls', {
          value: metric.value,
          rating: metric.rating,
        });
      });

      // First Contentful Paint
      getFCP((metric) => {
        console.log('FCP:', metric.value);
        ReactGA.event('web_vitals_fcp', {
          value: metric.value,
          rating: metric.rating,
        });
      });

      // Time to First Byte
      getTTFB((metric) => {
        console.log('TTFB:', metric.value);
        ReactGA.event('web_vitals_ttfb', {
          value: metric.value,
          rating: metric.rating,
        });
      });
    }
  }, []);
}
```

#### 5. Use in App Component

```typescript
import { useWebVitals } from './hooks/useWebVitals';

function App() {
  useWebVitals();
  // ... rest of component
}
```

#### 6. View Metrics in GA4

1. Navigate to Reports → Engagement → Events
2. Filter by `web_vitals_*` events
3. Create custom dashboard:
   - Add LCP, INP, CLS metrics
   - Set alerts for threshold breaches
   - Track over time

---

## Implementation Option 2: Datadog (Enterprise)

### Setup Steps

#### 1. Install Datadog RUM

```bash
npm install @datadog/browser-rum
```

#### 2. Initialize in main.tsx

```typescript
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: 'YOUR_APP_ID',
  clientToken: 'YOUR_CLIENT_TOKEN',
  site: 'datadoghq.com',
  service: 'koinonia-frontend',
  env: 'production',
  sessionSampleRate: 100, // Monitor 100% of sessions
  sessionReplaySampleRate: 20, // Record 20% of sessions
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
});

datadogRum.startSessionReplayRecording();
```

#### 3. Create Custom Dashboard

Datadog automatically tracks Web Vitals. Create dashboard with:
- LCP percentiles (50th, 75th, 99th)
- INP percentiles
- CLS distribution
- Error rate monitoring
- Custom business metrics

#### 4. Set Up Alerts

```
LCP > 2.5s for 5 minutes → Page Down
INP > 200ms for 10 minutes → Performance Degradation
CLS > 0.1 for any duration → Layout Issues
Error rate > 5% → Application Issues
```

---

## Implementation Option 3: Custom Backend Solution (Advanced)

### Setup Steps

#### 1. Create Metrics API Endpoint

```typescript
// backend/routes/metrics.ts
POST /api/metrics {
  timestamp: ISO8601,
  url: string,
  lcp?: number,
  inp?: number,
  cls?: number,
  fcp?: number,
  ttfb?: number,
  userAgent: string,
  viewport: { width, height },
  connection: { effectiveType, downlink, rtt }
}
```

#### 2. Frontend Metrics Collector

Create `src/utils/metricsCollector.ts`:

```typescript
import { getCLS, getFCP, getLCP, getINP, getTTFB } from 'web-vitals';

interface WebVitalsMetric {
  lcp?: number;
  inp?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

const metrics: WebVitalsMetric = {};

export function initializeMetricsCollection() {
  // Collect metrics
  getLCP((metric) => { metrics.lcp = metric.value; });
  getINP((metric) => { metrics.inp = metric.value; });
  getCLS((metric) => { metrics.cls = metric.value; });
  getFCP((metric) => { metrics.fcp = metric.value; });
  getTTFB((metric) => { metrics.ttfb = metric.value; });

  // Send metrics on page unload
  window.addEventListener('beforeunload', () => {
    sendMetrics(metrics);
  });

  // Also send after 30 seconds (for long-lived pages)
  setTimeout(() => {
    if (Object.keys(metrics).length > 0) {
      sendMetrics(metrics);
    }
  }, 30000);
}

async function sendMetrics(metrics: WebVitalsMetric) {
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...metrics,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
        } : undefined,
      }),
    });
  } catch (error) {
    console.debug('Failed to send metrics:', error);
  }
}
```

#### 3. Backend Processing

```typescript
// backend/services/metricsService.ts
import { db } from '../db';

export async function storeMetrics(data: any) {
  await db.metrics.create({
    url: data.url,
    lcp: data.lcp,
    inp: data.inp,
    cls: data.cls,
    fcp: data.fcp,
    ttfb: data.ttfb,
    userAgent: data.userAgent,
    viewport: data.viewport,
    connection: data.connection,
    timestamp: new Date(data.timestamp),
  });
}

export async function getMetricsStats(period = '7d') {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  const metrics = await db.metrics.findMany({
    where: { timestamp: { gte: startDate } },
  });

  return {
    lcp: {
      p50: percentile(metrics.map(m => m.lcp).filter(Boolean), 0.5),
      p75: percentile(metrics.map(m => m.lcp).filter(Boolean), 0.75),
      p99: percentile(metrics.map(m => m.lcp).filter(Boolean), 0.99),
    },
    inp: {
      p50: percentile(metrics.map(m => m.inp).filter(Boolean), 0.5),
      p75: percentile(metrics.map(m => m.inp).filter(Boolean), 0.75),
      p99: percentile(metrics.map(m => m.inp).filter(Boolean), 0.99),
    },
    cls: {
      p50: percentile(metrics.map(m => m.cls).filter(Boolean), 0.5),
      p75: percentile(metrics.map(m => m.cls).filter(Boolean), 0.75),
      p99: percentile(metrics.map(m => m.cls).filter(Boolean), 0.99),
    },
    count: metrics.length,
  };
}

function percentile(values: number[], p: number) {
  const sorted = values.sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * p) - 1;
  return sorted[index] || 0;
}
```

---

## Recommended Implementation Path

### Phase 1 (Immediate - Week 1)
1. **Set up Google Analytics 4** - Free, easy, good for initial baseline
2. **Add Web Vitals hook** - Minimal code changes
3. **Create dashboard** - Monitor metrics

### Phase 2 (Short-term - Month 1)
1. **Set up alerts** - Email/Slack notifications
2. **Track regressions** - Compare weekly baselines
3. **Document findings** - Create performance reports

### Phase 3 (Long-term - Month 3+)
1. **Upgrade to Datadog** (if enterprise)
2. **Implement session replay** - Understand user pain points
3. **Custom backend** (if data ownership critical)

---

## Alert Configuration

### Google Analytics Alerts

1. Go to Admin → Custom Alerts
2. Create alerts for:

```
Alert 1: LCP Degradation
Condition: LCP > 2500ms for 1 hour
Notification: Email, Slack

Alert 2: CLS Issues
Condition: CLS > 0.1 for 30 minutes
Notification: Email, Slack

Alert 3: INP Performance
Condition: INP > 200ms for 1 hour
Notification: Email, Slack
```

### Datadog Alerts

Create monitors:
```
Monitor 1: LCP p75 > 2.5s
Condition: Averaged over 5 minutes
Alert: Slack #performance channel

Monitor 2: Error Rate > 5%
Condition: Last 10 minutes
Alert: PagerDuty (critical)

Monitor 3: Bundle Size Increase
Condition: Monthly trend
Alert: Email to team
```

---

## Baseline Metrics to Record

### Before Deploying Optimizations
```
Date: _______________
LCP:   _____ ms (p75)
INP:   _____ ms (p75)
CLS:   _____ (p75)
TTFB:  _____ ms
FCP:   _____ ms
Bundle Size: _____ KB
```

### After Deploying Optimizations
```
Date: _______________
LCP:   _____ ms (improvement: ___%)
INP:   _____ ms (improvement: ___%)
CLS:   _____ (improvement: ___%)
TTFB:  _____ ms (improvement: ___%)
FCP:   _____ ms (improvement: ___%)
Bundle Size: _____ KB (improvement: ___%)
```

---

## Performance Budget

### Monthly Budget Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| LCP p75 | 2.5s | ❌ Alert if exceeded |
| INP p75 | 200ms | ❌ Alert if exceeded |
| CLS p75 | 0.1 | ❌ Alert if exceeded |
| Bundle Size | 300 KB gzipped | ⚠️ Review if exceeded |

### When Thresholds Breached

1. **Immediate (< 1 hour)**
   - Verify real degradation (not measurement error)
   - Check recent deployments
   - Assess impact on users

2. **Short-term (< 24 hours)**
   - Identify root cause
   - Rollback if necessary
   - Document findings

3. **Medium-term (< 1 week)**
   - Implement fix
   - Test in staging
   - Deploy with monitoring

4. **Long-term**
   - Post-mortem analysis
   - Prevent recurrence
   - Update guidelines

---

## Dashboard Template

### Google Analytics 4 Custom Report

**Dimensions:**
- Event Name
- Device Category
- Country
- Browser

**Metrics:**
- Event Count
- Event Value (average)
- User Count

**Filters:**
- Event Name contains "web_vitals"

### Sample SQL Query (Custom Backend)

```sql
SELECT
  DATE(timestamp) as date,
  PERCENTILE_CONT(lcp, 0.75) as lcp_p75,
  PERCENTILE_CONT(inp, 0.75) as inp_p75,
  PERCENTILE_CONT(cls, 0.75) as cls_p75,
  COUNT(*) as samples
FROM metrics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

---

## Troubleshooting

### Web Vitals Not Appearing in GA4

1. **Check:** Metrics being sent?
   ```javascript
   // Open DevTools Console
   ReactGA.event('test_event', { test: true });
   // Check GA4 dashboard (may take 24 hours)
   ```

2. **Check:** Correct measurement ID?
   ```javascript
   console.log('GA4 ID:', window.gtag?.config);
   ```

3. **Check:** Ad blocker not blocking events?
   ```javascript
   // Try in private/incognito mode
   ```

### High CLS Reported But Not Seeing Visually

1. Might be from deferred fonts loading
2. Add `font-display: swap` to @font-face
3. Add min-height reservations to dynamic content

### LCP > 2.5s But Lighthouse Shows < 2.5s

1. Different network conditions
2. Different device specs
3. Different traffic times
4. Real user data is more accurate

---

## Monthly Review Process

### First Monday of Every Month

1. **Review GA4 data**
   - Open custom Web Vitals report
   - Compare month-over-month
   - Check for trends

2. **Generate performance report**
   - LCP/INP/CLS trends
   - Device breakdown
   - Geographic breakdown
   - Browser breakdown

3. **Team meeting**
   - Share results
   - Identify issues
   - Plan optimizations

4. **Document baseline**
   - Update PERFORMANCE_METRICS.md
   - Archive report
   - Note any changes

---

## Resources

- [Web Vitals Library](https://github.com/GoogleChrome/web-vitals)
- [GA4 Custom Events](https://support.google.com/analytics/answer/9322688)
- [Datadog RUM](https://docs.datadoghq.com/real_user_monitoring/)
- [Web Vitals Guide](https://web.dev/vitals/)

---

## Implementation Checklist

- [ ] Choose monitoring solution (GA4 recommended)
- [ ] Install dependencies
- [ ] Implement Web Vitals hook
- [ ] Deploy to production
- [ ] Verify data collection (24 hours)
- [ ] Create baseline metrics
- [ ] Set up alerts
- [ ] Create dashboard
- [ ] Schedule monthly reviews
- [ ] Document process

---

## Next Steps

1. **This Week:** Set up GA4 and Web Vitals hook
2. **This Month:** Establish baseline metrics
3. **Ongoing:** Monthly performance reviews
4. **Quarterly:** Comprehensive audit and optimization planning
