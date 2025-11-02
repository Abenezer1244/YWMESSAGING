import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Zap, Smartphone, ArrowRight } from 'lucide-react';
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
    <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-800 via-primary-900 to-primary-950 overflow-hidden pt-24">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent-500 opacity-15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary-700 opacity-10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <div className="text-left space-y-8 animate-fadeIn">
            {/* Modern Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/15 border border-accent-400/50 rounded-full text-sm font-medium text-accent-100 backdrop-blur-sm hover:bg-accent-500/25 transition-colors duration-300">
              <div className="w-2 h-2 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full animate-pulse"></div>
              <span>Trusted by 100+ churches nationwide</span>
            </div>

            {/* Main Headline - Gradient Text Effect */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="text-white">Connect Your</span>
                <br />
                <span className="bg-gradient-to-r from-accent-300 via-accent-500 to-primary-400 bg-clip-text text-transparent">
                  Church Community
                </span>
              </h1>
            </div>

            {/* Subheading - Modern typography */}
            <p className="text-xl sm:text-2xl text-primary-100/90 max-w-lg leading-relaxed font-light">
              Enterprise SMS communication platform built for churches. Strengthen community engagement, manage multiple locations, and communicate with confidence.
            </p>

            {/* Modern CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-300 hover:to-accent-400 text-primary-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLearnMore}
                className="border-2 border-accent-400/50 text-primary-100 hover:bg-primary-700/30 hover:border-accent-400 font-semibold rounded-lg backdrop-blur-sm transition-all duration-300"
              >
                Learn More
              </Button>
            </div>

            {/* Trust Indicators - Modern Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              {[
                { icon: CheckCircle2, text: 'No credit card needed' },
                { icon: Zap, text: 'Setup in 5 minutes' },
                { icon: Smartphone, text: 'Mobile access included' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-primary-700/20 rounded-lg border border-accent-400/30 backdrop-blur-sm hover:bg-primary-700/40 transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-accent-400 flex-shrink-0" />
                  <span className="text-sm text-primary-100">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Modern Dashboard Preview Card */}
          <div className="relative hidden lg:block">
            <div className="relative group">
              {/* Glow effect behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-pacific via-blue-sky-blue to-blue-honolulu rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-500 animate-pulse"></div>

              {/* Modern Card */}
              <div className="relative bg-gradient-to-br from-blue-700/40 to-blue-marian/40 rounded-2xl p-8 border border-blue-600/40 backdrop-blur-xl shadow-2xl overflow-hidden animate-slideUp group-hover:shadow-blue-900/50 transition-shadow duration-500">
                {/* Accent gradient top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-pacific to-transparent"></div>

                {/* Card Header */}
                <div className="mb-8 pb-6 border-b border-blue-600/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-blue-pacific"></div>
                    <div className="text-sm font-semibold text-blue-100">Dashboard Preview</div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Analytics</h3>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-blue-600/30 rounded-lg border border-blue-500/20">
                    <div className="text-xs text-blue-300 mb-2">DELIVERED</div>
                    <div className="text-3xl font-bold text-blue-pacific">2,847</div>
                  </div>
                  <div className="p-4 bg-blue-600/30 rounded-lg border border-blue-500/20">
                    <div className="text-xs text-blue-300 mb-2">ENGAGED</div>
                    <div className="text-3xl font-bold text-success-500">89%</div>
                  </div>
                </div>

                {/* Activity Chart Mockup */}
                <div className="space-y-3 mb-8">
                  <div className="text-sm font-semibold text-blue-100">Recent Activity</div>
                  {[80, 65, 90, 45, 75].map((height, i) => (
                    <div key={i} className="flex items-end gap-2 h-8">
                      <div className="flex-1 bg-gradient-to-t from-blue-pacific to-blue-sky-blue rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${height}%` }}></div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-4 bg-blue-pacific hover:bg-blue-sky-blue text-blue-900 font-semibold rounded-lg transition-colors duration-300">
                    Export
                  </button>
                  <button className="px-4 py-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-100 rounded-lg transition-colors duration-300">
                    ⋯
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scrolling Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="flex flex-col items-center gap-2 text-blue-300">
            <span className="text-sm font-medium">Scroll to explore</span>
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

