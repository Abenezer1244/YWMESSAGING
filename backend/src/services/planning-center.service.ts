/**
 * Planning Center Integration Service
 *
 * Integrates with Planning Center Online (PCO) to:
 * - Import members and volunteers
 * - Sync service schedules for event-based messaging
 * - Track integration status
 * - Handle OAuth2 authentication
 *
 * Planning Center API: https://api.planningcenteronline.com/v2
 * Authentication: OAuth2 Bearer Token or Personal Access Token
 */

import axios, { AxiosInstance } from 'axios';
import { TenantPrismaClient } from '../lib/tenant-prisma.js';
import { getCached, setCached, invalidateCache, CACHE_KEYS, CACHE_TTL } from './cache.service.js';

const PCO_API_BASE = 'https://api.planningcenteronline.com/v2';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Planning Center OAuth2 credentials
 */
export interface PlanningCenterOAuth2 {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  clientId: string;
  clientSecret: string;
}

/**
 * PCO Member/Person record
 */
export interface PCOMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive';
  integrationStatus?: 'synced' | 'pending' | 'failed';
}

/**
 * PCO Service/Event record
 */
export interface PCOService {
  id: string;
  name: string;
  description?: string;
  plannedAt: Date;
  series?: string;
  serviceType: string;
}

/**
 * Planning Center Integration config for a church
 */
export interface PlanningCenterIntegration {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  organizationId: string;
  isEnabled: boolean;
  lastSyncAt?: Date;
  syncStatus: 'active' | 'failed' | 'pending';
  errorMessage?: string;
  memberSyncEnabled: boolean;
  serviceSyncEnabled: boolean;
}

/**
 * Sync result tracking
 */
export interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsFailed: number;
  duration: number;
  error?: string;
}

// ============================================================================
// Planning Center API Client
// ============================================================================

class PlanningCenterClient {
  private apiClient: AxiosInstance;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.apiClient = axios.create({
      baseURL: PCO_API_BASE,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Get organization ID (required to access data)
   */
  async getOrganizationId(): Promise<string> {
    try {
      const response = await this.apiClient.get('/me');
      const organizationId = response.data?.data?.[0]?.relationships?.organization?.data?.id;
      if (!organizationId) {
        throw new Error('Organization ID not found in Planning Center response');
      }
      return organizationId;
    } catch (error: any) {
      throw new Error(`Failed to get Organization ID: ${error.message}`);
    }
  }

  /**
   * Get all people/members from Planning Center
   * Paginated endpoint - fetches all records
   */
  async getPeople(organizationId: string, limit = 100): Promise<PCOMember[]> {
    try {
      const people: PCOMember[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await this.apiClient.get(
          `/organizations/${organizationId}/people`,
          {
            params: {
              limit,
              offset,
              include: 'name_prefix,phone_numbers,emails',
            },
          }
        );

        const records = response.data?.data || [];
        records.forEach((record: any) => {
          people.push({
            id: record.id,
            name: record.attributes?.name || '',
            firstName: record.attributes?.first_name || '',
            lastName: record.attributes?.last_name || '',
            email: record.attributes?.primary_email_address || '',
            phone: record.attributes?.phone_number || '',
            status: record.attributes?.status === 'active' ? 'active' : 'inactive',
          });
        });

        // Check if there are more results
        offset += limit;
        hasMore = records.length === limit;
      }

      return people;
    } catch (error: any) {
      throw new Error(`Failed to fetch people from Planning Center: ${error.message}`);
    }
  }

  /**
   * Get all services/events from Planning Center
   * Paginated endpoint - fetches upcoming services
   */
  async getServices(organizationId: string, limit = 50): Promise<PCOService[]> {
    try {
      const services: PCOService[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await this.apiClient.get(
          `/organizations/${organizationId}/services/service_types`,
          {
            params: {
              limit,
              offset,
              include: 'plans',
              where: { status: 'active' },
            },
          }
        );

        const records = response.data?.data || [];
        records.forEach((record: any) => {
          services.push({
            id: record.id,
            name: record.attributes?.name || '',
            description: record.attributes?.description,
            plannedAt: new Date(record.attributes?.created_at),
            serviceType: record.attributes?.name,
          });
        });

        offset += limit;
        hasMore = records.length === limit;
      }

      return services;
    } catch (error: any) {
      throw new Error(`Failed to fetch services from Planning Center: ${error.message}`);
    }
  }

  /**
   * Test connection to Planning Center
   */
  async testConnection(): Promise<{ valid: boolean; organizationName?: string; error?: string }> {
    try {
      const response = await this.apiClient.get('/me');
      const orgName = response.data?.data?.[0]?.attributes?.name;
      return {
        valid: true,
        organizationName: orgName,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Connect Planning Center to a church (OAuth2)
 * Stores credentials securely in database
 */
export async function connectPlanningCenter(
  accessToken: string,
  tenantPrisma: TenantPrismaClient,
  refreshToken?: string,
  expiresIn?: number
): Promise<PlanningCenterIntegration> {
  try {
    const client = new PlanningCenterClient(accessToken);

    // Verify connection and get organization ID
    const connection = await client.testConnection();
    if (!connection.valid) {
      throw new Error(`Planning Center connection failed: ${connection.error}`);
    }

    const organizationId = await client.getOrganizationId();

    // Calculate expiration date
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : new Date(Date.now() + 3600 * 1000); // Default 1 hour

    // Store in database (upsert first record - one integration per church/tenant)
    const existing = await tenantPrisma.planningCenterIntegration.findFirst();
    const integration = existing
      ? await tenantPrisma.planningCenterIntegration.update({
          where: { id: existing.id },
          data: {
            accessToken,
            refreshToken: refreshToken || undefined,
            expiresAt,
            organizationId,
            isEnabled: true,
            syncStatus: 'active',
            errorMessage: null,
          },
        })
      : await tenantPrisma.planningCenterIntegration.create({
          data: {
            accessToken,
            refreshToken: refreshToken || '',
            expiresAt,
            organizationId,
            isEnabled: true,
            syncStatus: 'active',
            memberSyncEnabled: true,
            serviceSyncEnabled: true,
          },
        });

    // Cache will expire naturally

    console.log(`[Planning Center] Connected to organization ${organizationId}`);

    return {
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || undefined,
      expiresAt: integration.expiresAt || undefined,
      organizationId: integration.organizationId,
      isEnabled: integration.isEnabled,
      lastSyncAt: integration.lastSyncAt || undefined,
      syncStatus: integration.syncStatus as 'active' | 'failed' | 'pending',
      errorMessage: integration.errorMessage || undefined,
      memberSyncEnabled: integration.memberSyncEnabled,
      serviceSyncEnabled: integration.serviceSyncEnabled,
    };
  } catch (error: any) {
    console.error(`[Planning Center] Connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get Planning Center integration status
 */
export async function getPlanningCenterStatus(
  tenantPrisma: TenantPrismaClient
): Promise<PlanningCenterIntegration | null> {
  try {
    const integration = await tenantPrisma.planningCenterIntegration.findFirst();

    return integration ? {
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || undefined,
      expiresAt: integration.expiresAt || undefined,
      organizationId: integration.organizationId,
      isEnabled: integration.isEnabled,
      lastSyncAt: integration.lastSyncAt || undefined,
      syncStatus: integration.syncStatus as 'active' | 'failed' | 'pending',
      errorMessage: integration.errorMessage || undefined,
      memberSyncEnabled: integration.memberSyncEnabled,
      serviceSyncEnabled: integration.serviceSyncEnabled,
    } : null;
  } catch (error: any) {
    console.error(`[Planning Center] Failed to get status: ${error.message}`);
    return null;
  }
}

/**
 * Sync members from Planning Center into YW Messaging
 * Creates or updates Member records
 */
export async function syncPlanningCenterMembers(
  tenantPrisma: TenantPrismaClient
): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    itemsProcessed: 0,
    itemsCreated: 0,
    itemsUpdated: 0,
    itemsFailed: 0,
    duration: 0,
  };

  try {
    const integration = await getPlanningCenterStatus(tenantPrisma);
    if (!integration || !integration.isEnabled || !integration.memberSyncEnabled) {
      throw new Error('Planning Center integration not enabled for member sync');
    }

    const client = new PlanningCenterClient(integration.accessToken);
    const people = await client.getPeople(integration.organizationId);

    console.log(`[Planning Center] Syncing ${people.length} members`);

    for (const person of people) {
      try {
        // Create or update member in YW Messaging
        const existingMember = await tenantPrisma.member.findFirst({
          where: {
            phone: person.phone,
          },
        });

        if (existingMember) {
          // Update existing member
          await tenantPrisma.member.update({
            where: { id: existingMember.id },
            data: {
              firstName: person.firstName,
              lastName: person.lastName,
              email: person.email,
            },
          });
          result.itemsUpdated++;
        } else if (person.phone) {
          // Create new member (must have phone number)
          const newMember = await tenantPrisma.member.create({
            data: {
              firstName: person.firstName,
              lastName: person.lastName,
              email: person.email,
              phone: person.phone,
            },
          });

          // Create a conversation to link member to church
          await tenantPrisma.conversation.create({
            data: {
              memberId: newMember.id,
            },
          });

          result.itemsCreated++;
        } else {
          result.itemsFailed++;
        }

        result.itemsProcessed++;
      } catch (error: any) {
        console.error(`[Planning Center] Failed to sync member ${person.id}: ${error.message}`);
        result.itemsFailed++;
      }
    }

    // Update last sync time
    const latestIntegration = await tenantPrisma.planningCenterIntegration.findFirst();
    if (latestIntegration) {
      await tenantPrisma.planningCenterIntegration.update({
        where: { id: latestIntegration.id },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'active',
          errorMessage: null,
        },
      });
    }

    result.success = true;
    result.duration = Date.now() - startTime;

    console.log(`[Planning Center] Sync complete: ${result.itemsCreated} created, ${result.itemsUpdated} updated, ${result.itemsFailed} failed`);

    return result;
  } catch (error: any) {
    result.duration = Date.now() - startTime;
    result.error = error.message;

    // Update integration status to failed
    const integration = await tenantPrisma.planningCenterIntegration.findFirst().catch(() => null);
    if (integration) {
      await tenantPrisma.planningCenterIntegration.update({
        where: { id: integration.id },
        data: {
          syncStatus: 'failed',
          errorMessage: error.message,
        },
      }).catch(() => {}); // Ignore if integration doesn't exist
    }

    console.error(`[Planning Center] Sync failed: ${error.message}`);

    return result;
  }
}

/**
 * Disconnect Planning Center from a church
 * Revokes access token and disables integration
 */
export async function disconnectPlanningCenter(
  tenantPrisma: TenantPrismaClient
): Promise<void> {
  try {
    const integration = await tenantPrisma.planningCenterIntegration.findFirst();
    if (integration) {
      await tenantPrisma.planningCenterIntegration.update({
        where: { id: integration.id },
        data: {
          isEnabled: false,
          accessToken: '', // Clear token
          syncStatus: 'pending',
        },
      });
    }

    // Cache will expire naturally (no churchId available for cache keys)

    console.log(`[Planning Center] Disconnected`);
  } catch (error: any) {
    console.error(`[Planning Center] Failed to disconnect: ${error.message}`);
    throw error;
  }
}

/**
 * Check if token needs refresh
 */
function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  // Refresh if expiring within 5 minutes
  return new Date().getTime() > expiresAt.getTime() - 5 * 60 * 1000;
}

/**
 * Validate Planning Center integration setup
 */
export async function validatePlanningCenterSetup(
  tenantPrisma: TenantPrismaClient
): Promise<{ valid: boolean; error?: string }> {
  try {
    const integration = await tenantPrisma.planningCenterIntegration.findFirst();

    if (!integration || !integration.isEnabled) {
      return { valid: false, error: 'Planning Center not connected' };
    }

    if (isTokenExpired(integration.expiresAt || null)) {
      return { valid: false, error: 'Access token expired' };
    }

    const client = new PlanningCenterClient(integration.accessToken);
    const connection = await client.testConnection();

    return {
      valid: connection.valid,
      error: connection.error,
    };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}
