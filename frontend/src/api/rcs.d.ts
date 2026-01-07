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
/**
 * Get RCS configuration status for the current church
 */
export declare function getRCSStatus(): Promise<RCSStatus>;
/**
 * Register RCS Agent for the church
 */
export declare function registerRCSAgent(agentId: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Send a rich card announcement to all members
 */
export declare function sendRichAnnouncement(data: RichCardData): Promise<RCSSendResult>;
/**
 * Send an event invitation to all members
 */
export declare function sendEventInvitation(data: EventInvitationData): Promise<RCSSendResult>;
/**
 * Send weekly schedule carousel to all members
 */
export declare function sendWeeklySchedule(events: WeeklyScheduleEvent[]): Promise<RCSSendResult>;
//# sourceMappingURL=rcs.d.ts.map