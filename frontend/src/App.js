import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BranchesPage from './pages/dashboard/BranchesPage';
import GroupsPage from './pages/dashboard/GroupsPage';
import MembersPage from './pages/dashboard/MembersPage';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './stores/authStore';
import useBranchStore from './stores/branchStore';
import { fetchCsrfToken } from './api/client';
import { getBranches } from './api/branches';
function App() {
    const { isAuthenticated, church } = useAuthStore();
    const { setBranches } = useBranchStore();
    // Fetch CSRF token and branches on app load
    useEffect(() => {
        fetchCsrfToken().catch((error) => {
            console.error('Failed to initialize CSRF token:', error);
        });
    }, []);
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
    return (_jsxs(Router, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: isAuthenticated ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: isAuthenticated ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/branches", element: _jsx(ProtectedRoute, { children: _jsx(BranchesPage, {}) }) }), _jsx(Route, { path: "/branches/:branchId/groups", element: _jsx(ProtectedRoute, { children: _jsx(GroupsPage, {}) }) }), _jsx(Route, { path: "/members", element: _jsx(ProtectedRoute, { children: _jsx(MembersPage, {}) }) }), _jsx(Route, { path: "/", element: isAuthenticated ? (_jsx(Navigate, { to: "/dashboard", replace: true })) : (_jsx(Navigate, { to: "/login", replace: true })) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }), _jsx(Toaster, { position: "top-right" })] }));
}
export default App;
//# sourceMappingURL=App.js.map