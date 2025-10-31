import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import Button from '../ui/Button';

export default function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleStartTrial = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-warm-walnut-brown to-warm-outer-space overflow-hidden">
      {/* Minimal background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-warm-copper opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-left animate-fadeIn">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1 bg-warm-raw-umber border border-warm-coffee rounded-lg text-sm font-medium text-warm-50 mb-8">
              <span className="w-2 h-2 bg-warm-copper rounded-full mr-2"></span>
              Trusted by churches nationwide
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl sm:text-7xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Connect Your{' '}
              <span className="text-warm-copper">
                Church Community
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-warm-100 mb-8 leading-relaxed max-w-xl font-light">
              Enterprise SMS communication platform designed for churches. Keep your congregation connected, informed, and engaged with ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartTrial}
                className="font-semibold"
              >
                Start 14-Day Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLearnMore}
                className="font-semibold"
              >
                Learn More
              </Button>
            </div>

            {/* Trust indicators - Horizontal */}
            <div className="flex flex-wrap items-center gap-8 text-sm text-warm-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Setup in minutes
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-success-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Right Column - Modern Dashboard Preview */}
          <div className="relative hidden lg:block animate-slideUp">
            <div className="relative bg-gradient-to-br from-warm-raw-umber to-warm-coyote rounded-2xl shadow-dual-lg p-8 border border-warm-coffee overflow-hidden">
              {/* Accent bar at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warm-copper to-warm-brown-sugar"></div>

              {/* Mock dashboard content - modern layout */}
              <div className="space-y-6">
                {/* Header section */}
                <div>
                  <div className="h-2 w-20 bg-warm-coffee rounded mb-3"></div>
                  <div className="h-6 w-32 bg-warm-brown-sugar rounded"></div>
                </div>

                {/* Stats section */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-warm-coffee rounded-lg p-4">
                    <div className="h-2 w-12 bg-warm-coyote rounded mb-2"></div>
                    <div className="h-5 w-16 bg-warm-copper rounded"></div>
                  </div>
                  <div className="bg-warm-coffee rounded-lg p-4">
                    <div className="h-2 w-12 bg-warm-coyote rounded mb-2"></div>
                    <div className="h-5 w-16 bg-success-500 rounded"></div>
                  </div>
                </div>

                {/* Main content area */}
                <div className="bg-warm-coffee rounded-lg p-4 space-y-3">
                  <div className="h-3 w-24 bg-warm-coyote rounded"></div>
                  <div className="space-y-2">
                    <div className="h-2 bg-warm-walnut-brown rounded w-full"></div>
                    <div className="h-2 bg-warm-walnut-brown rounded w-4/5"></div>
                    <div className="h-2 bg-warm-walnut-brown rounded w-3/4"></div>
                  </div>
                </div>

                {/* Action buttons area */}
                <div className="flex gap-2">
                  <div className="h-8 flex-1 bg-warm-copper rounded-lg"></div>
                  <div className="h-8 w-8 bg-warm-coyote rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Subtle floating accent */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-warm-copper opacity-15 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

