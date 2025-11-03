import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const PageLoader = () => (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950", children: _jsx(Spinner, { size: "lg", text: "Loading..." }) }));
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
        // Restore authentication from session
        // Tokens are in HTTPOnly cookies, frontend just needs to restore user state
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
                // Tokens come from HTTPOnly cookies, only pass placeholder tokens for state
                setAuth(admin, response.data.church, 'cookie-based', 'cookie-based');
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
                .catch(() => {
                // Failed to load branches, non-critical
            });
        }
    }, [isAuthenticated, church?.id, setBranches]);
    return (_jsx(ThemeProvider, { children: _jsxs(Router, { children: [_jsx(Suspense, { fallback: _jsx(PageLoader, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: isAuthenticated ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: isAuthenticated ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/privacy", element: _jsx(PrivacyPage, {}) }), _jsx(Route, { path: "/terms", element: _jsx(TermsPage, {}) }), _jsx(Route, { path: "/cookie-policy", element: _jsx(CookiePolicyPage, {}) }), _jsx(Route, { path: "/security", element: _jsx(SecurityPage, {}) }), _jsx(Route, { path: "/about", element: _jsx(AboutPage, {}) }), _jsx(Route, { path: "/contact", element: _jsx(ContactPage, {}) }), _jsx(Route, { path: "/blog", element: _jsx(BlogPage, {}) }), _jsx(Route, { path: "/careers", element: _jsx(CareersPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/branches", element: _jsx(ProtectedRoute, { children: _jsx(BranchesPage, {}) }) }), _jsx(Route, { path: "/branches/:branchId/groups", element: _jsx(ProtectedRoute, { children: _jsx(GroupsPage, {}) }) }), _jsx(Route, { path: "/members", element: _jsx(ProtectedRoute, { children: _jsx(MembersPage, {}) }) }), _jsx(Route, { path: "/send-message", element: _jsx(ProtectedRoute, { children: _jsx(SendMessagePage, {}) }) }), _jsx(Route, { path: "/message-history", element: _jsx(ProtectedRoute, { children: _jsx(MessageHistoryPage, {}) }) }), _jsx(Route, { path: "/templates", element: _jsx(ProtectedRoute, { children: _jsx(TemplatesPage, {}) }) }), _jsx(Route, { path: "/recurring-messages", element: _jsx(ProtectedRoute, { children: _jsx(RecurringMessagesPage, {}) }) }), _jsx(Route, { path: "/analytics", element: _jsx(ProtectedRoute, { children: _jsx(AnalyticsPage, {}) }) }), _jsx(Route, { path: "/subscribe", element: _jsx(ProtectedRoute, { children: _jsx(SubscribePage, {}) }) }), _jsx(Route, { path: "/billing", element: _jsx(ProtectedRoute, { children: _jsx(BillingPage, {}) }) }), _jsx(Route, { path: "/checkout", element: _jsx(ProtectedRoute, { children: _jsx(CheckoutPage, {}) }) }), _jsx(Route, { path: "/admin/settings", element: _jsx(ProtectedRoute, { children: _jsx(AdminSettingsPage, {}) }) })] }) }), _jsx(Toaster, { position: "top-right" })] }) }));
}
export default App;
//# sourceMappingURL=App.js.map