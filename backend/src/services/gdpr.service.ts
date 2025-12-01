import { prisma } from '../lib/prisma.js';
import crypto from 'crypto';

/**
 * GDPR Service - Handle data export, deletion, and consent management
 * Implements:
 * - GDPR Article 20 (Right to Data Portability)
 * - GDPR Article 17 (Right to be Forgotten)
 * - GDPR Article 7 (Consent Management)
 */

/**
 * Export all church data as JSON
 * Returns the complete data structure ready for download
 */
export async function exportChurchData(churchId: string) {
  try {
    const [
      church,
      admins,
      branches,
      groups,
      members,
      messages,
      templates,
      conversations,
      subscriptions,
    ] = await Promise.all([
      prisma.church.findUnique({
        where: { id: churchId },
      }),
      prisma.admin.findMany({
        where: { churchId },
      }),
      prisma.branch.findMany({
        where: { churchId },
      }),
      prisma.group.findMany({
        where: { branch: { churchId } },
        include: { members: true },
      }),
      prisma.member.findMany({
        where: {
          groups: {
            some: {
              group: { branch: { churchId } },
            },
          },
        },
      }),
      prisma.message.findMany({
        where: { churchId },
        include: { recipients: true },
      }),
      prisma.messageTemplate.findMany({
        where: { churchId },
      }),
      prisma.conversation.findMany({
        where: { churchId },
        include: { messages: true },
      }),
      prisma.subscription.findMany({
        where: { churchId },
      }),
    ]);

    return {
      exportDate: new Date(),
      church,
      admins,
      branches,
      groups,
      members,
      messages,
      templates,
      conversations,
      subscriptions,
    };
  } catch (error) {
    console.error('Failed to export church data:', error);
    throw new Error(`Data export failed: ${(error as Error).message}`);
  }
}

/**
 * Create data export record and return download URL
 */
export async function createDataExport(churchId: string, adminId: string) {
  try {
    // Check if recent export exists (within 1 hour)
    const recentExport = await prisma.dataExport.findFirst({
      where: {
        churchId,
        status: 'completed',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentExport) {
      // Return existing export
      return {
        exportId: recentExport.id,
        downloadUrl: `/api/gdpr/export/${recentExport.id}/download`,
        expiresAt: recentExport.expiresAt,
        cached: true,
      };
    }

    // Generate new export
    const data = await exportChurchData(churchId);
    const jsonData = JSON.stringify(data, null, 2);

    // Create export record
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const exportRecord = await prisma.dataExport.create({
      data: {
        churchId,
        requestedBy: adminId,
        status: 'completed',
        fileSize: Buffer.byteLength(jsonData),
        expiresAt,
        completedAt: new Date(),
        fileUrl: `/api/gdpr/export/${churchId}.json`, // Virtual URL, data stored in memory/temp
      },
    });

    // Store data temporarily (in production, store in S3 with expiry)
    // For MVP, we'll store in a module-level cache
    dataExportCache.set(exportRecord.id, {
      data: jsonData,
      expiresAt,
    });

    return {
      exportId: exportRecord.id,
      downloadUrl: `/api/gdpr/export/${exportRecord.id}/download`,
      expiresAt: exportRecord.expiresAt,
      cached: false,
    };
  } catch (error) {
    console.error('Failed to create data export:', error);
    throw new Error(`Data export creation failed: ${(error as Error).message}`);
  }
}

/**
 * Get exported data by export ID
 */
export async function getExportData(exportId: string): Promise<string | null> {
  // Check cache first
  const cached = dataExportCache.get(exportId);
  if (cached && cached.expiresAt > new Date()) {
    return cached.data;
  }

  // Clear expired cache
  if (cached) {
    dataExportCache.delete(exportId);
  }

  return null;
}

/**
 * Request account deletion with confirmation token
 * Creates a 30-day grace period before actual deletion
 */
export async function requestAccountDeletion(
  churchId: string,
  adminId: string,
  reason?: string
) {
  try {
    // Check if deletion already pending
    const existing = await prisma.accountDeletionRequest.findUnique({
      where: { churchId },
    });

    if (existing && existing.status === 'pending') {
      throw new Error('Account deletion already requested');
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    // Schedule deletion for 30 days from now
    const scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const deletionRequest = await prisma.accountDeletionRequest.create({
      data: {
        churchId,
        initiatedBy: adminId,
        confirmationToken,
        scheduledDeletionAt,
        reason,
      },
    });

    return {
      deletionRequestId: deletionRequest.id,
      confirmationToken,
      scheduledDeletionAt,
      message:
        'Account deletion scheduled. You have 30 days to confirm or cancel.',
    };
  } catch (error) {
    console.error('Failed to request account deletion:', error);
    throw new Error(
      `Deletion request failed: ${(error as Error).message}`
    );
  }
}

/**
 * Cancel pending account deletion
 */
export async function cancelAccountDeletion(
  churchId: string,
  adminId: string
) {
  try {
    const deletionRequest = await prisma.accountDeletionRequest.findUnique({
      where: { churchId },
    });

    if (!deletionRequest || deletionRequest.status !== 'pending') {
      throw new Error('No pending deletion request found');
    }

    await prisma.accountDeletionRequest.update({
      where: { churchId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: adminId,
      },
    });

    return { message: 'Deletion request cancelled' };
  } catch (error) {
    console.error('Failed to cancel account deletion:', error);
    throw new Error(`Cancellation failed: ${(error as Error).message}`);
  }
}

/**
 * Confirm and execute account deletion
 * Requires valid confirmation token
 */
export async function confirmAccountDeletion(
  churchId: string,
  confirmationToken: string
) {
  try {
    const deletionRequest = await prisma.accountDeletionRequest.findUnique({
      where: { churchId },
    });

    if (!deletionRequest) {
      throw new Error('Deletion request not found');
    }

    if (deletionRequest.status !== 'pending') {
      throw new Error('Deletion request is not pending');
    }

    // Verify token
    if (deletionRequest.confirmationToken !== confirmationToken) {
      throw new Error('Invalid confirmation token');
    }

    // Delete all church data (cascade deletes should handle relations)
    await Promise.all([
      // Delete conversations and messages
      prisma.conversation.deleteMany({ where: { churchId } }),
      prisma.message.deleteMany({ where: { churchId } }),
      prisma.messageTemplate.deleteMany({ where: { churchId } }),

      // Delete subscriptions
      prisma.subscription.deleteMany({ where: { churchId } }),
    ]);

    // Delete groups and members (cascade should handle)
    const branches = await prisma.branch.findMany({
      where: { churchId },
      select: { id: true },
    });

    for (const branch of branches) {
      await prisma.group.deleteMany({ where: { branchId: branch.id } });
    }

    // Delete branches
    await prisma.branch.deleteMany({ where: { churchId } });

    // Delete admins
    await prisma.admin.deleteMany({ where: { churchId } });

    // Delete church
    await prisma.church.delete({ where: { id: churchId } });

    // Mark deletion as confirmed
    await prisma.accountDeletionRequest.update({
      where: { churchId },
      data: {
        status: 'confirmed',
        actualDeletionAt: new Date(),
      },
    });

    return { message: 'Account deleted successfully' };
  } catch (error) {
    console.error('Failed to confirm account deletion:', error);
    throw new Error(`Deletion confirmation failed: ${(error as Error).message}`);
  }
}

/**
 * Get consent status for a church
 */
export async function getConsentStatus(churchId: string) {
  try {
    // Get latest consent for each type
    const consentTypes = [
      'smsMarketing',
      'emailMarketing',
      'dataProcessing',
      'analytics',
    ];
    const consents: any = {};

    for (const type of consentTypes) {
      const latestConsent = await prisma.consentLog.findFirst({
        where: {
          churchId,
          type,
        },
        orderBy: { createdAt: 'desc' },
      });

      consents[type] = latestConsent || {
        status: 'not_set',
        reason: 'No consent history',
      };
    }

    return {
      churchId,
      consents,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Failed to get consent status:', error);
    throw new Error(`Consent status retrieval failed: ${(error as Error).message}`);
  }
}

/**
 * Update consent status
 */
export async function updateConsent(
  churchId: string,
  type: string,
  status: 'granted' | 'denied' | 'withdrawn',
  reason?: string
) {
  try {
    // Validate consent type
    const validTypes = ['smsMarketing', 'emailMarketing', 'dataProcessing', 'analytics'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid consent type: ${type}`);
    }

    const log = await prisma.consentLog.create({
      data: {
        churchId,
        type,
        status,
        reason,
        source: 'api',
      },
    });

    return {
      consentId: log.id,
      type,
      status,
      grantedAt: log.createdAt,
    };
  } catch (error) {
    console.error('Failed to update consent:', error);
    throw new Error(`Consent update failed: ${(error as Error).message}`);
  }
}

/**
 * Get consent history for audit trail
 */
export async function getConsentHistory(churchId: string, type?: string) {
  try {
    const logs = await prisma.consentLog.findMany({
      where: {
        churchId,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Last 100 entries
    });

    return logs;
  } catch (error) {
    console.error('Failed to get consent history:', error);
    throw new Error(`Consent history retrieval failed: ${(error as Error).message}`);
  }
}

/**
 * Clean up expired exports (run periodically)
 */
export async function cleanupExpiredExports() {
  try {
    const result = await prisma.dataExport.updateMany({
      where: {
        expiresAt: { lte: new Date() },
        status: 'completed',
      },
      data: {
        status: 'expired',
      },
    });

    console.log(`Cleaned up ${result.count} expired exports`);
    return result;
  } catch (error) {
    console.error('Failed to clean up expired exports:', error);
    throw error;
  }
}

/**
 * Clean up expired deletion requests (run periodically)
 */
export async function cleanupExpiredDeletionRequests() {
  try {
    // Auto-confirm deletion requests that have passed the scheduled date
    const expiredRequests = await prisma.accountDeletionRequest.findMany({
      where: {
        status: 'pending',
        scheduledDeletionAt: { lte: new Date() },
      },
    });

    for (const request of expiredRequests) {
      try {
        await confirmAccountDeletion(request.churchId, request.confirmationToken);
      } catch (error) {
        console.error(
          `Failed to auto-delete church ${request.churchId}:`,
          error
        );
      }
    }

    return expiredRequests.length;
  } catch (error) {
    console.error('Failed to clean up expired deletion requests:', error);
    throw error;
  }
}

/**
 * Temporary cache for exported data
 * In production, use S3 or similar
 */
interface ExportCacheEntry {
  data: string;
  expiresAt: Date;
}

const dataExportCache = new Map<string, ExportCacheEntry>();

// Periodically clean cache
setInterval(() => {
  const now = new Date();
  for (const [key, value] of dataExportCache.entries()) {
    if (value.expiresAt <= now) {
      dataExportCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Every hour
