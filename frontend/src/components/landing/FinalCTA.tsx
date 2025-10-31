import { useNavigate } from 'react-router-dom';
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900 dark:bg-neutral-900 relative overflow-hidden transition-colors duration-normal">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fadeIn leading-tight tracking-tight">
          Ready to Connect Your Church?
        </h2>
        <p className="text-lg sm:text-xl text-neutral-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
          Join hundreds of churches using Connect YW to strengthen their community communication.
          Start your 14-day free trial today—no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartTrial}
            className="bg-white text-neutral-900 hover:bg-neutral-50 font-semibold"
          >
            Start Free Trial
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-neutral-700 text-white hover:bg-neutral-800"
          >
            View Pricing
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 justify-center text-neutral-400 text-sm">
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
            Setup in 5 minutes
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Cancel anytime
          </div>
        </div>
      </div>
    </section>
  );
}

