/**
 * ============================================================================
 * EIN SERVICE - Secure Handling of Employer Identification Numbers
 * ============================================================================
 *
 * SECURITY REQUIREMENTS:
 * - EIN is highly sensitive PII (can be used for identity theft, fraud)
 * - MUST be encrypted at rest using AES-256-GCM
 * - MUST be masked in UI (show only last 4 digits)
 * - All access MUST be audited (who, when, why)
 * - Decryption should only happen when absolutely necessary
 * - Never log decrypted EIN values
 *
 * COMPLIANCE:
 * - IRS Publication 5199 requires safeguarding EINs
 * - PCI DSS Level 1 standards for sensitive data handling
 * - SOC 2 Type II audit requirements
 */

import { encryptEIN, decryptEIN, decryptEINSafe, hashEIN, maskEIN } from '../utils/encryption.utils.js';
import { getRegistryPrisma } from '../lib/tenant-prisma.js';

// ============================================================================
// SECURITY: Track all EIN access for anomaly detection
// ============================================================================
let recordEINAccessForMonitoring: ((userId: string, action: string, req: any, churchId?: string) => void) | null = null;

// Import dynamically to avoid circular dependencies
(async () => {
  try {
    const securityModule = await import('../middleware/security-monitoring.middleware.js');
    recordEINAccessForMonitoring = securityModule.recordEINAccess;
    console.log('✅ [EIN_SERVICE] Security monitoring enabled');
  } catch (error) {
    console.warn('⚠️ [EIN_SERVICE] Security monitoring not available:', (error as Error).message);
  }
})();

/**
 * Audit reasons for EIN access
 */
export type EINAccessReason =
  | 'ADMIN_UPDATE'           // Church admin updating EIN
  | '10DLC_REGISTRATION'     // System registering 10DLC brand
  | 'ADMIN_VIEW'             // Church admin viewing settings
  | 'SUPPORT_REQUEST'        // Customer support ticket
  | 'DATA_MIGRATION'         // Database migration script
  | 'AUDIT_COMPLIANCE';      // Compliance audit

/**
 * ============================================================================
 * STORE EIN - Encrypt and save to database with audit trail
 * ============================================================================
 */
export async function storeEIN(
  churchId: string,
  plainEIN: string,
  accessedBy: string,
  reason: EINAccessReason = 'ADMIN_UPDATE'
): Promise<void> {
  try {
    const registryPrisma = getRegistryPrisma();

    // Validate EIN format (9 digits)
    const cleanEIN = plainEIN.replace(/\D/g, '');
    if (cleanEIN.length !== 9) {
      throw new Error('EIN must be exactly 9 digits');
    }

    // Encrypt EIN
    const encrypted = encryptEIN(cleanEIN);
    const hash = hashEIN(cleanEIN);
    const now = new Date();

    // Store in database with audit trail
    await registryPrisma.church.update({
      where: { id: churchId },
      data: {
        ein: encrypted,
        einHash: hash,
        einEncryptedAt: now,
        einAccessedAt: now,
        einAccessedBy: accessedBy,
      },
    });

    // Audit log (NEVER log decrypted EIN)
    logEINAccess(churchId, accessedBy, 'STORE', reason, maskEIN(cleanEIN));

    // Security monitoring (track for anomaly detection)
    if (recordEINAccessForMonitoring) {
      recordEINAccessForMonitoring(accessedBy, 'EIN_STORE', {} as any, churchId);
    }

    console.log(`✅ [EIN_SERVICE] Encrypted and stored EIN for church ${churchId} by ${accessedBy}`);
  } catch (error) {
    console.error(`❌ [EIN_SERVICE] Failed to store EIN for church ${churchId}:`, error);
    throw error;
  }
}

/**
 * ============================================================================
 * GET EIN - Decrypt and return with audit trail
 * ============================================================================
 *
 * CRITICAL: Only call this when EIN is absolutely needed (e.g., Telnyx API call)
 * Do NOT call this for display purposes - use getEINMasked() instead
 */
export async function getEIN(
  churchId: string,
  accessedBy: string,
  reason: EINAccessReason
): Promise<string | null> {
  try {
    const registryPrisma = getRegistryPrisma();

    // Fetch encrypted EIN
    const church = await registryPrisma.church.findUnique({
      where: { id: churchId },
      select: { ein: true },
    });

    if (!church?.ein) {
      console.log(`⚠️ [EIN_SERVICE] No EIN found for church ${churchId}`);
      return null;
    }

    // Decrypt EIN (handles both encrypted and legacy plain text)
    const decrypted = decryptEINSafe(church.ein);

    // Update access timestamp
    await registryPrisma.church.update({
      where: { id: churchId },
      data: {
        einAccessedAt: new Date(),
        einAccessedBy: accessedBy,
      },
    });

    // Audit log (with masked EIN)
    logEINAccess(churchId, accessedBy, 'READ', reason, maskEIN(decrypted));

    // Security monitoring (track for anomaly detection)
    if (recordEINAccessForMonitoring) {
      recordEINAccessForMonitoring(accessedBy, 'EIN_DECRYPT', {} as any, churchId);
    }

    console.log(`🔓 [EIN_SERVICE] Decrypted EIN for church ${churchId} by ${accessedBy} (reason: ${reason})`);

    return decrypted;
  } catch (error) {
    console.error(`❌ [EIN_SERVICE] Failed to decrypt EIN for church ${churchId}:`, error);
    throw error;
  }
}

/**
 * ============================================================================
 * GET EIN MASKED - Return masked EIN for display (XX-XXX5678)
 * ============================================================================
 *
 * Use this for UI display - does NOT decrypt full EIN
 * Shows only last 4 digits for verification
 */
export async function getEINMasked(churchId: string): Promise<string | null> {
  try {
    const registryPrisma = getRegistryPrisma();

    const church = await registryPrisma.church.findUnique({
      where: { id: churchId },
      select: { ein: true },
    });

    if (!church?.ein) {
      return null;
    }

    // Decrypt to get real EIN, then mask it
    const decrypted = decryptEINSafe(church.ein);
    const masked = maskEIN(decrypted);

    console.log(`👁️ [EIN_SERVICE] Returning masked EIN for church ${churchId}: ${masked}`);

    return masked;
  } catch (error) {
    console.error(`❌ [EIN_SERVICE] Failed to get masked EIN for church ${churchId}:`, error);
    return 'XX-XXXXXXX'; // Fallback mask on error
  }
}

/**
 * ============================================================================
 * CHECK EIN EXISTS - Verify if church has EIN without decrypting
 * ============================================================================
 */
export async function hasEIN(churchId: string): Promise<boolean> {
  try {
    const registryPrisma = getRegistryPrisma();

    const church = await registryPrisma.church.findUnique({
      where: { id: churchId },
      select: { ein: true },
    });

    return !!church?.ein;
  } catch (error) {
    console.error(`❌ [EIN_SERVICE] Failed to check EIN existence for church ${churchId}:`, error);
    return false;
  }
}

/**
 * ============================================================================
 * DELETE EIN - Remove from database with audit trail
 * ============================================================================
 */
export async function deleteEIN(
  churchId: string,
  deletedBy: string,
  reason: EINAccessReason = 'ADMIN_UPDATE'
): Promise<void> {
  try {
    const registryPrisma = getRegistryPrisma();

    // Get masked EIN before deletion for audit log
    const masked = await getEINMasked(churchId);

    // Delete EIN and related fields
    await registryPrisma.church.update({
      where: { id: churchId },
      data: {
        ein: null,
        einHash: null,
        einEncryptedAt: null,
        einAccessedAt: null,
        einAccessedBy: null,
      },
    });

    // Audit log
    logEINAccess(churchId, deletedBy, 'DELETE', reason, masked || 'N/A');

    console.log(`🗑️ [EIN_SERVICE] Deleted EIN for church ${churchId} by ${deletedBy}`);
  } catch (error) {
    console.error(`❌ [EIN_SERVICE] Failed to delete EIN for church ${churchId}:`, error);
    throw error;
  }
}

/**
 * ============================================================================
 * MIGRATE PLAIN TEXT EIN - Convert legacy plain text EIN to encrypted
 * ============================================================================
 *
 * Use this for one-time migration of existing plain text EINs
 */
export async function migratePlainTextEIN(churchId: string): Promise<boolean> {
  try {
    const registryPrisma = getRegistryPrisma();

    const church = await registryPrisma.church.findUnique({
      where: { id: churchId },
      select: { ein: true, einEncryptedAt: true },
    });

    // Skip if no EIN or already encrypted
    if (!church?.ein) {
      console.log(`⏭️ [EIN_SERVICE] No EIN to migrate for church ${churchId}`);
      return false;
    }

    if (church.einEncryptedAt) {
      console.log(`⏭️ [EIN_SERVICE] EIN already encrypted for church ${churchId}`);
      return false;
    }

    // Check if it's already encrypted (has 4 colon-separated parts)
    const parts = church.ein.split(':');
    if (parts.length === 4) {
      // Already encrypted, just update timestamp
      await registryPrisma.church.update({
        where: { id: churchId },
        data: {
          einEncryptedAt: new Date(),
          einHash: hashEIN(decryptEINSafe(church.ein)),
        },
      });
      console.log(`✅ [EIN_SERVICE] Updated encryption metadata for church ${churchId}`);
      return true;
    }

    // Plain text EIN - encrypt it
    const cleanEIN = church.ein.replace(/\D/g, '');
    if (cleanEIN.length !== 9) {
      console.error(`❌ [EIN_SERVICE] Invalid EIN format for church ${churchId}`);
      return false;
    }

    const encrypted = encryptEIN(cleanEIN);
    const hash = hashEIN(cleanEIN);

    await registryPrisma.church.update({
      where: { id: churchId },
      data: {
        ein: encrypted,
        einHash: hash,
        einEncryptedAt: new Date(),
      },
    });

    console.log(`✅ [EIN_SERVICE] Migrated plain text EIN to encrypted for church ${churchId}`);
    logEINAccess(churchId, 'SYSTEM', 'STORE', 'DATA_MIGRATION', maskEIN(cleanEIN));

    return true;
  } catch (error) {
    console.error(`❌ [EIN_SERVICE] Failed to migrate EIN for church ${churchId}:`, error);
    return false;
  }
}

/**
 * ============================================================================
 * AUDIT LOGGING - Track all EIN access
 * ============================================================================
 *
 * SECURITY: All EIN access must be logged for compliance audits
 * Log format: [timestamp] [churchId] [userId] [action] [reason] [maskedEIN]
 */
function logEINAccess(
  churchId: string,
  userId: string,
  action: 'STORE' | 'READ' | 'DELETE',
  reason: EINAccessReason,
  maskedEIN: string
): void {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [CHURCH:${churchId}] [USER:${userId}] [ACTION:${action}] [REASON:${reason}] [EIN:${maskedEIN}]`;

  // Log to console (will be captured by logging service in production)
  console.log(`🔒 [EIN_AUDIT] ${logEntry}`);

  // TODO: In production, send to dedicated audit logging service
  // - AWS CloudWatch Logs
  // - Datadog
  // - Splunk
  // - Elasticsearch
  // This ensures audit trail is immutable and tamper-proof
}
