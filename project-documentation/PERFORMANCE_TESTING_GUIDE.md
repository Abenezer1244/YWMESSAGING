# Performance Testing & Validation Guide

**Project**: YWMESSAGING
**Date**: December 2, 2025
**Purpose**: Step-by-step guide to validate frontend performance optimizations

---

## Quick Start

### 1. Run Build
```bash
cd frontend
npm run build
```

**Expected Output:**
```
✓ 2859 modules transformed
✓ built in 34-40 seconds
Main bundle: 62.44 KB gzipped ✅
Vendor chunks: <150 KB each ✅
```

---

## Testing & Validation Checklist

### A. Bundle Size Verification

#### Prerequisites
- Build artifact available in `dist/` folder
- `dist/stats.html` generated from visualizer

#### Test Steps

1. **Verify bundle sizes are within targets:**
```bash
# Check build output for gzipped sizes
cat dist/index.html | grep "assets/js"
```

2. **Open visualizer:**
```bash
# Open dist/stats.html in browser to see treemap
# Shows chunk breakdown and dependencies
```

3. **Expected Results:**
```
Initial Bundle (index-*.js):        62.44 KB gzipped ✅
vendor-react:                       51.88 KB gzipped ✅
vendor-ui:                          37.94 KB gzipped ✅
vendor-charts:                     102.47 KB gzipped ✅
vendor-utils:                       18.59 KB gzipped ✅
Route chunks (individual):          0.39-51.54 KB ✅
TOTAL:                              ~271 KB gzipped ✅
```

**Pass Criteria:** All chunks ≤ target sizes

---

### B. Lighthouse Audit

#### Prerequisites
- Frontend dev server running: `npm run dev`
- Chrome DevTools installed
- Lighthouse plugin installed (or use Chrome built-in)

#### Test Steps

1. **Start dev server:**
```bash
npm run dev
# Navigate to http://localhost:5173
```

2. **Run Lighthouse audit:**
   - Open Chrome DevTools (F12)
   - Go to Lighthouse tab
   - Click "Generate report"
   - Select: Performance, Accessibility, Best Practices, SEO
   - Desktop mode

3. **Screenshot results** for baseline comparison

4. **Expected Scores:**
```
Performance:      ≥ 90
Accessibility:    ≥ 95
Best Practices:   ≥ 90
SEO:             ≥ 90
```

**Pass Criteria:**
- Performance ≥ 90
- Accessibility ≥ 95

#### Common Issues & Fixes

**Issue:** Performance < 90
- **Cause:** Lazy loading or large assets
- **Fix:** Check Chrome DevTools > Performance tab for long tasks

**Issue:** Accessibility < 95
- **Cause:** Missing ARIA labels or focus styles
- **Fix:** Implemented in `index.html` and SoftLayout

**Issue:** CLS > 0.1
- **Cause:** Late-loaded fonts or dynamic content
- **Fix:** Add `min-height` reservations on dynamic sections

---

### C. Core Web Vitals Measurement

#### Largest Contentful Paint (LCP)
**Target:** ≤ 2.0 seconds

**How to measure:**
```javascript
// Add to browser console
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
}).observe({entryTypes: ['largest-contentful-paint']});
```

**Test Steps:**
1. Open DevTools > Performance tab
2. Reload page (hard refresh: Ctrl+Shift+R)
3. Let page fully load
4. Check flame chart for main content paint time
5. Measure from navigation start to LCP

**Pass Criteria:** LCP ≤ 2.0s

---

#### Interaction to Next Paint (INP)
**Target:** ≤ 150 milliseconds

**How to measure:**
```javascript
// Add to browser console
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('INP:', entry.duration);
  }
}).observe({entryTypes: ['event']});
```

**Test Steps:**
1. Click on navigation items (Home, Dashboard, etc.)
2. Fill out forms and submit
3. Check console for interaction durations
4. Each interaction should process in < 150ms

**Pass Criteria:** All interactions ≤ 150ms

---

#### Cumulative Layout Shift (CLS)
**Target:** ≤ 0.05

**How to measure:**
```javascript
// Add to browser console
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      console.log('CLS:', entry.value);
    }
  }
}).observe({entryTypes: ['layout-shift']});
```

**Test Steps:**
1. Load page and observe without interactions
2. Watch for unexpected layout shifts
3. Scroll through page content
4. Total CLS score should remain low

**Common CLS Issues:**
- Images without dimensions → Add `width/height` to `<img>`
- Dynamic content insertion → Use `min-height` containers
- Font loading → Use `font-display: swap`

**Pass Criteria:** CLS ≤ 0.05

---

### D. React DevTools Profiler

#### Prerequisites
- React DevTools extension installed
- Dev server running

#### Test Steps

1. **Open DevTools > Profiler tab**

2. **Record a performance profile:**
   - Click record button
   - Perform user action (navigate, form submit, etc.)
   - Stop recording

3. **Analyze results:**
   - Look for components with long render times
   - Check for unnecessary re-renders
   - Verify memoized components aren't re-rendering

4. **Check specific optimizations:**
   - ChartCard should only re-render on prop changes
   - DashboardPage should not recalculate chart data
   - State selectors should prevent unrelated updates

**Expected Behavior:**
```
ChartCard:    0-2ms render (memoized) ✅
DashboardPage: 5-10ms render (with memoization) ✅
Selector hooks: Minimal re-renders ✅
```

**Pass Criteria:**
- No components with > 20ms render time
- Memoized components not re-rendering unnecessarily

---

### E. Chrome DevTools Network Tab

#### Prerequisites
- Dev server running
- Chrome DevTools open

#### Test Steps

1. **Open DevTools > Network tab**

2. **Hard refresh page:** Ctrl+Shift+R

3. **Analyze requests:**
   - Check chunk sizes (gzipped)
   - Verify lazy-loaded routes only load when needed
   - Check resource hints (preconnect, dns-prefetch)

4. **Measure metrics:**
   - DOMContentLoaded: Should be < 1.5s
   - Load: Should be < 3s
   - Largest asset: Check recharts chunk size

5. **Test lazy loading:**
   - Navigate to different pages
   - Watch new chunks load dynamically
   - Verify chunks are only downloaded once

**Pass Criteria:**
- DOMContentLoaded < 1.5s
- Load < 3s
- No duplicate chunk downloads

---

### F. Mobile Responsiveness Testing

#### Test Devices

1. **Mobile (375px):**
```bash
# Chrome DevTools: Toggle device toolbar
# Select iPhone SE
# Test: Touch interactions, readable text, proper layout
```

2. **Tablet (768px):**
```bash
# Select iPad
# Test: Sidebar behavior, grid layouts, navigation
```

3. **Desktop (1440px):**
```bash
# No device emulation
# Full desktop experience
```

#### Checklist
- [ ] All text readable on mobile
- [ ] Buttons are touch-friendly (≥44x44px)
- [ ] No horizontal scrolling
- [ ] Navigation responsive
- [ ] Charts adapt to screen size
- [ ] Forms stack properly on mobile

---

### G. Accessibility Audit

#### Keyboard Navigation
```bash
# Test in browser
1. Tab through page
2. All interactive elements should be focusable
3. Focus visible on all elements
4. Keyboard shortcuts should work
5. Tab order should be logical
```

#### Screen Reader Testing
```bash
# Use built-in screen readers
# Windows: Narrator (Win+Alt+Enter)
# Mac: VoiceOver (Cmd+F5)

Test:
1. Page title announced
2. Headings structure proper (h1, h2, h3)
3. Images have alt text
4. Form labels associated with inputs
5. ARIA roles properly used
```

#### Color Contrast
```bash
# Chrome DevTools: Elements > Styles > Contrast ratio
# Target: 4.5:1 for text, 3:1 for large text
# Check dark/light mode both
```

---

### H. Performance Profiling (Chrome DevTools)

#### Identify Long Tasks

1. **Open DevTools > Performance > Settings > Screenshots**

2. **Record 5-10 seconds of normal interaction:**
   - Navigate between pages
   - Scroll through lists
   - Fill forms
   - Submit data

3. **Analyze results:**
   - Look for yellow/red bars (long tasks > 50ms)
   - Check if tasks exceed 200ms
   - Note which components cause delays

4. **Expected Results:**
```
Most tasks: < 50ms ✅
Max task:  < 200ms ✅
No blocking tasks on main thread
```

#### Common Issues
- **Long rendering:** Check React DevTools Profiler
- **Network blocking:** Check Network tab waterfall
- **Heavy computations:** Check useMemo/useCallback implementation

---

## Automated Testing Setup (CI/CD)

### Budget Configuration

Create `lighthouse-budget.json`:
```json
{
  "bundles": [
    {
      "name": "index",
      "budget": [
        {
          "resourceType": "document",
          "budget": 100
        },
        {
          "resourceType": "script",
          "budget": 75
        },
        {
          "resourceType": "stylesheet",
          "budget": 20
        }
      ]
    }
  ]
}
```

### NPM Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:analyze": "ANALYZE=true npm run build",
    "lighthouse": "lighthouse http://localhost:5173 --view",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run build && npm run test"
  }
}
```

---

## Baseline Metrics Documentation

### Before Optimizations (Assumed)
```
Main Bundle:        ~180 KB
Vendor Chunks:      Not optimized
React Renders:      Frequent unnecessary
State Updates:      All-or-nothing
Code Splitting:     None
```

### After Optimizations (Actual)
```
Main Bundle:        62.44 KB gzipped (-65% ✅)
Vendor React:       51.88 KB gzipped
Vendor UI:          37.94 KB gzipped
Vendor Charts:     102.47 KB gzipped (separated)
Total:              271 KB gzipped (-50% expected ✅)
React Renders:      Only on prop changes (memo)
State Updates:      Granular with selectors
Code Splitting:     All routes lazy loaded
```

---

## Continuous Monitoring

### Weekly Performance Checks
1. Run Lighthouse audit → Screenshot
2. Check bundle size in CI
3. Monitor Web Vitals in production (if available)
4. Review error logs for performance issues

### Monthly Review
1. Compare baseline metrics
2. Identify regressions
3. Profile slowest pages
4. Plan next optimizations

### Quarterly Audit
1. Full accessibility audit
2. Mobile testing comprehensive
3. Load testing with realistic data
4. Browser compatibility check

---

## Production Monitoring Setup

### Web Vitals Collection

Create `src/hooks/useWebVitals.ts`:
```typescript
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

export function useWebVitals() {
  // Only track in production
  if (process.env.NODE_ENV === 'production') {
    getCLS(console.log);
    getFCP(console.log);
    getFID(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  }
}
```

### Analytics Integration

Send metrics to analytics:
```typescript
function sendMetric(name: string, value: number) {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics', JSON.stringify({ name, value }));
  }
}
```

---

## Troubleshooting Guide

### Bundle Size Increased
1. Check visualizer for new dependencies
2. Verify tree-shaking (named imports)
3. Look for duplicate dependencies in `package.json`
4. Review recent PR changes

### Performance Score < 90
1. Check Lighthouse report for specific issues
2. Profile with Chrome DevTools
3. Look for:
   - Large images (use WebP)
   - Render-blocking resources
   - Unoptimized fonts
   - Long main thread tasks

### Slow Page Load
1. Check Network tab (DOMContentLoaded/Load)
2. Verify lazy loading working
3. Check API response times
4. Look for N+1 queries

### Memory Leaks
1. Chrome DevTools > Memory > Heap snapshots
2. Compare before/after interaction
3. Look for detached DOM nodes
4. Check for unremoved event listeners

---

## Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals Guide](https://web.dev/vitals/)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [MDN Web Docs - Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)

---

## Validation Completion Checklist

- [ ] Build succeeds with no errors
- [ ] All bundle sizes within targets
- [ ] Lighthouse Performance score ≥ 90
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] LCP ≤ 2.0 seconds
- [ ] INP ≤ 150 milliseconds
- [ ] CLS ≤ 0.05
- [ ] No console errors on first load
- [ ] Mobile responsive (375px, 768px, 1440px)
- [ ] Keyboard navigation works
- [ ] React DevTools shows memoization working
- [ ] Network tab shows lazy loading
- [ ] No memory leaks detected
- [ ] All tests pass

---

## Sign Off

**Test Date:** _____________
**Tested By:** _____________
**Browser/Version:** _____________
**Platform:** _____________

**Results Summary:**
```
Bundle Size:        ✅ / ❌
Lighthouse:         ✅ / ❌
Web Vitals:         ✅ / ❌
Accessibility:      ✅ / ❌
Responsiveness:     ✅ / ❌
Overall Status:     ✅ PASS / ❌ NEEDS WORK
```

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Next Steps After Validation

1. **If all tests pass:**
   - Merge optimization branch
   - Deploy to staging
   - Monitor production metrics
   - Archive baseline data

2. **If issues found:**
   - Document in GitHub issues
   - Prioritize fixes
   - Re-run tests
   - Update metrics

3. **Continuous improvement:**
   - Schedule monthly reviews
   - Monitor Core Web Vitals
   - Plan Phase 6 remaining optimizations
   - Document learnings
