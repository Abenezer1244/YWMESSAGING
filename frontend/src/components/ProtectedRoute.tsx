import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  console.log('ProtectedRoute rendering, isAuthenticated:', isAuthenticated, 'user:', user);

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, rendering protected content');
  return <>{children}</>;
}

export default ProtectedRoute;
