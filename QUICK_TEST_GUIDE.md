# Quick Visual Testing Guide
**For immediate hands-on testing of https://koinoniasms.com**

---

## Prerequisites

```bash
# Install Playwright if not already installed
cd frontend
npm install @playwright/test@latest
npx playwright install chromium
```

---

## Option 1: Manual Browser Testing (Recommended Now)

### Step 1: Open Production Site
1. Open Chrome/Firefox in Incognito/Private mode
2. Navigate to: **https://koinoniasms.com/register**
3. Open DevTools (F12)
4. Set viewport to **1440 x 900** (Desktop)

### Step 2: Test Registration
```
📝 Test Data:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
First Name:     TestUser
Last Name:      Claude
Email:          test.claude.[CURRENT_TIMESTAMP]@testmail.koinoniasms.dev
                Example: test.claude.1703356800000@testmail.koinoniasms.dev
Password:       TestPassword123!
Confirm:        TestPassword123!
Church Name:    Test Church Claude
```

**Actions:**
1. Fill all fields with test data above
2. Take screenshot (before submit)
3. Click "Create Account"
4. Take screenshot (loading state)
5. Wait for redirect
6. Take screenshot (dashboard)
7. Check DevTools Console for errors

### Step 3: Test Login
1. Click logout (find in sidebar or user menu)
2. Navigate to: **https://koinoniasms.com/login**
3. Enter email and password from registration
4. Click "Login"
5. Verify redirect to dashboard
6. Take screenshot

### Step 4: Test All Pages
Navigate to each URL and take screenshot:

```
✓ https://koinoniasms.com/dashboard
✓ https://koinoniasms.com/branches
✓ https://koinoniasms.com/groups
✓ https://koinoniasms.com/send
✓ https://koinoniasms.com/conversations
✓ https://koinoniasms.com/members
✓ https://koinoniasms.com/templates
✓ https://koinoniasms.com/billing
✓ https://koinoniasms.com/settings
```

**For Each Page:**
- Check if page loads (no blank screen)
- Check DevTools Console (no red errors)
- Take screenshot at 1440px width

### Step 5: Test Responsive
1. Set DevTools Device Toolbar (Cmd+Shift+M / Ctrl+Shift+M)
2. Test viewports:
   - **Desktop:** 1440 x 900
   - **Tablet:** 768 x 1024
   - **Mobile:** 375 x 667 (iPhone SE)

Take screenshots of:
- Registration page (all 3 sizes)
- Login page (all 3 sizes)
- Dashboard (all 3 sizes)

---

## Option 2: Automated Playwright Script

### Create Test Script

Save this as `frontend/test-production.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Production Smoke Test', () => {
  const timestamp = Date.now();
  const testEmail = `test.claude.${timestamp}@testmail.koinoniasms.dev`;
  const testPassword = 'TestPassword123!';

  test('Registration Flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('https://koinoniasms.com/register');
    await page.setViewportSize({ width: 1440, height: 900 });

    // Take screenshot of registration page
    await page.screenshot({
      path: `screenshots/01-registration-page-${timestamp}.png`,
      fullPage: true
    });

    // Fill registration form
    await page.getByLabel('First Name').fill('TestUser');
    await page.getByLabel('Last Name').fill('Claude');
    await page.getByLabel('Church Name').fill('Test Church Claude');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel(/^Password$/).fill(testPassword);
    await page.getByLabel('Confirm Password').fill(testPassword);

    // Screenshot before submit
    await page.screenshot({
      path: `screenshots/02-registration-filled-${timestamp}.png`,
      fullPage: true
    });

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Screenshot dashboard
    await page.screenshot({
      path: `screenshots/03-dashboard-after-registration-${timestamp}.png`,
      fullPage: true
    });

    // Check for success toast
    const hasSuccessToast = await page.locator('text=/registration successful/i').isVisible();
    console.log('✓ Registration successful:', hasSuccessToast);

    // Check console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
  });

  test('Login Flow', async ({ page }) => {
    await page.goto('https://koinoniasms.com/login');
    await page.setViewportSize({ width: 1440, height: 900 });

    // Screenshot login page
    await page.screenshot({
      path: `screenshots/04-login-page-${timestamp}.png`,
      fullPage: true
    });

    // Login with created account
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);

    await page.screenshot({
      path: `screenshots/05-login-filled-${timestamp}.png`,
      fullPage: true
    });

    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.screenshot({
      path: `screenshots/06-dashboard-after-login-${timestamp}.png`,
      fullPage: true
    });

    console.log('✓ Login successful');
  });

  test('Test All Pages', async ({ page, context }) => {
    // First login
    await page.goto('https://koinoniasms.com/login');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    const pages = [
      '/dashboard',
      '/branches',
      '/groups',
      '/send',
      '/conversations',
      '/members',
      '/templates',
      '/billing',
      '/settings'
    ];

    for (const pagePath of pages) {
      console.log(`Testing page: ${pagePath}`);

      await page.goto(`https://koinoniasms.com${pagePath}`);
      await page.waitForLoadState('networkidle');

      // Check for errors
      const pageErrors: string[] = [];
      page.on('pageerror', error => {
        pageErrors.push(error.message);
      });

      // Screenshot
      await page.screenshot({
        path: `screenshots/page-${pagePath.replace('/', '')}-${timestamp}.png`,
        fullPage: true
      });

      // Check if page loaded
      const isBlank = await page.locator('body').textContent() === '';
      console.log(`  ${pagePath}: ${isBlank ? '❌ BLANK' : '✓ Loaded'}`);

      if (pageErrors.length > 0) {
        console.log(`  Errors: ${pageErrors.join(', ')}`);
      }

      // Small delay between pages
      await page.waitForTimeout(500);
    }
  });

  test('Responsive Testing', async ({ page }) => {
    // Login first
    await page.goto('https://koinoniasms.com/login');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    const viewports = [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    const testPages = ['/register', '/login', '/dashboard'];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const testPage of testPages) {
        await page.goto(`https://koinoniasms.com${testPage}`);
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: `screenshots/${testPage.replace('/', '')}-${viewport.name}-${timestamp}.png`,
          fullPage: true
        });

        console.log(`✓ ${testPage} @ ${viewport.name} (${viewport.width}x${viewport.height})`);
      }
    }
  });

  test('Console Errors Check', async ({ page }) => {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', request => {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Login and navigate through app
    await page.goto('https://koinoniasms.com/login');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate through pages
    const pages = ['/dashboard', '/members', '/send', '/conversations'];
    for (const p of pages) {
      await page.goto(`https://koinoniasms.com${p}`);
      await page.waitForTimeout(1000);
    }

    // Report errors
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ERROR REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Console Errors: ${consoleErrors.length}`);
    consoleErrors.forEach(err => console.log(`  ❌ ${err}`));
    console.log(`\nNetwork Errors: ${networkErrors.length}`);
    networkErrors.forEach(err => console.log(`  ❌ ${err}`));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});
```

### Run the Test

```bash
# Create screenshots directory
cd frontend
mkdir -p screenshots

# Run the test
npx playwright test test-production.spec.ts --headed

# Generate HTML report
npx playwright show-report
```

---

## Option 3: Using Playwright Codegen (Interactive)

### Record Your Test Session

```bash
cd frontend

# Start recording
npx playwright codegen https://koinoniasms.com/register
```

**This will:**
1. Open browser with Playwright Inspector
2. Record all your actions
3. Generate test code automatically
4. Take screenshots on command

**Actions to perform:**
1. Fill registration form
2. Submit
3. Navigate to login
4. Login
5. Navigate through all pages
6. Click around to test interactions

The generated code can be saved and reused.

---

## What to Capture

### Screenshots Needed
```
01-registration-page-empty.png
02-registration-page-filled.png
03-registration-loading.png
04-dashboard-after-registration.png
05-login-page.png
06-login-filled.png
07-dashboard-after-login.png
08-page-branches.png
09-page-groups.png
10-page-send.png
11-page-conversations.png
12-page-members.png
13-page-templates.png
14-page-billing.png
15-page-settings.png
16-registration-tablet.png
17-registration-mobile.png
18-dashboard-tablet.png
19-dashboard-mobile.png
```

### Console Logs to Capture
For each page, note:
- ❌ Errors (red)
- ⚠️ Warnings (yellow)
- Failed network requests
- CSRF token fetch status

### Data to Record
```yaml
Test Execution:
  Date: [DATE]
  Time: [TIME]
  Browser: Chrome/Firefox/Safari
  Version: [VERSION]

Registration:
  Email Used: [EMAIL]
  Success: Yes/No
  Time to Complete: [SECONDS]
  Errors: [LIST]

Login:
  Success: Yes/No
  Redirect Time: [SECONDS]
  Errors: [LIST]

Page Load Times:
  /dashboard: [SECONDS]
  /branches: [SECONDS]
  /groups: [SECONDS]
  /send: [SECONDS]
  /conversations: [SECONDS]
  /members: [SECONDS]
  /templates: [SECONDS]
  /billing: [SECONDS]
  /settings: [SECONDS]

Issues Found:
  - [ISSUE 1]
  - [ISSUE 2]
  - [ISSUE 3]
```

---

## Expected Results

### Registration Page
✅ Should see:
- Logo
- "Create Your Account" headline
- 6 form fields
- "Create Account" button
- Google/Apple OAuth buttons
- "Login here" link
- 3 trust indicators

❌ Should NOT see:
- Console errors
- Broken images
- Missing styles

### Login Page
✅ Should see:
- Logo
- "Welcome Back" headline
- Email and password fields
- "Login" button
- OAuth buttons
- "Sign up" link

### Dashboard (Post-Login)
✅ Should see:
- Navigation sidebar
- Dashboard content
- User info/menu
- No loading spinners (after load)

❌ Should NOT see:
- Blank page
- Infinite loading
- Console errors

### All Pages
✅ Should:
- Load within 3 seconds
- Show content (not blank)
- Have no console errors
- Be responsive at all viewports

---

## Quick Commands Reference

```bash
# Install Playwright
npm install @playwright/test@latest
npx playwright install

# Run test with UI
npx playwright test --ui

# Run test in headed mode (see browser)
npx playwright test --headed

# Debug test
npx playwright test --debug

# Generate test code interactively
npx playwright codegen https://koinoniasms.com

# Run specific test file
npx playwright test test-production.spec.ts

# Show test report
npx playwright show-report

# Take screenshot from command line (using Node)
node -e "
const playwright = require('playwright');
(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://koinoniasms.com/register');
  await page.screenshot({ path: 'registration.png', fullPage: true });
  await browser.close();
})();
"
```

---

## Reporting Issues

When you find an issue, document:

```markdown
### Issue: [Short Description]

**Page:** [URL]
**Severity:** Critical / High / Medium / Low
**Browser:** [Browser + Version]
**Viewport:** [Width x Height]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshot:**
[Attach screenshot]

**Console Errors:**
```
[Paste console errors]
```

**Network Errors:**
[List failed requests]
```

---

## Next Steps After Testing

1. **Compile Results**
   - Gather all screenshots
   - Document all console errors
   - List all bugs found
   - Create summary report

2. **Prioritize Issues**
   - Critical: Blocks core functionality
   - High: Impacts user experience
   - Medium: Minor issues
   - Low: Cosmetic/polish

3. **Create GitHub Issues**
   - One issue per bug
   - Include screenshots
   - Add labels (bug, ui, critical, etc.)

4. **Run Automated Tests**
   - Set up Playwright config
   - Run full E2E suite
   - Schedule regular test runs

---

**Ready to Test?**

Start with Option 1 (Manual) for immediate results, then set up Option 2 (Automated) for ongoing testing.

Good luck! 🚀
