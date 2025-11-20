import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password.utils.js';
const prisma = new PrismaClient();
/**
 * Update church profile
 */
export async function updateChurchProfile(churchId, input) {
    try {
        const updated = await prisma.church.update({
            where: { id: churchId },
            data: {
                // Basic profile
                ...(input.name && { name: input.name }),
                ...(input.email && { email: input.email }),
                // 10DLC Delivery Option
                ...(typeof input.wantsPremiumDelivery === 'boolean' && { wantsPremiumDelivery: input.wantsPremiumDelivery }),
                // 10DLC Brand Information
                ...(input.ein && { ein: input.ein }),
                ...(input.brandPhoneNumber && { brandPhoneNumber: input.brandPhoneNumber }),
                ...(input.streetAddress && { streetAddress: input.streetAddress }),
                ...(input.city && { city: input.city }),
                ...(input.state && { state: input.state }),
                ...(input.postalCode && { postalCode: input.postalCode }),
                ...(input.website && { website: input.website }),
                ...(input.entityType && { entityType: input.entityType }),
                ...(input.vertical && { vertical: input.vertical }),
            },
        });
        console.log(`✅ Church profile updated: ${churchId}`);
        return updated;
    }
    catch (error) {
        console.error('Failed to update church profile:', error);
        throw error;
    }
}
/**
 * Get church profile (including 10DLC fields)
 */
export async function getChurchProfile(churchId) {
    try {
        const church = await prisma.church.findUnique({
            where: { id: churchId },
            select: {
                // Basic profile
                id: true,
                name: true,
                email: true,
                subscriptionStatus: true,
                createdAt: true,
                updatedAt: true,
                // 10DLC Delivery Status
                wantsPremiumDelivery: true,
                dlcStatus: true,
                deliveryRate: true,
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
        return church;
    }
    catch (error) {
        console.error('Failed to get church profile:', error);
        throw error;
    }
}
/**
 * Get all co-admins for a church
 */
export async function getCoAdmins(churchId) {
    try {
        const coAdmins = await prisma.admin.findMany({
            where: {
                churchId,
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
export async function removeCoAdmin(churchId, adminId) {
    try {
        // Verify admin belongs to church
        const admin = await prisma.admin.findFirst({
            where: {
                id: adminId,
                churchId,
            },
        });
        if (!admin) {
            throw new Error('Co-admin not found');
        }
        if (admin.role !== 'CO_ADMIN') {
            throw new Error('Can only remove co-admins, not primary admins');
        }
        // Delete the admin
        await prisma.admin.delete({
            where: { id: adminId },
        });
        console.log(`✅ Co-admin removed: ${adminId} from church ${churchId}`);
    }
    catch (error) {
        console.error('Failed to remove co-admin:', error);
        throw error;
    }
}
/**
 * Log an activity
 */
export async function logActivity(churchId, adminId, action, details = {}) {
    try {
        const logEntry = {
            churchId,
            adminId,
            action,
            details: JSON.stringify(details),
            timestamp: new Date(),
        };
        console.log(`📝 Activity logged - Church: ${churchId}, Action: ${action}, Admin: ${adminId}`);
        // In production, store in database
        // await prisma.activityLog.create({ data: logEntry });
        return logEntry;
    }
    catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw - activity logging shouldn't break main operations
    }
}
/**
 * Get activity logs for a church
 */
export async function getActivityLogs(churchId, limit = 50, offset = 0) {
    try {
        // For MVP, return mock logs
        const logs = [
            {
                id: `log_${Date.now()}`,
                churchId,
                action: 'Login',
                details: 'Admin logged in',
                timestamp: new Date(Date.now() - 3600000),
                adminEmail: 'admin@church.com',
            },
            {
                id: `log_${Date.now() - 1}`,
                churchId,
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
export async function getActivityLogCount(churchId) {
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
export async function inviteCoAdmin(churchId, email, firstName, lastName) {
    try {
        // Check if email already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { email },
        });
        if (existingAdmin) {
            throw new Error('Email already in use');
        }
        // Generate a temporary password (12 characters)
        const tempPassword = Math.random().toString(36).slice(2, 14);
        // Hash the temporary password
        const passwordHash = await hashPassword(tempPassword);
        // Create new co-admin
        const newAdmin = await prisma.admin.create({
            data: {
                churchId,
                email,
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
        console.log(`✅ Co-admin invited: ${email} for church ${churchId}`);
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