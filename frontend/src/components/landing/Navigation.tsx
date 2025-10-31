import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import DarkModeToggle from '../ui/DarkModeToggle';
import Button from '../ui/Button';

export default function Navigation() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Handle smooth scrolling and active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'pricing', 'testimonials'];
      let current = '';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= window.scrollY + 100) {
          current = section;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const target = document.getElementById(href.substring(1));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#testimonials', label: 'Testimonials' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-sticky bg-white/95 dark:bg-secondary-900/95 backdrop-blur-sm border-b border-secondary-200 dark:border-secondary-700 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-md flex items-center justify-center shadow-subtle group-hover:shadow-md transition-shadow duration-normal">
              <span className="text-white font-bold text-lg">YW</span>
            </div>
            <span className="text-lg font-bold text-secondary-900 dark:text-secondary-50 hidden sm:block">Connect YW</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`font-medium transition-colors duration-normal pb-1 border-b-2 ${
                  activeSection === link.href.substring(1)
                    ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                    : 'text-secondary-700 dark:text-secondary-300 border-transparent hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Sign In Button */}
            {!isAuthenticated && (
              <button
                onClick={handleSignIn}
                className="hidden sm:block text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-normal"
              >
                Sign In
              </button>
            )}

            {/* CTA Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartTrial}
              className="hidden xs:block"
            >
              {isAuthenticated ? 'Dashboard' : 'Start Free'}
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-sm hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-normal"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-between">
                <span
                  className={`h-0.5 w-full bg-secondary-900 dark:bg-secondary-50 transition-transform duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-2.5' : ''
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-secondary-900 dark:bg-secondary-50 transition-opacity duration-300 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-secondary-900 dark:bg-secondary-50 transition-transform duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 dark:border-secondary-700 py-4 space-y-3 animate-slide-down">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block px-4 py-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-800 rounded-md transition-colors duration-normal font-medium"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-secondary-200 dark:border-secondary-700 pt-3 space-y-2">
              {!isAuthenticated && (
                <button
                  onClick={handleSignIn}
                  className="w-full px-4 py-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-normal text-left"
                >
                  Sign In
                </button>
              )}
              <Button
                variant="primary"
                size="md"
                onClick={handleStartTrial}
                fullWidth
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

