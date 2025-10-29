import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BranchesPage from './pages/dashboard/BranchesPage';
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

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
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

        {/* Home / Redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
