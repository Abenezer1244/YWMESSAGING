import client from './client';

// ============================================
// RCS API Types
// ============================================

export interface RCSStatus {
  configured: boolean;
  agentId: string | null;
  ready: boolean;
  message: string;
}

export interface RichCardData {
  title: string;
  description?: string;
  imageUrl?: string;
  rsvpUrl?: string;
  websiteUrl?: string;
  phoneNumber?: string;
  location?: {
    latitude: number;
    longitude: number;
    label: string;
  };
  quickReplies?: string[];
}

export interface EventInvitationData {
  title: string;
  description: string;
  imageUrl?: string;
  startTime: string;
  endTime: string;
  location?: {
    latitude: number;
    longitude: number;
    label: string;
  };
}

export interface WeeklyScheduleEvent {
  title: string;
  description: string;
  imageUrl?: string;
  startTime?: string;
  location?: {
    latitude: number;
    longitude: number;
    label: string;
  };
}

export interface RCSSendResult {
  message: string;
  results: {
    total: number;
    rcs: number;
    sms: number;
    mms: number;
    failed: number;
  };
}

// ============================================
// RCS Status & Configuration
// ============================================

/**
 * Get RCS configuration status for the current church
 */
export async function getRCSStatus(): Promise<RCSStatus> {
  const response = await client.get('/messages/rcs/status');
  return response.data.data;
}

/**
 * Register RCS Agent for the church
 */
export async function registerRCSAgent(agentId: string): Promise<{ success: boolean; message: string }> {
  const response = await client.post('/admin/rcs/register', { agentId });
  return response.data;
}

// ============================================
// RCS Rich Messaging
// ============================================

/**
 * Send a rich card announcement to all members
 */
export async function sendRichAnnouncement(data: RichCardData): Promise<RCSSendResult> {
  const response = await client.post('/messages/rcs/announcement', data);
  return response.data.data;
}

/**
 * Send an event invitation to all members
 */
export async function sendEventInvitation(data: EventInvitationData): Promise<RCSSendResult> {
  const response = await client.post('/messages/rcs/event', data);
  return response.data.data;
}

/**
 * Send weekly schedule carousel to all members
 */
export async function sendWeeklySchedule(events: WeeklyScheduleEvent[]): Promise<RCSSendResult> {
  const response = await client.post('/messages/rcs/schedule', { events });
  return response.data.data;
}
