import { hashPassword } from '../utils/password.utils.js';
import { getCached, setCached, invalidateCache, CACHE_KEYS, CACHE_TTL } from './cache.service.js';
import { encrypt, hashForSearch } from '../utils/encryption.utils.js';
import { getRegistryPrisma } from '../lib/tenant-prisma.js';
/**
 * Update church profile (registry)
 */
export async function updateChurchProfile(tenantId, input) {
    try {
        const registryPrisma = getRegistryPrisma();
        const updated = await registryPrisma.church.update({
            where: { id: tenantId },
            data: {
                // Basic profile
                ...(input.name !== undefined && { name: input.name }),
                ...(input.email !== undefined && { email: input.email }),
                // 10DLC Delivery Option
                ...(input.wantsPremiumDelivery !== undefined && { wantsPremiumDelivery: input.wantsPremiumDelivery }),
                // 10DLC Brand Information (ein is handled separately in controller for encryption)
                ...(input.brandPhoneNumber !== undefined && { brandPhoneNumber: input.brandPhoneNumber }),
                ...(input.streetAddress !== undefined && { streetAddress: input.streetAddress }),
                ...(input.city !== undefined && { city: input.city }),
                ...(input.state !== undefined && { state: input.state }),
                ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
                ...(input.website !== undefined && { website: input.website }),
                ...(input.entityType !== undefined && { entityType: input.entityType }),
                ...(input.vertical !== undefined && { vertical: input.vertical }),
            },
        });
        console.log(`✅ Church profile updated: ${tenantId}`);
        // Invalidate church settings cache
        await invalidateCache(CACHE_KEYS.churchSettings(tenantId));
        return updated;
    }
    catch (error) {
        console.error('Failed to update church profile:', error);
        throw error;
    }
}
/**
 * Get church profile (registry) - cached for 1 hour
 */
export async function getChurchProfile(tenantId) {
    try {
        // Try cache first
        const cached = await getCached(CACHE_KEYS.churchSettings(tenantId));
        if (cached) {
            return cached;
        }
        const registryPrisma = getRegistryPrisma();
        const church = await registryPrisma.church.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                // 10DLC Delivery Option
                wantsPremiumDelivery: true,
                dlcStatus: true,
                dlcBrandId: true,
                dlcCampaignId: true,
                dlcRegisteredAt: true,
                dlcApprovedAt: true,
                // 10DLC Brand Information
                ein: true,
                brandPhoneNumber: true,
                streetAddress: true,
                city: true,
                state: true,
                postalCode: true,
                website: true,
                entityType: true,
                vertical: true,
            },
        });
        // Cache for 1 hour
        if (church) {
            await setCached(CACHE_KEYS.churchSettings(tenantId), church, CACHE_TTL.LONG);
        }
        return church;
    }
    catch (error) {
        console.error('Failed to get church profile:', error);
        throw error;
    }
}
/**
 * Get all co-admins for a tenant - cached for 30 minutes
 */
export async function getCoAdmins(tenantId, tenantPrisma) {
    try {
        // Try cache first
        const cacheKey = `church:${tenantId}:coadmins`;
        const cached = await getCached(cacheKey);
        if (cached) {
            return cached;
        }
        const coAdmins = await tenantPrisma.admin.findMany({
            where: {
                role: 'CO_ADMIN',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });
        // Cache for 30 minutes
        await setCached(cacheKey, coAdmins, CACHE_TTL.MEDIUM);
        return coAdmins;
    }
    catch (error) {
        console.error('Failed to get co-admins:', error);
        throw error;
    }
}
/**
 * Remove a co-admin
 */
export async function removeCoAdmin(tenantId, tenantPrisma, adminId) {
    try {
        // Verify admin exists and is co-admin
        const admin = await tenantPrisma.admin.findUnique({
            where: { id: adminId },
        });
        if (!admin) {
            throw new Error('Co-admin not found');
        }
        if (admin.role !== 'CO_ADMIN') {
            throw new Error('Can only remove co-admins, not primary admins');
        }
        // Delete the admin
        await tenantPrisma.admin.delete({
            where: { id: adminId },
        });
        // Invalidate co-admins cache
        const cacheKey = `church:${tenantId}:coadmins`;
        await invalidateCache(cacheKey);
        // Invalidate admin's own cache
        await invalidateCache(CACHE_KEYS.adminRole(adminId));
        console.log(`✅ Co-admin removed: ${adminId} from church ${tenantId}`);
    }
    catch (error) {
        console.error('Failed to remove co-admin:', error);
        throw error;
    }
}
/**
 * Log an activity
 */
export async function logActivity(tenantId, adminId, action, details = {}) {
    try {
        const logEntry = {
            tenantId,
            adminId,
            action,
            details: JSON.stringify(details),
            timestamp: new Date(),
        };
        console.log(`📝 Activity logged - Tenant: ${tenantId}, Action: ${action}, Admin: ${adminId}`);
        // In production, store in database
        // await tenantPrisma.activityLog.create({ data: logEntry });
        return logEntry;
    }
    catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw - activity logging shouldn't break main operations
    }
}
/**
 * Get activity logs for a tenant
 */
export async function getActivityLogs(tenantId, limit = 50, offset = 0) {
    try {
        // For MVP, return mock logs
        const logs = [
            {
                id: `log_${Date.now()}`,
                tenantId,
                action: 'Login',
                details: 'Admin logged in',
                timestamp: new Date(Date.now() - 3600000),
                adminEmail: 'admin@church.com',
            },
            {
                id: `log_${Date.now() - 1}`,
                tenantId,
                action: 'Message Sent',
                details: '5 messages sent to group',
                timestamp: new Date(Date.now() - 7200000),
                adminEmail: 'admin@church.com',
            },
        ];
        return logs.slice(offset, offset + limit);
    }
    catch (error) {
        console.error('Failed to get activity logs:', error);
        throw error;
    }
}
/**
 * Get activity log count
 */
export async function getActivityLogCount(tenantId) {
    try {
        // For MVP, return mock count
        return 42;
    }
    catch (error) {
        console.error('Failed to get activity log count:', error);
        throw error;
    }
}
/**
 * Invite a co-admin (create new co-admin account)
 */
export async function inviteCoAdmin(tenantId, tenantPrisma, email, firstName, lastName) {
    try {
        // Check if email already exists
        const existingAdmin = await tenantPrisma.admin.findFirst({
            where: { email },
        });
        if (existingAdmin) {
            throw new Error('Email already in use');
        }
        // Generate a temporary password (12 characters)
        const tempPassword = Math.random().toString(36).slice(2, 14);
        // Hash the temporary password
        const passwordHash = await hashPassword(tempPassword);
        // Encrypt email for new co-admin
        const encryptedEmail = encrypt(email);
        const emailHash = hashForSearch(email);
        // Create new co-admin
        const newAdmin = await tenantPrisma.admin.create({
            data: {
                email,
                encryptedEmail,
                emailHash,
                firstName,
                lastName,
                passwordHash,
                role: 'CO_ADMIN',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });
        // Invalidate co-admins cache
        const cacheKey = `church:${tenantId}:coadmins`;
        await invalidateCache(cacheKey);
        console.log(`✅ Co-admin invited: ${email} for church ${tenantId}`);
        // Return co-admin info with temporary password
        return {
            admin: newAdmin,
            tempPassword, // Primary admin shares this with co-admin
        };
    }
    catch (error) {
        console.error('Failed to invite co-admin:', error);
        throw error;
    }
}
//# sourceMappingURL=admin.service.js.map