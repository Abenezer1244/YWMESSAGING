/**
 * ============================================================================
 * PHONE NUMBER REGISTRY SERVICE
 * ============================================================================
 *
 * Manages phone number to tenant mapping in the registry database
 *
 * Purpose:
 * - Register phone numbers purchased by churches
 * - Unregister phone numbers when released
 * - Route incoming webhooks to correct tenant database
 * - Provides fast phone number -> tenant lookup
 *
 * Used By:
 * - numbers.controller.ts (purchaseNumber, releaseCurrentNumber)
 * - conversation.controller.ts (handleTelnyxInboundMMS webhook)
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import { getRegistryPrisma } from '../lib/tenant-prisma.js';

/**
 * Register a phone number in the registry
 *
 * Called after successful phone number purchase
 * Maps phone number -> tenant for webhook routing
 */
export async function registerPhoneNumber(
  tenantId: string,
  phoneNumber: string
): Promise<void> {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error(`Invalid tenantId: ${tenantId}`);
  }

  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new Error(`Invalid phoneNumber: ${phoneNumber}`);
  }

  // Validate E.164 format
  if (!/^\+\d{1,15}$/.test(phoneNumber)) {
    throw new Error(`Phone number must be in E.164 format (+12345678901): ${phoneNumber}`);
  }

  const registryPrisma = getRegistryPrisma();

  try {
    // Create phone number registry entry
    console.log(
      `[PhoneRegistry] Registering phone number ${phoneNumber} for tenant ${tenantId}`
    );

    const phoneRegistry = await registryPrisma.phoneNumberRegistry.create({
      data: {
        phoneNumber,
        tenantId,
      },
      select: {
        id: true,
        phoneNumber: true,
        tenantId: true,
        createdAt: true,
      },
    });

    console.log(`[PhoneRegistry] Phone number registered: ${phoneRegistry.phoneNumber}`);

    // Update tenant record with phone number
    const tenant = await registryPrisma.tenant.update({
      where: { id: tenantId },
      data: { telnyxPhoneNumber: phoneNumber },
      select: { id: true, name: true, telnyxPhoneNumber: true },
    });

    console.log(
      `[PhoneRegistry] Updated tenant ${tenantId} (${tenant.name}) with phone ${tenant.telnyxPhoneNumber}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[PhoneRegistry] Failed to register phone ${phoneNumber} for tenant ${tenantId}: ${message}`
    );

    // Check if it's a unique constraint violation (phone already registered)
    if (message.includes('Unique constraint failed')) {
      throw new Error(
        `Phone number ${phoneNumber} is already registered. ` +
        `Please use a different phone number or contact support.`
      );
    }

    throw new Error(`Failed to register phone number: ${message}`);
  }
}

/**
 * Unregister a phone number from the registry
 *
 * Called when phone number is released/deleted
 * Soft-delete: keeps record for audit trail
 */
export async function unregisterPhoneNumber(phoneNumber: string): Promise<void> {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new Error(`Invalid phoneNumber: ${phoneNumber}`);
  }

  const registryPrisma = getRegistryPrisma();

  try {
    console.log(`[PhoneRegistry] Unregistering phone number ${phoneNumber}`);

    // Soft delete: mark as released instead of hard delete
    const phoneRegistry = await registryPrisma.phoneNumberRegistry.update({
      where: { phoneNumber },
      data: { releasedAt: new Date() },
      select: {
        id: true,
        phoneNumber: true,
        tenantId: true,
        releasedAt: true,
      },
    });

    console.log(
      `[PhoneRegistry] Phone number ${phoneNumber} marked as released at ${phoneRegistry.releasedAt}`
    );

    // Clear phone number from tenant record
    await registryPrisma.tenant.update({
      where: { id: phoneRegistry.tenantId },
      data: { telnyxPhoneNumber: null },
    });

    console.log(`[PhoneRegistry] Cleared phone number from tenant ${phoneRegistry.tenantId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Check if phone number not found
    if (message.includes('Record to update not found')) {
      throw new Error(`Phone number ${phoneNumber} not found in registry`);
    }

    console.error(`[PhoneRegistry] Failed to unregister phone ${phoneNumber}: ${message}`);
    throw new Error(`Failed to unregister phone number: ${message}`);
  }
}

/**
 * Lookup tenant by phone number
 *
 * Used for webhook routing
 * Returns tenant ID so we can connect to that tenant's database
 */
export async function getTenantByPhoneNumber(phoneNumber: string): Promise<string | null> {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    console.warn(`[PhoneRegistry] Invalid phoneNumber in lookup: ${phoneNumber}`);
    return null;
  }

  const registryPrisma = getRegistryPrisma();

  try {
    // Find active (not released) phone number
    const phoneRegistry = await registryPrisma.phoneNumberRegistry.findUnique({
      where: { phoneNumber },
      select: {
        tenantId: true,
        releasedAt: true,
      },
    });

    if (!phoneRegistry) {
      console.warn(`[PhoneRegistry] Phone number not found: ${phoneNumber}`);
      return null;
    }

    if (phoneRegistry.releasedAt) {
      console.warn(
        `[PhoneRegistry] Phone number was released: ${phoneNumber} at ${phoneRegistry.releasedAt}`
      );
      return null;
    }

    return phoneRegistry.tenantId;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[PhoneRegistry] Lookup error for phone ${phoneNumber}: ${message}`);
    return null;
  }
}

/**
 * Lookup phone number by tenant
 *
 * Returns the phone number assigned to a tenant
 */
export async function getPhoneNumberByTenant(tenantId: string): Promise<string | null> {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error(`Invalid tenantId: ${tenantId}`);
  }

  const registryPrisma = getRegistryPrisma();

  try {
    const tenant = await registryPrisma.tenant.findUnique({
      where: { id: tenantId },
      select: { telnyxPhoneNumber: true },
    });

    return tenant?.telnyxPhoneNumber || null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[PhoneRegistry] Failed to get phone for tenant ${tenantId}: ${message}`);
    throw new Error(`Failed to get phone number: ${message}`);
  }
}

/**
 * Check if a phone number is already registered
 */
export async function isPhoneNumberRegistered(phoneNumber: string): Promise<boolean> {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  const registryPrisma = getRegistryPrisma();

  try {
    const phoneRegistry = await registryPrisma.phoneNumberRegistry.findUnique({
      where: { phoneNumber },
      select: { id: true, releasedAt: true },
    });

    // Return true only if registered AND not released
    return !!phoneRegistry && !phoneRegistry.releasedAt;
  } catch {
    return false;
  }
}

/**
 * List all phone numbers for a tenant
 *
 * In current implementation, each tenant has only one phone number
 * But this structure allows for future multi-number support
 */
export async function listPhoneNumbersForTenant(tenantId: string): Promise<string[]> {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error(`Invalid tenantId: ${tenantId}`);
  }

  const registryPrisma = getRegistryPrisma();

  try {
    const phoneNumbers = await registryPrisma.phoneNumberRegistry.findMany({
      where: {
        tenantId,
        releasedAt: null, // Only active phones
      },
      select: { phoneNumber: true },
      orderBy: { createdAt: 'asc' },
    });

    return phoneNumbers.map((p) => p.phoneNumber);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[PhoneRegistry] Failed to list phones for tenant ${tenantId}: ${message}`
    );
    throw new Error(`Failed to list phone numbers: ${message}`);
  }
}

/**
 * Count phone numbers for a tenant
 */
export async function countPhoneNumbersForTenant(tenantId: string): Promise<number> {
  const phones = await listPhoneNumbersForTenant(tenantId);
  return phones.length;
}

/**
 * Validate phone number is registered to this tenant
 *
 * Used in webhook handlers to ensure phone belongs to tenant before processing
 */
export async function validatePhoneOwnership(
  phoneNumber: string,
  tenantId: string
): Promise<boolean> {
  const registryPrisma = getRegistryPrisma();

  try {
    const phoneRegistry = await registryPrisma.phoneNumberRegistry.findUnique({
      where: { phoneNumber },
      select: { tenantId: true, releasedAt: true },
    });

    return (
      !!phoneRegistry &&
      phoneRegistry.tenantId === tenantId &&
      !phoneRegistry.releasedAt
    );
  } catch {
    return false;
  }
}

/**
 * Get phone number details
 */
export async function getPhoneNumberDetails(phoneNumber: string) {
  const registryPrisma = getRegistryPrisma();

  try {
    return await registryPrisma.phoneNumberRegistry.findUnique({
      where: { phoneNumber },
      select: {
        id: true,
        phoneNumber: true,
        tenantId: true,
        createdAt: true,
        releasedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionStatus: true,
          },
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[PhoneRegistry] Failed to get phone details: ${message}`);
    throw new Error(`Failed to get phone details: ${message}`);
  }
}
