import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import posthog from 'posthog-js';
import { useAuthStore } from '../stores/authStore';

// Initialize PostHog only once
let posthogInitialized = false;

export function initializePostHog() {
  if (posthogInitialized) return;

  const apiKey = import.meta.env.VITE_POSTHOG_KEY;

  if (apiKey) {
    posthog.init(apiKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.posthog.com',
      loaded: (ph) => {
        console.log('✅ PostHog initialized');
      },
      autocapture: true,
      capture_pageview: false, // We'll handle this manually
    });
    posthogInitialized = true;
  } else {
    console.log('⚠️  PostHog API key not configured');
  }
}

/**
 * Hook for tracking analytics events
 * Usage: const { track } = useAnalytics()
 */
export function useAnalytics() {
  const { user } = useAuthStore();
  const location = useLocation();

  // Identify user when authenticated
  useEffect(() => {
    if (user?.id && posthogInitialized) {
      posthog.identify(user.id, {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    }
  }, [user?.id]);

  // Track page views
  useEffect(() => {
    if (posthogInitialized) {
      // Use full pathname as page name
      posthog.capture('$pageview', {
        path: location.pathname,
        pathname: location.pathname,
      });
    }
  }, [location.pathname]);

  // Track custom event
  const track = (eventName: string, properties?: Record<string, any>) => {
    if (posthogInitialized) {
      posthog.capture(eventName, properties || {});
      console.log(`[Analytics] Event tracked: ${eventName}`, properties);
    }
  };

  return { track, posthog };
}

export default useAnalytics;
