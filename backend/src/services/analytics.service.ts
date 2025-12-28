/**
 * Analytics Service
 * Integrates with PostHog for event tracking
 *
 * In production, this would use: npm install posthog
 * For now, we'll mock the implementation
 */

interface TrackEvent {
  event: string;
  properties?: Record<string, any>;
}

class AnalyticsService {
  private apiKey: string;
  private isEnabled: boolean;

  constructor() {
    this.apiKey = process.env.POSTHOG_API_KEY || '';
    this.isEnabled = !!this.apiKey;

    if (this.isEnabled) {
      console.log('✅ PostHog analytics service initialized');
    } else {
      console.log('⚠️  PostHog API key not configured - analytics disabled');
    }
  }

  /**
   * Track a user event
   */
  async track(
    userId: string,
    eventName: string,
    properties?: Record<string, any>
  ) {
    if (!this.isEnabled) {
      return;
    }

    try {
      const payload: TrackEvent = {
        event: eventName,
        properties: {
          ...properties,
          userId,
          timestamp: new Date().toISOString(),
        },
      };

      // In production with real PostHog package:
      // await posthog.capture({
      //   distinctId: userId,
      //   event: eventName,
      //   properties: payload.properties,
      // });

      console.log(
        `[Analytics] Event tracked: ${eventName}`,
        payload.properties
      );
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Track authentication events
   */
  async trackAuthEvent(
    userId: string,
    eventType: 'signup' | 'login' | 'logout',
    churchId?: string,
    email?: string
  ) {
    const eventMap = {
      signup: 'user_signed_up',
      login: 'user_logged_in',
      logout: 'user_logged_out',
    };

    await this.track(userId, eventMap[eventType], {
      churchId,
      email,
      eventType,
    });
  }

  /**
   * Track message events
   */
  async trackMessageEvent(
    userId: string,
    eventType: 'sent' | 'delivered' | 'failed',
    churchId: string,
    properties?: Record<string, any>
  ) {
    const eventMap = {
      sent: 'message_sent',
      delivered: 'message_delivered',
      failed: 'message_delivery_failed',
    };

    await this.track(userId, eventMap[eventType], {
      churchId,
      ...properties,
    });
  }

  /**
   * Track member events
   */
  async trackMemberEvent(
    userId: string,
    eventType: 'added' | 'imported' | 'updated' | 'removed',
    churchId: string,
    count?: number
  ) {
    const eventMap = {
      added: 'member_added',
      imported: 'member_bulk_imported',
      updated: 'member_updated',
      removed: 'member_removed',
    };

    await this.track(userId, eventMap[eventType], {
      churchId,
      count,
    });
  }

  /**
   * Track branch events
   */
  async trackBranchEvent(
    userId: string,
    eventType: 'created' | 'updated' | 'deleted',
    churchId: string,
    properties?: Record<string, any>
  ) {
    const eventMap = {
      created: 'branch_created',
      updated: 'branch_updated',
      deleted: 'branch_deleted',
    };

    await this.track(userId, eventMap[eventType], {
      churchId,
      ...properties,
    });
  }

  /**
   * Track template events
   */
  async trackTemplateEvent(
    userId: string,
    eventType: 'created' | 'used' | 'deleted',
    churchId: string,
    properties?: Record<string, any>
  ) {
    const eventMap = {
      created: 'template_created',
      used: 'template_used',
      deleted: 'template_deleted',
    };

    await this.track(userId, eventMap[eventType], {
      churchId,
      ...properties,
    });
  }

  /**
   * Track recurring message events
   */
  async trackRecurringEvent(
    userId: string,
    eventType: 'created' | 'executed' | 'paused' | 'resumed',
    churchId: string,
    frequency?: string
  ) {
    const eventMap = {
      created: 'recurring_message_created',
      executed: 'recurring_message_executed',
      paused: 'recurring_message_paused',
      resumed: 'recurring_message_resumed',
    };

    await this.track(userId, eventMap[eventType], {
      churchId,
      frequency,
    });
  }
}

export default new AnalyticsService();
