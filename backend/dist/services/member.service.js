import { PrismaClient } from '@prisma/client';
import { formatToE164 } from '../utils/phone.utils.js';
import { encrypt, decrypt, hashForSearch } from '../utils/encryption.utils.js';
import { queueWelcomeMessage } from '../jobs/welcomeMessage.job.js';
import { getUsage, getCurrentPlan, getPlanLimits } from './billing.service.js';
const prisma = new PrismaClient();
/**
 * Get members for a group with pagination and search
 */
export async function getMembers(groupId, options = {}) {
    const { page = 1, limit = 50, search } = options;
    const skip = (page - 1) * limit;
    const group = await prisma.group.findUnique({
        where: { id: groupId },
    });
    if (!group) {
        throw new Error('Group not found');
    }
    const where = {
        groups: {
            some: { groupId },
        },
    };
    if (search) {
        try {
            const formattedPhone = formatToE164(search);
            const phoneHash = hashForSearch(formattedPhone);
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phoneHash },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        catch (error) {
            // If phone formatting fails, just search text fields
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
    }
    const [members, total] = await Promise.all([
        prisma.member.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                optInSms: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.member.count({ where }),
    ]);
    // Decrypt phone numbers in results
    const decryptedMembers = members.map((member) => ({
        ...member,
        phone: decrypt(member.phone),
    }));
    return {
        data: decryptedMembers,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
/**
 * Add single member to group
 */
export async function addMember(groupId, data) {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
    });
    if (!group) {
        throw new Error('Group not found');
    }
    // Check plan limits before adding member
    const usage = await getUsage(group.churchId);
    const plan = await getCurrentPlan(group.churchId);
    const limits = getPlanLimits(plan);
    if (limits && limits.members && usage.members >= limits.members) {
        throw new Error(`Member limit of ${limits.members} reached for ${plan} plan. Please upgrade your plan to add more members.`);
    }
    // Format phone to E.164
    const formattedPhone = formatToE164(data.phone);
    const phoneHash = hashForSearch(formattedPhone);
    // Check if member with this phone exists
    let member = await prisma.member.findFirst({
        where: { phoneHash },
    });
    // Also check by email if phoneHash didn't match
    if (!member && data.email?.trim()) {
        member = await prisma.member.findFirst({
            where: { email: data.email.trim() },
        });
    }
    // Create member if doesn't exist
    if (!member) {
        member = await prisma.member.create({
            data: {
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                phone: encrypt(formattedPhone),
                phoneHash,
                email: data.email?.trim(),
                optInSms: data.optInSms ?? true,
            },
        });
    }
    // Check if already in group
    const existing = await prisma.groupMember.findUnique({
        where: {
            groupId_memberId: {
                groupId,
                memberId: member.id,
            },
        },
    });
    if (existing) {
        throw new Error('Member already in this group');
    }
    // Add to group
    const groupMember = await prisma.groupMember.create({
        data: {
            groupId,
            memberId: member.id,
        },
        include: {
            member: true,
        },
    });
    // Queue welcome message if enabled
    try {
        queueWelcomeMessage(groupMember.id, groupId, member.id, 60000);
    }
    catch (error) {
        console.error('Error queueing welcome message:', error);
    }
    return {
        id: groupMember.member.id,
        firstName: groupMember.member.firstName,
        lastName: groupMember.member.lastName,
        phone: decrypt(groupMember.member.phone),
        email: groupMember.member.email,
        optInSms: groupMember.member.optInSms,
        createdAt: groupMember.member.createdAt,
    };
}
/**
 * Bulk import members to group
 */
export async function importMembers(groupId, membersData) {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
    });
    if (!group) {
        throw new Error('Group not found');
    }
    // Check plan limits before importing
    const usage = await getUsage(group.churchId);
    const plan = await getCurrentPlan(group.churchId);
    const limits = getPlanLimits(plan);
    const remainingCapacity = limits ? limits.members - usage.members : 999999;
    if (remainingCapacity <= 0) {
        throw new Error(`Member limit of ${limits?.members || "unlimited"} reached for ${plan} plan. Please upgrade your plan to add more members.`);
    }
    if (membersData.length > remainingCapacity) {
        throw new Error(`Import would exceed member limit. You have ${remainingCapacity} member slot(s) remaining, but are trying to import ${membersData.length} members.`);
    }
    const imported = [];
    const failed = [];
    for (const data of membersData) {
        try {
            const formattedPhone = formatToE164(data.phone);
            const phoneHash = hashForSearch(formattedPhone);
            // Find or create member
            let member = await prisma.member.findFirst({
                where: { phoneHash },
            });
            // Also check by email if phoneHash didn't match
            if (!member && data.email?.trim()) {
                member = await prisma.member.findFirst({
                    where: { email: data.email.trim() },
                });
            }
            if (!member) {
                member = await prisma.member.create({
                    data: {
                        firstName: data.firstName.trim(),
                        lastName: data.lastName.trim(),
                        phone: encrypt(formattedPhone),
                        phoneHash,
                        email: data.email?.trim(),
                        optInSms: true,
                    },
                });
            }
            // Skip if already in group
            const existing = await prisma.groupMember.findUnique({
                where: {
                    groupId_memberId: {
                        groupId,
                        memberId: member.id,
                    },
                },
            });
            if (existing) {
                // Count as failed - already in group
                failed.push({
                    member: data,
                    error: 'Already in this group',
                });
                continue;
            }
            // Add to group
            const groupMember = await prisma.groupMember.create({
                data: {
                    groupId,
                    memberId: member.id,
                },
            });
            // Queue welcome message if enabled
            try {
                queueWelcomeMessage(groupMember.id, groupId, member.id, 60000);
            }
            catch (error) {
                console.error('Error queueing welcome message:', error);
            }
            imported.push({
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                phone: decrypt(member.phone),
                email: member.email,
            });
        }
        catch (error) {
            failed.push({
                member: data,
                error: error.message,
            });
        }
    }
    return {
        imported: imported.length,
        failed: failed.length,
        failedDetails: failed,
    };
}
/**
 * Update member
 */
export async function updateMember(memberId, data) {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
    });
    if (!member) {
        throw new Error('Member not found');
    }
    const updateData = {};
    if (data.firstName)
        updateData.firstName = data.firstName.trim();
    if (data.lastName)
        updateData.lastName = data.lastName.trim();
    if (data.phone) {
        const formattedPhone = formatToE164(data.phone);
        updateData.phone = encrypt(formattedPhone);
        updateData.phoneHash = hashForSearch(formattedPhone);
    }
    if (data.email !== undefined)
        updateData.email = data.email?.trim();
    if (data.optInSms !== undefined)
        updateData.optInSms = data.optInSms;
    const updated = await prisma.member.update({
        where: { id: memberId },
        data: updateData,
    });
    return {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: decrypt(updated.phone),
        email: updated.email,
        optInSms: updated.optInSms,
        createdAt: updated.createdAt,
    };
}
/**
 * Remove member from group
 */
export async function removeMemberFromGroup(groupId, memberId) {
    const groupMember = await prisma.groupMember.findUnique({
        where: {
            groupId_memberId: {
                groupId,
                memberId,
            },
        },
    });
    if (!groupMember) {
        throw new Error('Member not in this group');
    }
    await prisma.groupMember.delete({
        where: {
            groupId_memberId: {
                groupId,
                memberId,
            },
        },
    });
    return { success: true };
}
//# sourceMappingURL=member.service.js.map