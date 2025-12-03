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
import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import { getCached, setCached, invalidateCache, CACHE_KEYS, CACHE_TTL } from './cache.service.js';
const PCO_API_BASE = 'https://api.planningcenteronline.com/v2';
// ============================================================================
// Planning Center API Client
// ============================================================================
class PlanningCenterClient {
    constructor(accessToken) {
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
    async getOrganizationId() {
        try {
            const response = await this.apiClient.get('/me');
            const organizationId = response.data?.data?.[0]?.relationships?.organization?.data?.id;
            if (!organizationId) {
                throw new Error('Organization ID not found in Planning Center response');
            }
            return organizationId;
        }
        catch (error) {
            throw new Error(`Failed to get Organization ID: ${error.message}`);
        }
    }
    /**
     * Get all people/members from Planning Center
     * Paginated endpoint - fetches all records
     */
    async getPeople(organizationId, limit = 100) {
        try {
            const people = [];
            let offset = 0;
            let hasMore = true;
            while (hasMore) {
                const response = await this.apiClient.get(`/organizations/${organizationId}/people`, {
                    params: {
                        limit,
                        offset,
                        include: 'name_prefix,phone_numbers,emails',
                    },
                });
                const records = response.data?.data || [];
                records.forEach((record) => {
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
        }
        catch (error) {
            throw new Error(`Failed to fetch people from Planning Center: ${error.message}`);
        }
    }
    /**
     * Get all services/events from Planning Center
     * Paginated endpoint - fetches upcoming services
     */
    async getServices(organizationId, limit = 50) {
        try {
            const services = [];
            let offset = 0;
            let hasMore = true;
            while (hasMore) {
                const response = await this.apiClient.get(`/organizations/${organizationId}/services/service_types`, {
                    params: {
                        limit,
                        offset,
                        include: 'plans',
                        where: { status: 'active' },
                    },
                });
                const records = response.data?.data || [];
                records.forEach((record) => {
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
        }
        catch (error) {
            throw new Error(`Failed to fetch services from Planning Center: ${error.message}`);
        }
    }
    /**
     * Test connection to Planning Center
     */
    async testConnection() {
        try {
            const response = await this.apiClient.get('/me');
            const orgName = response.data?.data?.[0]?.attributes?.name;
            return {
                valid: true,
                organizationName: orgName,
            };
        }
        catch (error) {
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
export async function connectPlanningCenter(churchId, accessToken, refreshToken, expiresIn) {
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
        // Store in database
        const integration = await prisma.planningCenterIntegration.upsert({
            where: { churchId },
            update: {
                accessToken,
                refreshToken: refreshToken || undefined,
                expiresAt,
                organizationId,
                isEnabled: true,
                syncStatus: 'active',
                errorMessage: null,
            },
            create: {
                churchId,
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
        // Invalidate cache
        await invalidateCache(CACHE_KEYS.churchAll(churchId));
        console.log(`[Planning Center] Connected church ${churchId} to organization ${organizationId}`);
        return {
            churchId: integration.churchId,
            accessToken: integration.accessToken,
            refreshToken: integration.refreshToken || undefined,
            expiresAt: integration.expiresAt || undefined,
            organizationId: integration.organizationId,
            isEnabled: integration.isEnabled,
            lastSyncAt: integration.lastSyncAt || undefined,
            syncStatus: integration.syncStatus,
            errorMessage: integration.errorMessage || undefined,
            memberSyncEnabled: integration.memberSyncEnabled,
            serviceSyncEnabled: integration.serviceSyncEnabled,
        };
    }
    catch (error) {
        console.error(`[Planning Center] Connection failed: ${error.message}`);
        throw error;
    }
}
/**
 * Get Planning Center integration status
 */
export async function getPlanningCenterStatus(churchId) {
    try {
        // Try cache first
        const cached = await getCached(CACHE_KEYS.planningCenterStatus(churchId));
        if (cached) {
            return cached;
        }
        const integration = await prisma.planningCenterIntegration.findUnique({
            where: { churchId },
        });
        if (integration) {
            await setCached(CACHE_KEYS.planningCenterStatus(churchId), integration, CACHE_TTL.MEDIUM);
        }
        return integration ? {
            churchId: integration.churchId,
            accessToken: integration.accessToken,
            refreshToken: integration.refreshToken || undefined,
            expiresAt: integration.expiresAt || undefined,
            organizationId: integration.organizationId,
            isEnabled: integration.isEnabled,
            lastSyncAt: integration.lastSyncAt || undefined,
            syncStatus: integration.syncStatus,
            errorMessage: integration.errorMessage || undefined,
            memberSyncEnabled: integration.memberSyncEnabled,
            serviceSyncEnabled: integration.serviceSyncEnabled,
        } : null;
    }
    catch (error) {
        console.error(`[Planning Center] Failed to get status: ${error.message}`);
        return null;
    }
}
/**
 * Sync members from Planning Center into YW Messaging
 * Creates or updates Member records
 */
export async function syncPlanningCenterMembers(churchId) {
    const startTime = Date.now();
    const result = {
        success: false,
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0,
        itemsFailed: 0,
        duration: 0,
    };
    try {
        const integration = await getPlanningCenterStatus(churchId);
        if (!integration || !integration.isEnabled || !integration.memberSyncEnabled) {
            throw new Error('Planning Center integration not enabled for member sync');
        }
        const client = new PlanningCenterClient(integration.accessToken);
        const people = await client.getPeople(integration.organizationId);
        console.log(`[Planning Center] Syncing ${people.length} members for church ${churchId}`);
        for (const person of people) {
            try {
                // Create or update member in YW Messaging
                const existingMember = await prisma.member.findFirst({
                    where: {
                        phone: person.phone,
                        groups: {
                            some: {
                                group: { churchId },
                            },
                        },
                    },
                });
                if (existingMember) {
                    // Update existing member
                    await prisma.member.update({
                        where: { id: existingMember.id },
                        data: {
                            firstName: person.firstName,
                            lastName: person.lastName,
                            email: person.email,
                        },
                    });
                    result.itemsUpdated++;
                }
                else if (person.phone) {
                    // Create new member (must have phone number)
                    // Find a default group or create members group
                    let group = await prisma.group.findFirst({
                        where: { churchId, name: 'Members' },
                    });
                    if (!group) {
                        // Get first branch for this church
                        const branch = await prisma.branch.findFirst({
                            where: { churchId },
                        });
                        if (!branch) {
                            console.warn(`[Planning Center] No branch found for church ${churchId}, skipping member creation`);
                            result.itemsFailed++;
                            continue;
                        }
                        group = await prisma.group.create({
                            data: {
                                churchId,
                                branchId: branch.id,
                                name: 'Members',
                                description: 'Auto-created group for Planning Center synced members',
                            },
                        });
                    }
                    const newMember = await prisma.member.create({
                        data: {
                            firstName: person.firstName,
                            lastName: person.lastName,
                            email: person.email,
                            phone: person.phone,
                            groups: {
                                create: {
                                    groupId: group.id,
                                },
                            },
                        },
                    });
                    result.itemsCreated++;
                }
                else {
                    result.itemsFailed++;
                }
                result.itemsProcessed++;
            }
            catch (error) {
                console.error(`[Planning Center] Failed to sync member ${person.id}: ${error.message}`);
                result.itemsFailed++;
            }
        }
        // Update last sync time
        await prisma.planningCenterIntegration.update({
            where: { churchId },
            data: {
                lastSyncAt: new Date(),
                syncStatus: 'active',
                errorMessage: null,
            },
        });
        result.success = true;
        result.duration = Date.now() - startTime;
        console.log(`[Planning Center] Sync complete: ${result.itemsCreated} created, ${result.itemsUpdated} updated, ${result.itemsFailed} failed`);
        // Invalidate cache
        await invalidateCache(CACHE_KEYS.churchAll(churchId));
        return result;
    }
    catch (error) {
        result.duration = Date.now() - startTime;
        result.error = error.message;
        // Update integration status to failed
        await prisma.planningCenterIntegration.update({
            where: { churchId },
            data: {
                syncStatus: 'failed',
                errorMessage: error.message,
            },
        }).catch(() => { }); // Ignore if integration doesn't exist
        console.error(`[Planning Center] Sync failed: ${error.message}`);
        return result;
    }
}
/**
 * Disconnect Planning Center from a church
 * Revokes access token and disables integration
 */
export async function disconnectPlanningCenter(churchId) {
    try {
        await prisma.planningCenterIntegration.update({
            where: { churchId },
            data: {
                isEnabled: false,
                accessToken: '', // Clear token
                syncStatus: 'pending',
            },
        });
        // Invalidate cache
        await invalidateCache(CACHE_KEYS.churchAll(churchId));
        await invalidateCache(CACHE_KEYS.planningCenterStatus(churchId));
        console.log(`[Planning Center] Disconnected church ${churchId}`);
    }
    catch (error) {
        console.error(`[Planning Center] Failed to disconnect: ${error.message}`);
        throw error;
    }
}
/**
 * Check if token needs refresh
 */
function isTokenExpired(expiresAt) {
    if (!expiresAt)
        return false;
    // Refresh if expiring within 5 minutes
    return new Date().getTime() > expiresAt.getTime() - 5 * 60 * 1000;
}
/**
 * Validate Planning Center integration setup
 */
export async function validatePlanningCenterSetup(churchId) {
    try {
        const integration = await getPlanningCenterStatus(churchId);
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
    }
    catch (error) {
        return { valid: false, error: error.message };
    }
}
//# sourceMappingURL=planning-center.service.js.map