import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import Button from '../ui/Button';

export default function FinalCTA() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleStartTrial = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-federal via-blue-marian to-blue-honolulu overflow-hidden transition-colors duration-normal">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-pacific opacity-15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-sky-blue opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-honolulu opacity-10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="mb-8 animate-fadeIn">
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Ready to{' '}
            <span className="bg-gradient-to-r from-blue-pacific via-blue-sky-blue to-blue-honolulu bg-clip-text text-transparent">Connect Your Church?</span>
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Join hundreds of churches using Connect to strengthen their community communication.
            Start your 14-day free trial today—no credit card required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartTrial}
            className="bg-gradient-to-r from-blue-pacific to-blue-sky-blue hover:from-blue-400 hover:to-blue-300 text-blue-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Free Trial
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-2 border-blue-300/50 text-blue-100 hover:bg-blue-700/40 hover:border-blue-300 font-semibold backdrop-blur-sm transition-all duration-300"
          >
            View Pricing
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center text-blue-100 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-pacific flex-shrink-0" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-pacific flex-shrink-0" />
            <span>Setup in 5 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-pacific flex-shrink-0" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}

