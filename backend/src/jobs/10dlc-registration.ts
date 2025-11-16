import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

/**
 * Get Telnyx API client
 */
function getTelnyxClient() {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) {
    throw new Error('TELNYX_API_KEY not configured');
  }

  return axios.create({
    baseURL: 'https://api.telnyx.com/v2',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Register a church's own 10DLC brand with Telnyx
 * This runs asynchronously after phone purchase to avoid blocking the user
 */
export async function registerPersonal10DLCAsync(
  churchId: string,
  phoneNumber: string
): Promise<void> {
  try {
    console.log(`📝 Starting 10DLC registration for church: ${churchId}`);

    // Get church info
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { name: true, email: true, id: true }
    });

    if (!church) {
      console.error(`❌ Church not found: ${churchId}`);
      return;
    }

    const client = getTelnyxClient();

    // Register brand with Telnyx
    console.log(`📤 Submitting 10DLC brand to Telnyx: "${church.name}"`);

    const brandResponse = await client.post('/10dlc_brands', {
      company_name: church.name,
      brand_type: 'CHURCH', // Telnyx brand type
      phone_number: phoneNumber,
      // These fields help with approval
      vertical: 'RELIGION', // Vertical market
      city: 'USA', // We don't have city, using default
      state: 'US',
    });

    const brandId = brandResponse.data?.data?.id;
    if (!brandId) {
      console.error('❌ No brand ID returned from Telnyx');
      console.error('Response:', JSON.stringify(brandResponse.data, null, 2));
      return;
    }

    console.log(`✅ Brand registered with Telnyx: ${brandId}`);

    // Store brand ID and mark as pending
    await prisma.church.update({
      where: { id: churchId },
      data: {
        dlcBrandId: brandId,
        dlcStatus: 'pending',
        dlcRegisteredAt: new Date(),
        dlcNextCheckAt: new Date(Date.now() + 15 * 60 * 1000), // Check in 15 minutes
      },
    });

    console.log(`✅ Church ${church.name} (${churchId}) registered for 10DLC`);
    console.log(`   Brand ID: ${brandId}`);
    console.log(`   Next check: 15 minutes`);

    // Start checking approval status
    scheduleApprovalCheck(churchId);

  } catch (error: any) {
    console.error(`❌ Error registering 10DLC for church ${churchId}:`, error.message);

    if (error.response?.data) {
      console.error('Telnyx Error:', JSON.stringify(error.response.data, null, 2));
    }

    // Mark as failed but don't crash the system
    await prisma.church.update({
      where: { id: churchId },
      data: {
        dlcStatus: 'rejected',
        dlcRejectionReason: error.message,
      },
    }).catch(err => {
      console.error('Failed to update church error status:', err);
    });
  }
}

/**
 * Check 10DLC approval status and migrate to per-church brand when approved
 */
export async function checkAndMigrateToPer10DLC(): Promise<void> {
  try {
    console.log('🔍 Checking 10DLC approval statuses...');

    // Find churches with pending 10DLC that are due for checking
    const pendingChurches = await prisma.church.findMany({
      where: {
        dlcStatus: 'pending',
        dlcBrandId: { not: null },
        dlcNextCheckAt: { lte: new Date() }, // Due for checking
      },
      select: {
        id: true,
        name: true,
        dlcBrandId: true,
        telnyxPhoneNumber: true,
      },
    });

    console.log(`Found ${pendingChurches.length} churches to check`);

    if (pendingChurches.length === 0) {
      return;
    }

    const client = getTelnyxClient();

    for (const church of pendingChurches) {
      try {
        // Check brand status with Telnyx
        const response = await client.get(`/10dlc_brands/${church.dlcBrandId}`);
        const status = response.data?.data?.status;

        console.log(`  Church: ${church.name} - Status: ${status}`);

        if (status === 'approved') {
          // UPGRADE to per-church brand!
          console.log(`✅ APPROVED! Migrating ${church.name} to per-church 10DLC`);

          await prisma.church.update({
            where: { id: church.id },
            data: {
              dlcStatus: 'approved',
              dlcApprovedAt: new Date(),
              usingSharedBrand: false, // NOW use their personal brand
              deliveryRate: 0.99, // Upgrade to 99% delivery
            },
          });

          // Notify admin (optional - can send email here)
          console.log(`   🎉 ${church.name} is now optimized for maximum delivery!`);

        } else if (status === 'rejected') {
          // Approval was rejected
          console.log(`❌ REJECTED! ${church.name} - keeping shared brand`);

          const rejection = response.data?.data?.rejection_reason || 'Unknown reason';

          await prisma.church.update({
            where: { id: church.id },
            data: {
              dlcStatus: 'rejected',
              dlcRejectionReason: rejection,
              // Keep using shared brand
            },
          });

        } else if (status === 'pending') {
          // Still pending, reschedule check for later
          await prisma.church.update({
            where: { id: church.id },
            data: {
              dlcNextCheckAt: new Date(Date.now() + 30 * 60 * 1000), // Check again in 30 minutes
            },
          });
        }
      } catch (error: any) {
        console.error(`   ⚠️  Error checking ${church.name}:`, error.message);
        // Continue with next church
      }
    }

    console.log('✅ Approval check completed');

  } catch (error: any) {
    console.error('❌ Error in approval check job:', error.message);
  }
}

/**
 * Schedule periodic approval checks (for future use with job queue)
 */
function scheduleApprovalCheck(churchId: string): void {
  // This is a placeholder for future implementation
  // In production, this would schedule a background job (e.g., Bull, RabbitMQ)
  // For now, the check happens naturally when checkAndMigrateToPer10DLC runs

  console.log(`📅 Scheduled approval check for church ${churchId}`);
}

/**
 * Export functions that can be called from controllers or scheduled jobs
 */
export { checkAndMigrateToPer10DLC as checkDLCApprovalStatus };
