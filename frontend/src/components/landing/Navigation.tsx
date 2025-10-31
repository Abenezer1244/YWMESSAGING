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
    <nav className="fixed top-0 left-0 right-0 z-sticky bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors duration-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-normal">
              <span className="text-white font-bold text-base">YW</span>
            </div>
            <span className="text-lg font-semibold text-neutral-900 dark:text-white hidden sm:block">Connect YW</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium transition-colors duration-normal pb-1 border-b-2 ${
                  activeSection === link.href.substring(1)
                    ? 'text-primary-500 dark:text-primary-400 border-primary-500 dark:border-primary-400'
                    : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-primary-500 dark:hover:text-primary-400'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Sign In Button */}
            {!isAuthenticated && (
              <button
                onClick={handleSignIn}
                className="hidden sm:block text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors duration-normal text-sm"
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
              className="md:hidden p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors duration-normal"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-between">
                <span
                  className={`h-0.5 w-full bg-neutral-900 dark:bg-white transition-transform duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-2.5' : ''
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-neutral-900 dark:bg-white transition-opacity duration-300 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-neutral-900 dark:bg-white transition-transform duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-4 space-y-2 animate-slide-down">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors duration-normal font-medium text-sm"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-2">
              {!isAuthenticated && (
                <button
                  onClick={handleSignIn}
                  className="w-full px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors duration-normal text-left text-sm"
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

