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
    <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden pt-24">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent-500 opacity-15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary-700 opacity-10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-4xl mx-auto w-full">
        <div className="w-full">
          {/* Content */}
          <div className="text-center space-y-8 animate-fadeIn">
            {/* Modern Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/15 border border-accent-400/50 rounded-full text-sm font-medium text-accent-100 backdrop-blur-sm hover:bg-accent-500/25 transition-colors duration-300">
                <div className="w-2 h-2 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full animate-pulse"></div>
                <span>Trusted by 100+ churches nationwide</span>
              </div>
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
            <p className="text-xl sm:text-2xl text-primary-100/90 max-w-sm leading-relaxed font-light mx-auto">
              Enterprise SMS communication platform built for churches. Strengthen community engagement, manage multiple locations, and communicate with confidence.
            </p>

            {/* Modern CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <Button
                size="md"
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-300 hover:to-accent-400 text-primary-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="md"
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

