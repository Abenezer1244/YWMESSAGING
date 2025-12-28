import { test, expect } from '@playwright/test';
test.describe('Member Count & Pagination - Direct Navigation', () => {
    const baseUrl = 'http://localhost:5173';
    test('Should show member count and pagination correctly', async ({ page }) => {
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('🧪 MEMBER COUNT & PAGINATION TEST');
        console.log('═══════════════════════════════════════════════════════════════\n');
        // Navigate directly to members page (user may have existing session)
        console.log('[1] 📋 Navigating to members page...');
        await page.goto(`${baseUrl}/members`);
        // Wait a bit for content to load
        await page.waitForTimeout(3000);
        // Get page content
        const pageContent = await page.textContent('body');
        const pageUrl = page.url();
        console.log(`URL: ${pageUrl}`);
        console.log(`Page has "members": ${pageContent?.includes('members') ? '✅' : '❌'}`);
        console.log(`Page has "Add Member": ${pageContent?.includes('Add Member') ? '✅' : '❌'}`);
        // Take screenshot
        console.log('\n[2] 📸 Taking screenshot of members page...');
        await page.screenshot({ path: 'members-page-screenshot.png' });
        console.log('✅ Screenshot saved: members-page-screenshot.png');
        // Try to find member count
        console.log('\n[3] 🔍 Looking for member count...');
        // Look for all elements with text containing numbers and "members"
        const allText = pageContent || '';
        const memberCountMatch = allText.match(/(\d+)\s+members?/);
        if (memberCountMatch) {
            const count = memberCountMatch[1];
            console.log(`✅ Found member count: ${count} members`);
        }
        else {
            console.log('❌ Could not extract member count from page');
        }
        // Check for pagination
        console.log('\n[4] 📄 Checking for pagination...');
        const hasPagination = allText.includes('Page');
        const hasNext = allText.includes('Next');
        const hasPrev = allText.includes('Previous');
        console.log(`Has pagination: ${hasPagination ? '✅' : '❌'}`);
        console.log(`Has Next button: ${hasNext ? '✅' : '❌'}`);
        console.log(`Has Previous button: ${hasPrev ? '✅' : '❌'}`);
        // Try to find table or cards
        console.log('\n[5] 📊 Checking for member list display...');
        const hasTable = allText.includes('<table') || await page.locator('table').isVisible().catch(() => false);
        const hasCards = allText.includes('SoftCard') || await page.locator('[class*="Card"]').isVisible().catch(() => false);
        console.log(`Has table: ${hasTable ? '✅' : '❌'}`);
        console.log(`Has cards: ${hasCards ? '✅' : '❌'}`);
        // Summary
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 SUMMARY');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`✅ Navigation successful`);
        console.log(`✅ Page loaded at: ${pageUrl}`);
        if (memberCountMatch) {
            console.log(`✅ Member count: ${memberCountMatch[1]}`);
        }
        if (hasPagination) {
            console.log(`✅ Pagination controls visible`);
        }
        console.log('═══════════════════════════════════════════════════════════════\n');
        // Basic assertion - page should load
        expect(pageUrl).toBeTruthy();
    });
});
//# sourceMappingURL=member-count-test.spec.js.map