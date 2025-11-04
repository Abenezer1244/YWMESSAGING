import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import Navigation from '../components/landing/Navigation';
import Hero from '../components/landing/Hero';
import DashboardPreview from '../components/landing/DashboardPreview';
import Features from '../components/landing/Features';
import Comparison from '../components/landing/Comparison';
import Pricing from '../components/landing/Pricing';
import Testimonials from '../components/landing/Testimonials';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';
export default function LandingPage() {
    // Smooth scroll behavior for anchor links
    useEffect(() => {
        const handleAnchorClick = (e) => {
            const target = e.target;
            const link = target.closest('a[href^="#"]');
            if (link) {
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        const navHeight = 64; // Navigation height
                        const targetPosition = targetElement.offsetTop - navHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth',
                        });
                    }
                }
            }
        };
        document.addEventListener('click', handleAnchorClick);
        return () => document.removeEventListener('click', handleAnchorClick);
    }, []);
    // Intersection Observer for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);
        // Observe all sections
        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section) => observer.observe(section));
        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx(Navigation, {}), _jsxs("main", { children: [_jsx(Hero, {}), _jsx(DashboardPreview, {}), _jsx(Features, {}), _jsx(Comparison, {}), _jsx(Pricing, {}), _jsx(Testimonials, {}), _jsx(FinalCTA, {})] }), _jsx(Footer, {})] }));
}
//# sourceMappingURL=LandingPage.js.map