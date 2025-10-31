import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { initializePostHog } from './hooks/useAnalytics';
import ProtectedRoute from './components/ProtectedRoute';
import { Spinner } from './components/ui';
import useAuthStore from './stores/authStore';
import useBranchStore from './stores/branchStore';
import { fetchCsrfToken } from './api/client';
import { getBranches } from './api/branches';
import { getMe } from './api/auth';

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

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950">
    <Spinner size="lg" text="Loading..." />
  </div>
);

function App() {
  const { isAuthenticated, church, setAuth } = useAuthStore();
  const { setBranches } = useBranchStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

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

    // Restore tokens from localStorage if they exist
    const savedAccessToken = localStorage.getItem('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    // Tokens will be validated with getMe() call below

    // Restore authentication from session
    setIsCheckingAuth(true);
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
          // Get saved tokens from localStorage
          const savedAccessToken = localStorage.getItem('accessToken');
          const savedRefreshToken = localStorage.getItem('refreshToken');

          // If we have tokens, use them; otherwise use empty strings (shouldn't happen)
          setAuth(admin, response.data.church, savedAccessToken || '', savedRefreshToken || '');
        }
      })
      .catch(() => {
        // User doesn't have valid session, auth will remain cleared
        // Log error details only in development
        if (process.env.NODE_ENV === 'development') {
          console.debug('No active session found');
        }
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, [setAuth]);

  // Load branches when user is authenticated
  useEffect(() => {
    if (isAuthenticated && church?.id) {
      getBranches(church.id)
        .then((branches) => setBranches(branches))
        .catch((error) => {
          console.error('Failed to load branches:', error);
        });
    }
  }, [isAuthenticated, church?.id, setBranches]);

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
  );
}

export default App;
