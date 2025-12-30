import { getRegistryPrisma, getTenantPrisma } from '../lib/tenant-prisma.js';
import * as messageService from '../services/message.service.js';
import * as recurringService from '../services/recurring.service.js';
import { withJobLock } from '../services/lock.service.js';

/**
 * Check for recurring messages that are due and send them
 * Run periodically (every 1-5 minutes)
 * ✅ PHASE 2: Uses distributed lock to prevent duplicate execution on multi-server setup
 * ✅ Database-per-tenant: Iterates over all tenants to check their recurring messages
 */
export async function processRecurringMessages() {
  // Use distributed lock to ensure only one server runs this job
  const result = await withJobLock('recurring-messages', async () => {
    try {
      const now = new Date();
      const registryPrisma = getRegistryPrisma();

      // Get all active tenants
      const tenants = await registryPrisma.tenant.findMany({
        where: { status: 'active' },
      });

      console.log(`Checking recurring messages for ${tenants.length} active tenants`);

      for (const tenant of tenants) {
        try {
          const tenantPrisma = await getTenantPrisma(tenant.id);

          // Find all active recurring messages that are due for this tenant
          const dueMessages = await tenantPrisma.recurringMessage.findMany({
            where: {
              isActive: true,
              nextSendAt: {
                lte: now,
              },
            },
          });

          if (dueMessages.length === 0) continue;

          console.log(`Processing ${dueMessages.length} due recurring messages for tenant ${tenant.id}`);

          for (const recMessage of dueMessages) {
            try {
              const tenantId = tenant.id;

          // Parse target IDs
          const targetIds = recMessage.targetIds ? JSON.parse(recMessage.targetIds) : [];

          // Create and send message
          const message = await messageService.createMessage(tenantId, tenantPrisma, {
            content: recMessage.content,
            targetType: recMessage.targetType as any,
            targetIds: targetIds.length > 0 ? targetIds : undefined,
          });

          console.log(`Sent recurring message: ${recMessage.name} to ${message.totalRecipients} recipients`);

          // Update nextSendAt
          await recurringService.updateNextSendAt(
            tenantId,
            tenantPrisma,
            recMessage.id,
            recMessage.frequency,
            recMessage.timeOfDay || '09:00',
            recMessage.dayOfWeek || undefined
          );
            } catch (error) {
              console.error(`Error processing recurring message ${recMessage.id}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error processing recurring messages for tenant ${tenant.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing recurring messages:', error);
    }
  });

  if (!result) {
    console.log('⏭️  Recurring messages already being processed by another server, skipping this run');
  }
}

/**
 * Start recurring message scheduler
 * Runs every 5 minutes
 */
export function startRecurringMessageScheduler() {
  // Run immediately on startup
  processRecurringMessages().catch((error) =>
    console.error('Initial recurring message process failed:', error)
  );

  // Run every 5 minutes
  const intervalId = setInterval(() => {
    processRecurringMessages().catch((error) =>
      console.error('Recurring message process failed:', error)
    );
  }, 5 * 60 * 1000);

  console.log('Recurring message scheduler started (runs every 5 minutes)');

  return intervalId;
}
