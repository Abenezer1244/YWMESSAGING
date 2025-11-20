import client from './client';

export interface ChurchProfile {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
  // Delivery Tier
  wantsPremiumDelivery?: boolean;
  dlcStatus?: string;
  deliveryRate?: number;
  // 10DLC Brand Information
  ein?: string | null;
  brandPhoneNumber?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  website?: string | null;
  entityType?: string | null;
  vertical?: string | null;
}

export interface CoAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  churchId: string;
  action: string;
  details: string;
  timestamp: string;
  adminEmail: string;
}

export interface ActivityLogsResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get church profile
 */
export async function getProfile(): Promise<ChurchProfile> {
  const response = await client.get('/admin/profile');
  return response.data;
}

/**
 * Update church profile (including 10DLC fields and delivery tier selection)
 */
export async function updateProfile(data: {
  name?: string;
  email?: string;
  description?: string;
  // Delivery Tier Selection
  wantsPremiumDelivery?: boolean;
  // 10DLC Brand Information
  ein?: string;
  brandPhoneNumber?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  website?: string;
  entityType?: string;
  vertical?: string;
}): Promise<{ success: boolean; profile: ChurchProfile }> {
  const response = await client.put('/admin/profile', data);
  return response.data;
}

/**
 * Get all co-admins
 */
export async function getCoAdmins(): Promise<CoAdmin[]> {
  const response = await client.get('/admin/co-admins');
  return response.data;
}

/**
 * Invite a new co-admin
 */
export async function inviteCoAdmin(data: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<{ success: boolean; data: { admin: CoAdmin; tempPassword: string } }> {
  const response = await client.post('/admin/co-admins', data);
  return response.data;
}

/**
 * Remove a co-admin
 */
export async function removeCoAdmin(adminId: string): Promise<{ success: boolean; message: string }> {
  const response = await client.delete(`/admin/co-admins/${adminId}`);
  return response.data;
}

/**
 * Get activity logs
 */
export async function getActivityLogs(
  page: number = 1,
  limit: number = 50
): Promise<ActivityLogsResponse> {
  const response = await client.get('/admin/activity-logs', {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Log an activity
 */
export async function logActivity(
  action: string,
  details: Record<string, any>
): Promise<{ success: boolean }> {
  const response = await client.post('/admin/activity-log', {
    action,
    details,
  });
  return response.data;
}

/**
 * Link a phone number and auto-create webhook
 */
export async function linkPhoneNumber(
  phoneNumber: string
): Promise<{
  success: boolean;
  data: {
    phoneNumber: string;
    webhookId: string | null;
    verified: boolean;
    message: string;
  };
}> {
  const response = await client.post('/admin/phone-numbers/link', {
    phoneNumber,
  });
  return response.data;
}
