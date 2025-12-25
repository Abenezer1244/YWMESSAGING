const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('1. Navigating to register page...');
    await page.goto('http://localhost:5173/register');
    
    // Wait for page to load
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    console.log('✓ Register page loaded');
    
    // Fill in registration form
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const password = 'TestPassword123!';
    const firstName = 'Test';
    const lastName = 'User';
    const churchName = 'Test Church';
    
    console.log('2. Filling registration form...');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.fill('input[placeholder="First Name"]', firstName);
    await page.fill('input[placeholder="Last Name"]', lastName);
    await page.fill('input[placeholder="Church Name"]', churchName);
    
    console.log('3. Submitting registration form...');
    const registerButton = page.locator('button:has-text("Create Account")').first();
    await registerButton.click();
    
    // Wait for navigation to dashboard
    console.log('4. Waiting for dashboard to load...');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Dashboard URL reached');
    
    // Wait for dashboard content to load (not just spinner)
    await page.waitForSelector('h1:has-text("Welcome back")', { timeout: 10000 });
    console.log('✓ Dashboard content loaded!');
    
    // Check if page is still loading
    const spinner = page.locator('[class*="Loader"]');
    const isVisible = await spinner.isVisible().catch(() => false);
    
    if (isVisible) {
      console.error('✗ Dashboard still showing loading spinner!');
    } else {
      console.log('✓ No loading spinner visible - Dashboard fully loaded!');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'dashboard_test.png', fullPage: true });
    console.log('✓ Screenshot saved to dashboard_test.png');
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
