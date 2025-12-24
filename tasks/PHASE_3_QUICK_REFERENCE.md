# Phase 3 - Quick Reference Guide

## 🚀 For Developers

### Before Submitting a Frontend PR

```bash
cd frontend

# Build and validate locally
npm run build
npm run lighthouse:validate

# Look for this output:
# ✅ All assertions passed → Ready to submit PR
# ❌ Assertions failed → Fix issues before PR
```

### If Lighthouse Fails on PR

1. **Read PR Comment** - Shows which metrics failed
2. **Click Report Link** - Opens detailed Lighthouse report
3. **Find Issues** - Lighthouse identifies specific problems
4. **Apply Fix** - Common fixes:
   - Remove large imports → Use `React.lazy()`
   - Unoptimized images → Compress or convert to WebP
   - Long JavaScript → Code-split or lazy-load
   - Accessibility issues → Add alt text, ARIA labels
5. **Push Changes** - Workflow runs automatically
6. **Verify** - Check PR comment again

---

## 📊 Performance Budgets

### Must Meet These Thresholds
- **Performance Score**: ≥ 80
- **Accessibility Score**: ≥ 90
- **Best Practices**: ≥ 80
- **SEO Score**: ≥ 85
- **FCP**: ≤ 2.5 seconds
- **LCP**: ≤ 3.0 seconds
- **CLS**: ≤ 0.1
- **TBT**: ≤ 200ms

### What Impacts Scores Most
| Change | Impact | Severity |
|--------|--------|----------|
| Add 100KB JavaScript | -5 to -10 points | 🔴 High |
| Add large image | -5 to -10 points | 🔴 High |
| Unoptimized font | -3 to -5 points | 🟡 Medium |
| Missing alt text | -1 to -3 points | 🟡 Medium |
| Use React.lazy() | +5 to +10 points | 🟢 Good |
| Compress images | +2 to +5 points | 🟢 Good |

---

## 🔧 Common Solutions

### Problem: Performance Score Too Low

**Step 1**: Identify the issue
```bash
npx lighthouse http://localhost:3000 --output html > report.html
open report.html
```

**Step 2**: Apply fix (most common)
```typescript
// ❌ Before: Imports library upfront
import { HeavyComponent } from 'heavy-library';

// ✅ After: Lazy-loads on demand
const HeavyComponent = lazy(() => import('heavy-library'));

// Usage: Wrap in Suspense
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### Problem: Accessibility Score Too Low

**Common fixes**:
```tsx
// ❌ Before
<img src="chart.png" />
<button>Click</button>

// ✅ After
<img src="chart.png" alt="Sales chart by region" />
<button aria-label="Open menu">☰</button>

// Color contrast
<div style={{ color: '#666666', background: 'white' }}>Text</div>
// ^^ Check contrast ratio (aim for 4.5:1 for normal text)
```

### Problem: SEO Score Too Low

**Common fixes**:
```tsx
// Add meta tags
<head>
  <title>Koinoniasms - Church Messaging Platform</title>
  <meta name="description" content="Send SMS/MMS to your congregation" />
  <meta property="og:title" content="Koinoniasms" />
  <meta property="og:description" content="Church messaging" />
</head>

// Use semantic HTML
<article>
  <h1>Main heading</h1>
  <p>Content...</p>
</article>
```

---

## 📈 Monitoring Your Changes

### Check Performance Trends
1. Open PR on main branch
2. Scroll down to Lighthouse comment
3. Review scores compared to baseline
4. Look for ↓ (regression) vs ↑ (improvement)

### Expected Improvements After Phase 3.1
- Dashboard load: ~1-2 seconds faster
- Performance score: +5 points
- FCP: -500ms to -1000ms

---

## 🐛 Troubleshooting

### Q: "Performance score dropped unexpectedly"
**A**: Check what changed
- Check bundle size diff
- Review new imports
- Look for large images
- Use `npm run lighthouse:validate`

### Q: "Accessibility score failed"
**A**: Common issues
- Missing image alt text → Add alt=""
- Color contrast too low → Use higher contrast
- Form labels missing → Add <label> elements
- Interactive elements not keyboard accessible → Test Tab key

### Q: "SEO score is low"
**A**: Common issues
- Missing meta tags → Add to <head>
- No H1 tag → Add one at top
- Mobile not responsive → Test on mobile
- Links not crawlable → Use <a> tags

### Q: "Build passes locally but fails in CI"
**A**: Likely causes
- Different Node version → Pin version in CI
- Node modules cache issue → Clear cache
- Network issue → Check CI logs
- Timeout issue → Increase timeout

---

## 📚 Documentation

### For Complete Details
- **Bundle Optimization**: See `PHASE_3_OPTIMIZATION_PROGRESS.md`
- **Lighthouse CI Setup**: See `LIGHTHOUSE_CI_SETUP.md`
- **Overall Summary**: See `PHASE_3_SUMMARY.md`
- **Phase Completion**: See `PHASE_3_FINAL_SUMMARY.md`

### External References
- [Lighthouse Scoring](https://web.dev/lighthouse-scoring/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Web Performance](https://web.dev/performance/)
- [Accessibility](https://web.dev/accessibility/)

---

## ✅ Deployment Checklist

Before merging to main:

- [ ] Local lighthouse passes: `npm run lighthouse:validate`
- [ ] No new console errors in dev tools
- [ ] Mobile responsive tested
- [ ] Accessibility tested (Tab key works)
- [ ] All images have alt text
- [ ] No new large dependencies added
- [ ] PR comment shows ✅ all metrics pass

---

## 🎯 Performance Goals

### By Page
| Page | FCP Target | LCP Target | Performance Target |
|------|-----------|-----------|-------------------|
| Dashboard | ≤ 1.5s | ≤ 2.0s | ≥ 85 |
| Analytics | ≤ 2.0s* | ≤ 2.5s* | ≥ 80 |
| Messages | ≤ 1.5s | ≤ 2.0s | ≥ 85 |
| Landing | ≤ 2.0s | ≤ 2.5s | ≥ 80 |

*Includes lazy-loaded Recharts

---

## Commands Reference

### Run All
```bash
cd frontend
npm run lighthouse           # Full pipeline
```

### Run Specific
```bash
cd frontend
npm run build              # Build only
npm run lighthouse:validate # Local validation
```

### Debug Locally
```bash
cd frontend
npm run dev              # Dev server
npx lighthouse http://localhost:3000 --output html > report.html
open report.html       # View detailed report
```

---

## Team Responsibilities

### Frontend Developers
- ✅ Run local validation before PR
- ✅ Fix failing metrics
- ✅ Keep bundle size minimal
- ✅ Optimize images
- ✅ Ensure accessibility

### DevOps Team
- ✅ Monitor CI failures
- ✅ Track metric trends
- ✅ Adjust thresholds if needed
- ✅ Alert on regressions

### Product Team
- ✅ Review performance impact
- ✅ Understand trade-offs
- ✅ Make feature vs. speed decisions

---

**Last Updated**: December 2, 2024
**Status**: Active & Monitoring
**Support**: See full documentation files linked above
