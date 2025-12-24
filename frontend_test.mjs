import { chromium } from 'playwright';

const BASE_URL = 'https://koinoniasms.com';

const pages = [
  '/',
  '/login',
  '/register',
  '/pricing',
  '/about',
];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🧪 Starting Frontend Comprehensive Test Suite\n');

  const errorsByPage = {};

  // Test public pages
  console.log('📄 Testing Public Pages...');
  for (const path of pages) {
    try {
      const pageErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text());
        }
      });

      await page.goto(BASE_URL + path, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const title = await page.title();
      console.log(`✅ ${path} - Title: "${title}"`);

      if (pageErrors.length > 0) {
        console.log(`   ⚠️  Console Errors:`);
        pageErrors.forEach(err => console.log(`      - ${err}`));
        errorsByPage[path] = pageErrors;
      }
    } catch (error) {
      console.log(`❌ ${path} - ${error.message}`);
      errorsByPage[path] = [error.message];
    }
  }

  // Test Login form structure
  console.log('\n🔐 Testing Login Form...');
  try {
    await page.goto(BASE_URL + '/login', { waitUntil: 'domcontentloaded', timeout: 10000 });

    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');

    if (!emailInput || !passwordInput || !submitButton) {
      console.log('❌ Login form elements missing');
    } else {
      console.log('✅ Login form fully loaded');
      console.log('   ✅ Email input found');
      console.log('   ✅ Password input found');
      console.log('   ✅ Submit button found');
    }
  } catch (error) {
    console.log(`❌ Login page error: ${error.message}`);
  }

  // Test Registration form structure
  console.log('\n📝 Testing Registration Form...');
  try {
    await page.goto(BASE_URL + '/register', { waitUntil: 'domcontentloaded', timeout: 10000 });

    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');

    console.log(`✅ Registration page loaded with ${inputs.length} input fields`);
    if (submitButton) {
      console.log('   ✅ Submit button found');
    } else {
      console.log('   ❌ Submit button missing');
    }
  } catch (error) {
    console.log(`❌ Registration page error: ${error.message}`);
  }

  console.log('\n📊 Test Summary');
  console.log(`Total pages tested: ${pages.length}`);
  const totalErrors = Object.values(errorsByPage).flat().length;
  console.log(`Total console errors found: ${totalErrors}`);

  if (totalErrors > 0) {
    console.log('\n⚠️  Errors by page:');
    for (const [path, errors] of Object.entries(errorsByPage)) {
      if (errors.length > 0) {
        console.log(`  ${path}: ${errors.length} error(s)`);
        errors.slice(0, 2).forEach(err => console.log(`    - ${err.substring(0, 80)}`));
      }
    }
  }

  await browser.close();
  console.log('\n✨ Test suite completed!');
}

main().catch(console.error);
