import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
export function ProtectedRoute({ children }) {
    const { isAuthenticated, user } = useAuthStore();
    console.log('ProtectedRoute rendering, isAuthenticated:', isAuthenticated, 'user:', user);
    if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to /login');
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    console.log('User authenticated, rendering protected content');
    return _jsx(_Fragment, { children: children });
}
export default ProtectedRoute;
//# sourceMappingURL=ProtectedRoute.js.map