import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function Navigation() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleStartTrial = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center shadow-medium group-hover:shadow-large transition-shadow">
              <span className="text-white font-bold text-xl">YW</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Connect YW</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Testimonials
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <button
                onClick={handleSignIn}
                className="hidden sm:block text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Sign In
              </button>
            )}
            <button
              onClick={handleStartTrial}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all shadow-soft hover:shadow-medium hover:scale-105 active:scale-95"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

