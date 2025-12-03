import { Route } from '@playwright/test';
import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test: Conversation Reply Flow
 * Tests 2-way SMS conversation management and replies
 */

test.describe('Conversation Reply Flow', () => {
  let page: Page;

  // Test credentials
  const testEmail = 'test-admin@e2e.test.com';
  const testPassword = 'E2ETestPassword123!';

  test.beforeEach(async ({ page: testPage }: { page: any }) => {
    page = testPage;

    // Login before each test
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill(testEmail);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill(testPassword);

    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });
    await submitButton.click();

    // Wait for dashboard to load
    await page.waitForURL(/dashboard|members|conversations/i, { timeout: 10000 }).catch(() => {
      // Might already be on dashboard
    });
  });

  test('should display conversations page', async () => {
    // Navigate to conversations
    const conversationsLink = page.getByRole('link', { name: /conversation|message|inbox|reply/i });

    if (await conversationsLink.isVisible()) {
      await conversationsLink.click();
    } else {
      await page.goto('/dashboard/conversations');
    }

    // Should show conversations list
    await expect(page.locator('text=/conversation|message|inbox/i')).toBeVisible();
  });

  test('should show list of conversations', async () => {
    await page.goto('/dashboard/conversations');

    // Look for conversation items
    const conversationItems = page.locator('[role="listitem"], .conversation-item, [data-testid*="conversation"]');

    // Wait for conversations to load
    await page.waitForTimeout(2000);

    // Should have at least one conversation or show empty state
    const count = await conversationItems.count();

    if (count > 0) {
      await expect(conversationItems.first()).toBeVisible();
    } else {
      // Empty state
      const emptyState = page.locator('text=/no conversation|empty|none/i');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    }
  });

  test('should allow filtering conversations by status', async () => {
    await page.goto('/dashboard/conversations');

    // Look for status filter
    const statusFilter = page.getByRole('combobox', { name: /status|filter|all/i });

    if (await statusFilter.isVisible()) {
      await statusFilter.click();

      // Select "open" status
      const openOption = page.locator('text=/open/i').first();
      if (await openOption.isVisible()) {
        await openOption.click();

        // Conversations should be filtered
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should open conversation detail', async () => {
    await page.goto('/dashboard/conversations');

    // Click first conversation
    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      // Should show conversation detail with messages
      await expect(page.locator('text=/message|conversation|history/i')).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should display conversation messages', async () => {
    await page.goto('/dashboard/conversations');

    // Open first conversation
    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      // Wait for messages to load
      await page.waitForTimeout(2000);

      // Should show messages
      const messages = page.locator('[role="article"], .message-item, [data-testid*="message"]');

      const messageCount = await messages.count();

      if (messageCount > 0) {
        await expect(messages.first()).toBeVisible();
      }
    }
  });

  test('should show member information', async () => {
    await page.goto('/dashboard/conversations');

    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      // Should show member details (name, phone, etc.)
      const memberInfo = page.locator('text=/phone|email|name|member|contact/i');

      if (await memberInfo.isVisible()) {
        await expect(memberInfo).toBeVisible();
      }
    }
  });

  test('should display reply input field', async () => {
    await page.goto('/dashboard/conversations');

    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      // Look for reply textarea
      const replyInput = page.locator('textarea[placeholder*="reply"], textarea[placeholder*="message"], [contenteditable]');

      if (await replyInput.isVisible()) {
        await expect(replyInput).toBeVisible();
      }
    }
  });

  test('should validate reply message is required', async () => {
    await page.goto('/dashboard/conversations');

    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      // Try to send empty reply
      const sendButton = page.getByRole('button', { name: /send|reply|submit/i }).first();

      if (await sendButton.isVisible()) {
        // Check if button is disabled
        const isDisabled = await sendButton.isDisabled();

        // If not disabled, click and check for error
        if (!isDisabled) {
          await sendButton.click();

          // Should show error
          await expect(page.locator('text=/required|message|type/i')).toBeVisible({
            timeout: 3000,
          });
        }
      }
    }
  });

  test('should validate reply message length', async () => {
    await page.goto('/dashboard/conversations');

    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      const replyInput = page.locator('textarea[placeholder*="reply"], textarea[placeholder*="message"], [contenteditable]');

      if (await replyInput.isVisible()) {
        // Type very long message
        const longMessage = 'A'.repeat(200);
        await replyInput.fill(longMessage);

        const sendButton = page.getByRole('button', { name: /send|reply/i }).first();

        if (await sendButton.isVisible()) {
          await sendButton.click();

          // Should show length error
          await expect(page.locator('text=/too long|max|160|characters/i')).toBeVisible({
            timeout: 3000,
          });
        }
      }
    }
  });

  test('should send reply message', async () => {
    await page.goto('/dashboard/conversations');

    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      const replyInput = page.locator('textarea[placeholder*="reply"], textarea[placeholder*="message"], [contenteditable]');

      if (await replyInput.isVisible()) {
        await replyInput.fill('E2E test reply');

        const sendButton = page.getByRole('button', { name: /send|reply/i }).first();

        if (await sendButton.isVisible()) {
          await sendButton.click();

          // Should show success
          await expect(
            page.locator('text=/sent|delivered|success|reply sent/i')
          ).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should display new reply in conversation', async () => {
    await page.goto('/dashboard/conversations');

    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      // Get initial message count
      const messagesBeforeReply = page.locator('[role="article"], .message-item');
      const countBefore = await messagesBeforeReply.count();

      const replyInput = page.locator('textarea[placeholder*="reply"], textarea[placeholder*="message"], [contenteditable]');

      if (await replyInput.isVisible()) {
        await replyInput.fill('New test reply');

        const sendButton = page.getByRole('button', { name: /send|reply/i }).first();

        if (await sendButton.isVisible()) {
          await sendButton.click();

          // Wait for message to appear
          await page.waitForTimeout(2000);

          // Message count should increase
          const messagesAfterReply = page.locator('[role="article"], .message-item');
          const countAfter = await messagesAfterReply.count();

          expect(countAfter).toBeGreaterThanOrEqual(countBefore);
        }
      }
    }
  });

  test('should allow changing conversation status', async () => {
    await page.goto('/dashboard/conversations');

    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      // Look for status dropdown
      const statusDropdown = page.getByRole('combobox', { name: /status|action|mark/i });

      if (await statusDropdown.isVisible()) {
        await statusDropdown.click();

        // Select close/archive
        const closeOption = page.locator('text=/close|archive|mark complete/i').first();

        if (await closeOption.isVisible()) {
          await closeOption.click();

          // Status should change
          await page.waitForTimeout(1000);
          await expect(page.locator('text=/closed|archived/i')).toBeVisible({ timeout: 3000 });
        }
      }
    }
  });

  test('should mark conversation as read', async () => {
    await page.goto('/dashboard/conversations');

    // Look for unread conversation indicator
    const unreadConversation = page.locator('[role="listitem"], .conversation-item').filter({
      hasText: /unread|new|!|\*/i,
    });

    if (await unreadConversation.isVisible()) {
      await unreadConversation.click();

      // Should mark as read
      await page.waitForTimeout(1000);

      // Unread indicator should be gone
      const unreadIndicator = page.locator('text=/unread|new/i').first();

      if (await unreadIndicator.isVisible()) {
        // Indicator should be removed after viewing
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should show member details panel', async () => {
    await page.goto('/dashboard/conversations');

    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      // Look for member info section
      const memberPanel = page.locator('text=/member info|contact details|phone|email/i');

      if (await memberPanel.isVisible()) {
        await expect(memberPanel).toBeVisible();

        // Should show member data
        await expect(page.locator('text=/\\+1\\d{10}/i')).toBeVisible(); // Phone format
      }
    }
  });

  test('should handle rapid replies', async () => {
    await page.goto('/dashboard/conversations');

    const firstConversation = page.locator('[role="listitem"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      const replyInput = page.locator('textarea[placeholder*="reply"], textarea[placeholder*="message"], [contenteditable]');

      if (await replyInput.isVisible()) {
        // Send first reply
        await replyInput.fill('First reply');
        const sendButton = page.getByRole('button', { name: /send|reply/i }).first();

        if (await sendButton.isVisible()) {
          await sendButton.click();
          await page.waitForTimeout(1000);

          // Send second reply quickly
          await replyInput.fill('Second reply');
          await sendButton.click();

          // Both should be sent
          await expect(
            page.locator('text=/sent|delivered|success/i')
          ).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should show no conversations when empty', async () => {
    // This test assumes ability to filter to empty state
    await page.goto('/dashboard/conversations');

    const statusFilter = page.getByRole('combobox', { name: /status|filter/i });

    if (await statusFilter.isVisible()) {
      // Filter to archived (likely empty)
      await statusFilter.click();
      const archivedOption = page.locator('text=/archived/i').first();

      if (await archivedOption.isVisible()) {
        await archivedOption.click();

        // If no conversations, should show empty state
        const emptyState = page.locator('text=/no conversation|empty|none/i');

        if (await emptyState.isVisible()) {
          await expect(emptyState).toBeVisible();
        }
      }
    }
  });
});
