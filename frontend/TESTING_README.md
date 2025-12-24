# Frontend Testing Tools

This directory contains automated testing tools for the Koinonia SMS application.

---

## Quick Start - Run Production Tests Now

```bash
# Make sure you're in the frontend directory
cd "C:\Users\Windows\OneDrive - Seattle Colleges\Desktop\YWMESSAGING\frontend"

# Run the automated screenshot tool (Playwright is already installed)
node screenshot-production.js
```

This will:
1. Open Chrome browser (you'll see it)
2. Test registration, login, and all pages
3. Capture screenshots at multiple viewports
4. Generate a test report
5. Save everything to `screenshots/` directory

**Time:** 3-5 minutes
**Output:** Screenshots + test report

---

## What Gets Tested

### 1. Registration Flow
- Page load and form display
- Form validation (empty fields, email format, password length)
- Password mismatch detection
- Successful account creation
- Redirect to dashboard

### 2. Login Flow
- Page load and form display
- Form validation
- Login with created account
- Redirect to dashboard
- Session storage

### 3. All Pages (Post-Login)
- /dashboard
- /branches
- /groups
- /send
- /conversations
- /members
- /templates
- /billing
- /settings

### 4. Responsive Design
Tests all viewports:
- Desktop: 1440 x 900
- Tablet: 768 x 1024
- Mobile: 375 x 667

### 5. Error Monitoring
- Console errors
- Network failures
- JavaScript exceptions

---

## Screenshot Naming Convention

Screenshots are saved with timestamps:

```
01-registration-page-[timestamp].png
02-registration-filled-[timestamp].png
03-dashboard-after-registration-[timestamp].png
04-login-page-[timestamp].png
05-login-filled-[timestamp].png
06-dashboard-after-login-[timestamp].png
07-page-dashboard-[timestamp].png
07-page-branches-[timestamp].png
... (all pages)
responsive-register-desktop-[timestamp].png
responsive-register-tablet-[timestamp].png
responsive-register-mobile-[timestamp].png
... (all responsive views)
```

---

## Test Report

After running, check the test report:

```
screenshots/test-report-[timestamp].txt
```

**Contains:**
- Registration status (PASSED/FAILED)
- Login status (PASSED/FAILED)
- Page load results for all 9 pages
- Screenshot count and location
- Test email and password used

---

## Customization

Edit `screenshot-production.js` to customize:

```javascript
// Change base URL
const BASE_URL = 'https://koinoniasms.com';

// Change viewports
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};

// Add/remove pages to test
const PAGES = [
  '/dashboard',
  '/branches',
  // ... add more
];

// Change browser settings
browser = await playwright.chromium.launch({
  headless: false,  // Set to true for headless mode
  slowMo: 500      // Adjust speed (lower = faster)
});
```

---

## Troubleshooting

### Issue: "playwright not found"

```bash
npm install playwright
npx playwright install chromium
```

### Issue: "Cannot find module"

```bash
npm install
```

### Issue: Rate limit error during registration

**Cause:** Too many registration attempts from same IP

**Solution:**
1. Wait 1 hour
2. Test from different IP/network
3. Or manually create account and update script to skip registration

### Issue: Screenshots are blank

**Possible causes:**
- Page didn't load (check network)
- Authentication failed (check console output)
- Timeout too short (increase wait times in script)

**Fix:**
1. Check console output for errors
2. Increase timeout values
3. Run with `slowMo: 1000` for slower execution

### Issue: Browser doesn't open

**Cause:** Headless mode enabled

**Fix:**
Edit script, change:
```javascript
headless: false  // Make sure this is false
```

---

## Advanced Usage

### Run Headless (No Browser Window)

Edit `screenshot-production.js`:
```javascript
headless: true  // Line ~71
```

### Change Browser Speed

```javascript
slowMo: 1000  // Slower (1 second delay between actions)
slowMo: 100   // Faster
```

### Test Local Development

```javascript
const BASE_URL = 'http://localhost:5173';
```

### Skip Registration (Use Existing Account)

Comment out registration test:
```javascript
// const registrationSuccess = await testRegistration(page);
const registrationSuccess = false;

// Update TEST_EMAIL and TEST_PASSWORD with existing account
const TEST_EMAIL = 'your-existing@email.com';
const TEST_PASSWORD = 'YourPassword123!';
```

---

## Continuous Testing

### Option A: Manual Runs

Run before each deployment:
```bash
node screenshot-production.js
```

### Option B: Scheduled Tests

**Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Set schedule (daily, weekly, etc.)
4. Action: Start a program
   - Program: `node`
   - Arguments: `screenshot-production.js`
   - Start in: `C:\Users\Windows\OneDrive - Seattle Colleges\Desktop\YWMESSAGING\frontend`

**Cron (Linux/Mac):**
```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/frontend && node screenshot-production.js
```

### Option C: CI/CD Integration

Add to GitHub Actions, GitLab CI, etc.:

```yaml
name: Visual Regression Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node screenshot-production.js
      - uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: frontend/screenshots/
```

---

## Comparing Screenshots

### Visual Regression Testing

1. **Baseline:** Run tests and save screenshots
2. **After Changes:** Run tests again
3. **Compare:** Use image comparison tools

**Tools:**
- **ImageMagick:** `compare baseline.png current.png diff.png`
- **Playwright Compare:** Built-in screenshot comparison
- **Percy.io:** Visual regression service
- **Applitools:** AI-powered visual testing

### Manual Comparison

Use any image viewer to compare:
1. Open baseline screenshot
2. Open current screenshot
3. Look for differences side-by-side

---

## E2E Test Suite (Future)

To create a full Playwright test suite:

### 1. Create Playwright Config

Create `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  use: {
    baseURL: 'https://koinoniasms.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

### 2. Create Test Files

See `src/__tests__/e2e/login.e2e.test.ts` for example.

### 3. Run Tests

```bash
npx playwright test
npx playwright test --ui
npx playwright show-report
```

---

## Best Practices

### Before Testing
1. Clear browser cache
2. Use incognito/private mode for manual tests
3. Check internet connection
4. Ensure production site is accessible

### During Testing
1. Monitor console output
2. Watch for errors in browser DevTools
3. Note unexpected behavior
4. Document any issues immediately

### After Testing
1. Review all screenshots
2. Check test report
3. Document bugs found
4. Share results with team
5. Archive screenshots for comparison

---

## Screenshot Analysis Checklist

For each screenshot, verify:

- [ ] Page loaded (not blank)
- [ ] No visual glitches
- [ ] Correct layout
- [ ] All elements visible
- [ ] Proper spacing
- [ ] Consistent fonts
- [ ] Working buttons/links
- [ ] No console errors
- [ ] Responsive at all sizes
- [ ] No horizontal scroll

---

## Test Data

The script creates a unique test account each run:

```
Email: test.claude.[TIMESTAMP]@testmail.koinoniasms.dev
Password: TestPassword123!
First Name: TestUser
Last Name: Claude
Church Name: Test Church Claude
```

**Note:** Each test creates a new account. You may want to clean up test accounts periodically.

---

## Performance Metrics

Track these metrics:

- **Page Load Time:** How long until interactive
- **Registration Time:** Submit to dashboard redirect
- **Login Time:** Submit to dashboard redirect
- **Image Load Time:** How long for images to appear
- **First Contentful Paint:** Time to first visible element

Add timing code to script:
```javascript
const startTime = Date.now();
await page.goto(url);
const loadTime = Date.now() - startTime;
console.log(`Page loaded in ${loadTime}ms`);
```

---

## Integration with Monitoring

Send results to monitoring tools:

### Sentry
```javascript
const Sentry = require('@sentry/node');
Sentry.captureMessage('E2E test failed', {
  level: 'error',
  extra: { screenshots: screenshotPaths }
});
```

### Slack
```javascript
const webhook = 'your-slack-webhook-url';
await fetch(webhook, {
  method: 'POST',
  body: JSON.stringify({
    text: `E2E Tests: ${results.passed}/${results.total} passed`
  })
});
```

---

## Resources

- **Playwright Docs:** https://playwright.dev
- **Visual Testing Guide:** https://playwright.dev/docs/test-snapshots
- **Best Practices:** https://playwright.dev/docs/best-practices
- **CI/CD Integration:** https://playwright.dev/docs/ci

---

## Support

Questions or issues? Check:

1. **Console output** - Most errors are logged here
2. **Test report** - Shows which tests failed
3. **Screenshots** - Visual evidence of issues
4. **Main testing docs** - See parent directory README files

---

**Quick Start Reminder:**

```bash
cd frontend
node screenshot-production.js
```

That's it! Screenshots will be in `screenshots/` directory.
