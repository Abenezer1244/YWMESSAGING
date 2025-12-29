import { updateChurchProfile, getChurchProfile, getCoAdmins, removeCoAdmin, inviteCoAdmin, logActivity, getActivityLogs, getActivityLogCount, } from '../services/admin.service.js';
import * as telnyxService from '../services/telnyx.service.js';
import { getTenantPrisma, getRegistryPrisma } from '../lib/tenant-prisma.js';
/**
 * GET /api/admin/profile
 * Get church profile
 */
export async function getProfileHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const profile = await getChurchProfile(tenantId);
        res.json(profile);
    }
    catch (error) {
        console.error('Failed to get profile:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
}
/**
 * GET /api/admin/delivery-tier-status
 * Get detailed delivery tier information
 * Returns current tier, benefits, and recommendations
 */
export async function getDeliveryTierStatusHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const registryPrisma = getRegistryPrisma();
        const church = await registryPrisma.church.findUnique({
            where: { id: tenantId },
            select: {
                wantsPremiumDelivery: true,
                dlcStatus: true,
                deliveryRate: true,
                dlcApprovedAt: true,
            },
        });
        if (!church) {
            return res.status(404).json({ error: 'Church not found' });
        }
        // Build response based on current tier
        const tierInfo = {
            currentTier: church.wantsPremiumDelivery ? 'premium' : 'shared',
            dlcStatus: church.dlcStatus,
            deliveryRate: church.deliveryRate || (church.wantsPremiumDelivery ? 0.99 : 0.65),
            approvedAt: church.dlcApprovedAt,
        };
        // Add tier-specific benefits
        if (church.wantsPremiumDelivery) {
            Object.assign(tierInfo, {
                tierName: 'Premium 10DLC',
                description: 'Your church\'s personally verified SMS brand',
                expectedDeliveryRate: '99%',
                benefits: [
                    'Highest delivery reliability (99%)',
                    'Your church\'s branded SMS sender',
                    'Individually verified with carriers',
                    'Priority handling by carriers',
                ],
                setupTime: church.dlcStatus === 'approved' ? 'Complete ✅' : '1-2 days',
                requirements: [
                    'Business EIN',
                    'Church address',
                    'Brand contact phone',
                ],
            });
        }
        else {
            Object.assign(tierInfo, {
                tierName: 'Standard Delivery (Shared Brand)',
                description: 'Platform\'s pre-verified shared SMS brand',
                expectedDeliveryRate: '65%',
                benefits: [
                    'Instant activation',
                    'No EIN required',
                    'Pre-verified brand',
                    'Works great for announcements',
                ],
                setupTime: 'Ready now ✅',
                requirements: [],
                upgradeInfo: {
                    available: true,
                    message: 'Upgrade to Premium 10DLC anytime for 99% delivery',
                },
            });
        }
        res.json(tierInfo);
    }
    catch (error) {
        console.error('Failed to get delivery tier status:', error);
        res.status(500).json({ error: 'Failed to get delivery tier status' });
    }
}
/**
 * PUT /api/admin/profile
 * Update church profile
 */
export async function updateProfileHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { name, email, description, 
        // 10DLC Delivery Option
        wantsPremiumDelivery, 
        // 10DLC Brand Information
        ein, brandPhoneNumber, streetAddress, city, state, postalCode, website, entityType, vertical, } = req.body;
        const updated = await updateChurchProfile(tenantId, {
            name,
            email,
            description,
            // 10DLC Delivery Option
            wantsPremiumDelivery,
            // 10DLC Brand Information
            ein,
            brandPhoneNumber,
            streetAddress,
            city,
            state,
            postalCode,
            website,
            entityType,
            vertical,
        });
        // Log activity
        await logActivity(tenantId, req.user?.adminId || '', 'Update Profile', {
            name,
            email,
            ein,
            city,
            state,
        });
        // 🔄 Handle delivery tier selection (Shared Brand vs Premium 10DLC)
        // If church opted-in to premium 10DLC, trigger registration if they have required fields
        // If church wants shared brand, skip 10DLC registration
        const has10DLCFields = ein && brandPhoneNumber && streetAddress && city && state && postalCode;
        const registryPrisma = getRegistryPrisma();
        if (wantsPremiumDelivery === false && updated.dlcStatus === 'pending') {
            // Church explicitly chose shared brand - set status and skip 10DLC
            console.log(`📊 Tenant ${tenantId} selected shared brand delivery (65%)`);
            await registryPrisma.church.update({
                where: { id: tenantId },
                data: { dlcStatus: 'shared_brand' },
            });
        }
        else if (wantsPremiumDelivery === true && has10DLCFields && updated.telnyxPhoneNumber) {
            // Church opted-in to premium 10DLC and has all required fields
            console.log(`🔔 Triggering 10DLC registration for tenant ${tenantId} with phone ${updated.telnyxPhoneNumber}`);
            try {
                // CRITICAL FIX: Verify database persistence before triggering async job
                // Fetch fresh church record to ensure all 10DLC fields persisted
                const freshChurch = await registryPrisma.church.findUnique({
                    where: { id: tenantId },
                    select: {
                        ein: true,
                        brandPhoneNumber: true,
                        streetAddress: true,
                        city: true,
                        state: true,
                        postalCode: true,
                        telnyxPhoneNumber: true,
                    },
                });
                // Verify all required fields are actually in database
                if (freshChurch?.ein && freshChurch?.brandPhoneNumber && freshChurch?.streetAddress &&
                    freshChurch?.city && freshChurch?.state && freshChurch?.postalCode) {
                    const { registerPersonal10DLCAsync } = await import('../jobs/10dlc-registration.js');
                    registerPersonal10DLCAsync(tenantId, updated.telnyxPhoneNumber).catch((err) => {
                        console.error(`⚠️ Failed to start 10DLC registration for tenant ${tenantId}:`, err);
                        // Don't fail the request, just log it
                    });
                }
                else {
                    console.warn(`⚠️ 10DLC fields failed to persist to database. Skipping registration until verified.`);
                }
            }
            catch (error) {
                console.error('⚠️ Could not import 10DLC job, skipping async registration:', error);
            }
        }
        else if (wantsPremiumDelivery === true && has10DLCFields && !updated.telnyxPhoneNumber) {
            console.log(`⏳ 10DLC info saved but no phone number yet. Registration will trigger when phone is linked.`);
        }
        res.json({
            success: true,
            profile: updated,
        });
    }
    catch (error) {
        console.error('Failed to update profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}
/**
 * GET /api/admin/co-admins
 * Get all co-admins
 */
export async function getCoAdminsHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const tenantPrisma = await getTenantPrisma(tenantId);
        const coAdmins = await getCoAdmins(tenantId, tenantPrisma);
        res.json(coAdmins);
    }
    catch (error) {
        console.error('Failed to get co-admins:', error);
        res.status(500).json({ error: 'Failed to get co-admins' });
    }
}
/**
 * DELETE /api/admin/co-admins/:adminId
 * Remove a co-admin
 */
export async function removeCoAdminHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { adminId } = req.params;
        if (!adminId) {
            return res.status(400).json({ error: 'Admin ID required' });
        }
        const tenantPrisma = await getTenantPrisma(tenantId);
        await removeCoAdmin(tenantId, tenantPrisma, adminId);
        // Log activity
        await logActivity(tenantId, req.user?.adminId || '', 'Remove Co-Admin', {
            adminId,
        });
        res.json({
            success: true,
            message: 'Co-admin removed',
        });
    }
    catch (error) {
        console.error('Failed to remove co-admin:', error);
        res.status(500).json({ error: error.message || 'Failed to remove co-admin' });
    }
}
/**
 * POST /api/admin/co-admins
 * Invite a new co-admin
 */
export async function inviteCoAdminHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { email, firstName, lastName } = req.body;
        // Validate required fields
        if (!email || !firstName || !lastName) {
            return res.status(400).json({ error: 'Email, first name, and last name required' });
        }
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        const tenantPrisma = await getTenantPrisma(tenantId);
        const result = await inviteCoAdmin(tenantId, tenantPrisma, email, firstName, lastName);
        // Log activity
        await logActivity(tenantId, req.user?.adminId || '', 'Invite Co-Admin', {
            email,
            firstName,
            lastName,
        });
        res.status(201).json({
            success: true,
            data: {
                admin: result.admin,
                tempPassword: result.tempPassword,
            },
        });
    }
    catch (error) {
        console.error('Failed to invite co-admin:', error);
        const errorMessage = error.message;
        if (errorMessage === 'Email already in use') {
            return res.status(400).json({ error: 'Email already in use' });
        }
        res.status(500).json({ error: errorMessage || 'Failed to invite co-admin' });
    }
}
/**
 * GET /api/admin/activity-logs
 * Get activity logs
 * Query params: ?page=1&limit=50
 */
export async function getActivityLogsHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 50);
        const offset = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            getActivityLogs(tenantId, limit, offset),
            getActivityLogCount(tenantId),
        ]);
        res.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Failed to get activity logs:', error);
        res.status(500).json({ error: 'Failed to get activity logs' });
    }
}
/**
 * POST /api/admin/activity-log
 * Log an activity (internal use)
 */
export async function logActivityHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { action, details } = req.body;
        await logActivity(tenantId, req.user?.adminId || '', action, details);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to log activity:', error);
        res.status(500).json({ error: 'Failed to log activity' });
    }
}
/**
 * POST /api/admin/phone-numbers/link
 * Link a phone number and auto-create webhook
 */
export async function linkPhoneNumberHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number required' });
        }
        // Normalize phone number to E.164 format
        const normalizedPhone = phoneNumber.replace(/\D/g, '');
        if (normalizedPhone.length < 10) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
        const formattedPhone = `+1${normalizedPhone.slice(-10)}`;
        const registryPrisma = getRegistryPrisma();
        // Check if number already linked to another tenant
        const existingTenant = await registryPrisma.church.findFirst({
            where: { telnyxPhoneNumber: formattedPhone },
        });
        if (existingTenant && existingTenant.id !== tenantId) {
            return res.status(400).json({ error: 'Phone number already linked to another church' });
        }
        // Auto-create webhook
        let webhookId = null;
        try {
            const webhookUrl = `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/mms`;
            const webhook = await telnyxService.createWebhook(webhookUrl);
            webhookId = webhook.id;
            console.log(`✅ Webhook auto-created for tenant ${tenantId}: ${webhookId}`);
            // Try to link the number to the messaging profile
            try {
                console.log(`📍 Attempting to link manually added number ${formattedPhone} to messaging profile ${webhookId}...`);
                await telnyxService.linkPhoneNumberToMessagingProfile(formattedPhone, webhookId);
                console.log(`✅ Manual number linking succeeded for ${formattedPhone}`);
            }
            catch (linkError) {
                console.warn(`⚠️ Manual number linking failed: ${linkError.message}`);
                // Continue - might still work if number is configured correctly in Telnyx
            }
        }
        catch (webhookError) {
            console.warn(`⚠️ Webhook creation failed, but continuing: ${webhookError.message}`);
            // Don't fail the whole request if webhook creation fails
            // User can manually create it if needed
        }
        // Get current tenant state to check delivery preference
        const tenant = await registryPrisma.church.findUnique({
            where: { id: tenantId },
            select: { wantsPremiumDelivery: true },
        });
        // Update tenant with phone number and webhook ID
        // Initialize 10DLC fields: start with shared brand for immediate use
        const updated = await registryPrisma.church.update({
            where: { id: tenantId },
            data: {
                telnyxPhoneNumber: formattedPhone,
                telnyxVerified: true,
                telnyxWebhookId: webhookId,
                telnyxPurchasedAt: new Date(),
                // 10DLC: Start with shared brand for 60-70% delivery
                usingSharedBrand: true,
                dlcStatus: tenant?.wantsPremiumDelivery ? 'pending' : 'shared_brand',
                dlcNextCheckAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // Check in 12 hours
                deliveryRate: 0.65, // 65% with shared brand
            },
            select: {
                id: true,
                telnyxPhoneNumber: true,
                telnyxWebhookId: true,
                telnyxVerified: true,
                usingSharedBrand: true,
                deliveryRate: true,
            },
        });
        // Only trigger 10DLC registration if tenant opted-in to premium delivery
        if (tenant?.wantsPremiumDelivery) {
            try {
                // Import the background job function
                const { registerPersonal10DLCAsync } = await import('../jobs/10dlc-registration.js');
                registerPersonal10DLCAsync(tenantId, formattedPhone).catch((err) => {
                    console.error(`⚠️ Failed to start 10DLC registration for tenant ${tenantId}:`, err);
                    // Don't fail the request, just log it
                });
            }
            catch (error) {
                console.error('⚠️ Could not import 10DLC job, skipping async registration:', error);
            }
        }
        else {
            console.log(`📊 Phone linked but tenant ${tenantId} on shared brand delivery - skipping 10DLC registration`);
        }
        // Log activity
        await logActivity(tenantId, req.user?.adminId || '', 'Link Phone Number', {
            phoneNumber: formattedPhone,
            webhookId: webhookId || 'manual',
        });
        res.json({
            success: true,
            data: {
                phoneNumber: updated.telnyxPhoneNumber,
                webhookId: updated.telnyxWebhookId,
                verified: updated.telnyxVerified,
                message: webhookId
                    ? 'Phone number linked and webhook auto-created successfully!'
                    : 'Phone number linked! Please configure webhook manually in Telnyx dashboard.',
            },
        });
    }
    catch (error) {
        console.error('Failed to link phone number:', error);
        const errorMessage = error.message;
        res.status(500).json({ error: errorMessage || 'Failed to link phone number' });
    }
}
//# sourceMappingURL=admin.controller.js.map