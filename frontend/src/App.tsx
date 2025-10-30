import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { initializePostHog } from './hooks/useAnalytics';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BranchesPage from './pages/dashboard/BranchesPage';
import GroupsPage from './pages/dashboard/GroupsPage';
import MembersPage from './pages/dashboard/MembersPage';
import SendMessagePage from './pages/dashboard/SendMessagePage';
import MessageHistoryPage from './pages/dashboard/MessageHistoryPage';
import TemplatesPage from './pages/dashboard/TemplatesPage';
import RecurringMessagesPage from './pages/dashboard/RecurringMessagesPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import SubscribePage from './pages/SubscribePage';
import BillingPage from './pages/BillingPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './stores/authStore';
import useBranchStore from './stores/branchStore';
import { fetchCsrfToken } from './api/client';
import { getBranches } from './api/branches';
import { getMe } from './api/auth';

function App() {
  const { isAuthenticated, church, setAuth } = useAuthStore();
  const { setBranches } = useBranchStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  console.log('App rendering, isAuthenticated:', isAuthenticated, 'church:', church?.id);

  // Initialize analytics, fetch CSRF token, and restore auth session on app load
  useEffect(() => {
    // Initialize PostHog
    initializePostHog();

    // Fetch CSRF token
    fetchCsrfToken().catch((error) => {
      console.error('Failed to initialize CSRF token:', error);
    });

    // Restore tokens from localStorage if they exist
    const savedAccessToken = localStorage.getItem('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    if (savedAccessToken && savedRefreshToken) {
      console.log('Found saved tokens in localStorage, restoring auth state');
      // Note: We'll validate these tokens with getMe()
    }

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
      .catch((error) => {
        // User doesn't have valid session, auth will remain cleared
        console.debug('No active session:', error?.message);
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
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
