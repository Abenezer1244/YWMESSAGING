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
    return (_jsx("nav", { className: "fixed top-0 left-0 right-0 z-sticky bg-background/85 backdrop-blur-md border-b border-primary/30 shadow-lg transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 group rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2", children: [_jsx("img", { src: "/logo.svg", alt: "Koinonia", className: "w-10 h-10 group-hover:opacity-80 transition-opacity duration-normal" }), _jsx("span", { className: "text-lg font-semibold text-foreground hidden sm:block", children: "Koinonia" })] }), _jsx("div", { className: "hidden md:flex items-center gap-8", children: navLinks.map((link) => (_jsx("a", { href: link.href, onClick: (e) => handleNavClick(e, link.href), className: `text-sm font-medium transition-colors duration-normal pb-1 border-b-2 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${activeSection === link.href.substring(1)
                                    ? 'text-primary border-primary'
                                    : 'text-muted-foreground border-transparent hover:text-primary'}`, children: link.label }, link.href))) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(DarkModeToggle, {}), !isAuthenticated && (_jsx("button", { onClick: handleSignIn, className: "hidden sm:block text-foreground hover:text-primary font-medium transition-colors duration-normal text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary", children: "Sign In" })), isAuthenticated && (_jsx(Button, { variant: "primary", size: "sm", onClick: handleStartTrial, className: "hidden sm:block bg-primary hover:bg-primary/90 text-background", children: "Dashboard" })), _jsx("button", { onClick: () => setIsMenuOpen(!isMenuOpen), className: "md:hidden p-2 rounded-md hover:bg-muted transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-primary", "aria-label": "Toggle menu", children: _jsxs("div", { className: "w-6 h-6 flex flex-col justify-between", children: [_jsx("span", { className: `h-0.5 w-full bg-primary transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}` }), _jsx("span", { className: `h-0.5 w-full bg-primary transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}` }), _jsx("span", { className: `h-0.5 w-full bg-primary transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}` })] }) })] })] }), isMenuOpen && (_jsxs("div", { className: "md:hidden border-t border-primary/30 py-4 space-y-2 animate-slide-down bg-muted/50 backdrop-blur-md", children: [navLinks.map((link) => (_jsx("a", { href: link.href, onClick: (e) => handleNavClick(e, link.href), className: "block px-4 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors duration-normal font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset", children: link.label }, link.href))), _jsxs("div", { className: "border-t border-primary pt-3 space-y-2", children: [!isAuthenticated && (_jsx("button", { onClick: handleSignIn, className: "w-full px-4 py-2 text-foreground hover:text-primary font-medium transition-colors duration-normal text-left text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset", children: "Sign In" })), _jsx(Button, { variant: "primary", size: "md", onClick: handleStartTrial, fullWidth: true, children: isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial' })] })] }))] }) }));
}
//# sourceMappingURL=Navigation.js.map