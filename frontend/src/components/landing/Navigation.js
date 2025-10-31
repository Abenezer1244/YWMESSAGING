import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const handleNavClick = (e, href) => {
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
        }
        else {
            navigate('/register');
        }
    };
    const navLinks = [
        { href: '#features', label: 'Features' },
        { href: '#pricing', label: 'Pricing' },
        { href: '#testimonials', label: 'Testimonials' },
    ];
    return (_jsx("nav", { className: "fixed top-0 left-0 right-0 z-sticky bg-white/95 dark:bg-secondary-900/95 backdrop-blur-sm border-b border-secondary-200 dark:border-secondary-700 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 group", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-md flex items-center justify-center shadow-subtle group-hover:shadow-md transition-shadow duration-normal", children: _jsx("span", { className: "text-white font-bold text-lg", children: "YW" }) }), _jsx("span", { className: "text-lg font-bold text-secondary-900 dark:text-secondary-50 hidden sm:block", children: "Connect YW" })] }), _jsx("div", { className: "hidden md:flex items-center gap-8", children: navLinks.map((link) => (_jsx("a", { href: link.href, onClick: (e) => handleNavClick(e, link.href), className: `font-medium transition-colors duration-normal pb-1 border-b-2 ${activeSection === link.href.substring(1)
                                    ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                                    : 'text-secondary-700 dark:text-secondary-300 border-transparent hover:text-primary-600 dark:hover:text-primary-400'}`, children: link.label }, link.href))) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(DarkModeToggle, {}), !isAuthenticated && (_jsx("button", { onClick: handleSignIn, className: "hidden sm:block text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-normal", children: "Sign In" })), _jsx(Button, { variant: "primary", size: "sm", onClick: handleStartTrial, className: "hidden xs:block", children: isAuthenticated ? 'Dashboard' : 'Start Free' }), _jsx("button", { onClick: () => setIsMenuOpen(!isMenuOpen), className: "md:hidden p-2 rounded-sm hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-normal", "aria-label": "Toggle menu", children: _jsxs("div", { className: "w-6 h-6 flex flex-col justify-between", children: [_jsx("span", { className: `h-0.5 w-full bg-secondary-900 dark:bg-secondary-50 transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}` }), _jsx("span", { className: `h-0.5 w-full bg-secondary-900 dark:bg-secondary-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}` }), _jsx("span", { className: `h-0.5 w-full bg-secondary-900 dark:bg-secondary-50 transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}` })] }) })] })] }), isMenuOpen && (_jsxs("div", { className: "md:hidden border-t border-secondary-200 dark:border-secondary-700 py-4 space-y-3 animate-slide-down", children: [navLinks.map((link) => (_jsx("a", { href: link.href, onClick: (e) => handleNavClick(e, link.href), className: "block px-4 py-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-800 rounded-md transition-colors duration-normal font-medium", children: link.label }, link.href))), _jsxs("div", { className: "border-t border-secondary-200 dark:border-secondary-700 pt-3 space-y-2", children: [!isAuthenticated && (_jsx("button", { onClick: handleSignIn, className: "w-full px-4 py-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-normal text-left", children: "Sign In" })), _jsx(Button, { variant: "primary", size: "md", onClick: handleStartTrial, fullWidth: true, children: isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial' })] })] }))] }) }));
}
//# sourceMappingURL=Navigation.js.map