import { useEffect, useRef, useState, useCallback } from 'react';
import useAuthStore from '../stores/authStore';

/**
 * Hook to detect user inactivity and show logout warning
 * If no activity for IDLE_TIME, shows warning with countdown
 * If no activity for IDLE_TIME + WARNING_TIME, logs user out
 */
export function useIdleLogout() {
  const IDLE_TIME = 15 * 60 * 1000; // 15 minutes of inactivity
  const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before logout
  const CHECK_INTERVAL = 1000; // Check every 1 second

  const { isAuthenticated, logout } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsUntilLogout, setSecondsUntilLogout] = useState(0);

  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Reset idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    setShowWarning(false);
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    await logout();
  }, [logout]);

  // Dismiss warning and reset timer
  const dismissWarning = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  // Setup activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, resetIdleTimer);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [isAuthenticated, resetIdleTimer]);

  // Check for inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    // Clear existing interval/timeout
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Check idle status every second
    intervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      const timeUntilWarning = IDLE_TIME - timeSinceLastActivity;
      const timeUntilLogout = IDLE_TIME + WARNING_TIME - timeSinceLastActivity;

      // Show warning when user is about to be logged out
      if (!warningShownRef.current && timeUntilWarning <= 0) {
        warningShownRef.current = true;
        setShowWarning(true);
      }

      // Update countdown
      if (showWarning) {
        const secondsLeft = Math.ceil(timeUntilLogout / 1000);
        setSecondsUntilLogout(Math.max(0, secondsLeft));

        // Auto-logout when time is up
        if (secondsLeft <= 0) {
          handleLogout();
        }
      }
    }, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isAuthenticated, showWarning, IDLE_TIME, WARNING_TIME, handleLogout]);

  return {
    showWarning,
    secondsUntilLogout,
    handleLogout,
    dismissWarning,
  };
}
