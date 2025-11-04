import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { initializePostHog } from './hooks/useAnalytics';
import { useIdleLogout } from './hooks/useIdleLogout';
import ProtectedRoute from './components/ProtectedRoute';
import { IdleLogoutWarning } from './components/IdleLogoutWarning';
import { Spinner } from './components/ui';
import useAuthStore from './stores/authStore';
import useBranchStore from './stores/branchStore';
import { fetchCsrfToken } from './api/client';
import { getBranches } from './api/branches';
import { getMe, refreshToken } from './api/auth';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy load pages for route-based code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BranchesPage = lazy(() => import('./pages/dashboard/BranchesPage'));
const GroupsPage = lazy(() => import('./pages/dashboard/GroupsPage'));
const MembersPage = lazy(() => import('./pages/dashboard/MembersPage'));
const SendMessagePage = lazy(() => import('./pages/dashboard/SendMessagePage'));
const MessageHistoryPage = lazy(() => import('./pages/dashboard/MessageHistoryPage'));
const TemplatesPage = lazy(() => import('./pages/dashboard/TemplatesPage'));
const RecurringMessagesPage = lazy(() => import('./pages/dashboard/RecurringMessagesPage'));
const AnalyticsPage = lazy(() => import('./pages/dashboard/AnalyticsPage'));
const SubscribePage = lazy(() => import('./pages/SubscribePage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950">
    <Spinner size="lg" text="Loading..." />
  </div>
);

function App() {
  const { isAuthenticated, church, setAuth } = useAuthStore();
  const { setBranches } = useBranchStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Idle logout detection
  const { showWarning, secondsUntilLogout, handleLogout, dismissWarning } = useIdleLogout();

  // Debug logging only in development
  if (process.env.NODE_ENV === 'development') {
    console.debug('App initialized, auth state:', { isAuthenticated, churchId: church?.id });
  }

  // Initialize analytics, fetch CSRF token, and restore auth session on app load
  useEffect(() => {
    // Initialize PostHog
    initializePostHog();

    // Fetch CSRF token
    fetchCsrfToken().catch(() => {
      // CSRF token initialization failed - non-critical
      if (process.env.NODE_ENV === 'development') {
        console.debug('CSRF token initialization failed');
      }
    });

    // Restore authentication from session
    // Tokens are in HTTPOnly cookies, frontend just needs to restore user state
    setIsCheckingAuth(true);

    // Try to get current user
    getMe()
      .then((response) => {
        // User has valid session, restore auth state
        if (response.success && response.data) {
          const admin = {
            id: response.data.id,
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            role: response.data.role,
          };
          // Tokens come from HTTPOnly cookies, only pass placeholder tokens for state
          setAuth(admin, response.data.church, 'cookie-based', 'cookie-based');
          setIsCheckingAuth(false);
        }
      })
      .catch(async (error) => {
        // getMe() failed - try refreshing token to extend session
        // This handles case where access token expired but refresh token is valid
        try {
          if (process.env.NODE_ENV === 'development') {
            console.debug('getMe() failed, attempting token refresh...', error.response?.status);
          }

          // Try to refresh the token
          const refreshResponse = await refreshToken();

          if (!refreshResponse.success) {
            throw new Error('Token refresh failed');
          }

          // Refresh succeeded - tokens now updated in cookies + Zustand store (by interceptor)
          // Now retry getMe() with fresh token
          const retryResponse = await getMe();
          if (retryResponse.success && retryResponse.data) {
            const admin = {
              id: retryResponse.data.id,
              email: retryResponse.data.email,
              firstName: retryResponse.data.firstName,
              lastName: retryResponse.data.lastName,
              role: retryResponse.data.role,
            };
            // Use refreshed tokens if available, otherwise use cookies
            const newAccessToken = refreshResponse.data?.accessToken || 'cookie-based';
            const newRefreshToken = refreshResponse.data?.refreshToken || 'cookie-based';
            setAuth(admin, retryResponse.data.church, newAccessToken, newRefreshToken);
          }
        } catch (err) {
          // Both getMe() and refresh failed - user is not authenticated
          if (process.env.NODE_ENV === 'development') {
            console.debug('Session restoration failed, user not authenticated', err);
          }
          // Let auth remain logged out
        }

        setIsCheckingAuth(false);
      });
  }, [setAuth]);

  // Load branches when user is authenticated
  useEffect(() => {
    if (isAuthenticated && church?.id) {
      getBranches(church.id)
        .then((branches) => setBranches(branches))
        .catch(() => {
          // Failed to load branches, non-critical
        });
    }
  }, [isAuthenticated, church?.id, setBranches]);

  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          {/* Idle logout warning modal */}
          <IdleLogoutWarning
            isOpen={showWarning}
            secondsUntilLogout={secondsUntilLogout}
            onDismiss={dismissWarning}
            onLogout={handleLogout}
          />

          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
          />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/careers" element={<CareersPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/branches"
            element={
              <ProtectedRoute>
                <BranchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/branches/:branchId/groups"
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <MembersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/send-message"
            element={
              <ProtectedRoute>
                <SendMessagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-history"
            element={
              <ProtectedRoute>
                <MessageHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <TemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recurring-messages"
            element={
              <ProtectedRoute>
                <RecurringMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscribe"
            element={
              <ProtectedRoute>
                <SubscribePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Suspense>
        <Toaster position="top-right" />
      </Router>
    </ThemeProvider>
  );
}

export default App;
