import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
export default function AboutPage() {
    const values = [
        {
            icon: '🎯',
            title: 'Mission-Driven',
            description: 'We empower churches to communicate effectively with their communities through modern, reliable SMS technology.',
        },
        {
            icon: '🔐',
            title: 'Security First',
            description: 'Your data is sacred. We implement enterprise-grade security to protect sensitive church information.',
        },
        {
            icon: '♥️',
            title: 'Community Focused',
            description: 'We understand the unique needs of faith communities and build solutions tailored for churches.',
        },
        {
            icon: '📈',
            title: 'Scalable',
            description: 'From small parishes to large dioceses, our platform grows with your organization.',
        },
        {
            icon: '🚀',
            title: 'Innovation',
            description: 'We continuously improve and add features based on feedback from our community.',
        },
        {
            icon: '🤝',
            title: 'Support',
            description: 'Our dedicated support team is here to help you succeed.',
        },
    ];
    const team = [
        {
            name: 'Leadership Team',
            description: 'Experienced professionals dedicated to serving churches with the best communication platform available.',
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-white dark:bg-slate-950 transition-colors duration-normal", children: [_jsx("div", { className: "p-6", children: _jsx(BackButton, { variant: "ghost" }) }), _jsx("div", { className: "px-6 py-12 bg-gradient-to-b from-slate-900 to-slate-950", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsx("h1", { className: "text-5xl font-bold text-slate-900 dark:text-white mb-4", children: "About Connect" }), _jsx("p", { className: "text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto", children: "Empowering faith communities with modern communication technology" })] }) }), _jsxs("div", { className: "max-w-4xl mx-auto px-6 py-12", children: [_jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white mb-6", children: "Our Story" }), _jsxs("div", { className: "space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed", children: [_jsx("p", { children: "Connect was founded with a simple belief: churches need better tools to communicate with their congregations. Whether it's important announcements, event reminders, or emergency notifications, reliable communication is essential for modern faith communities." }), _jsx("p", { children: "We recognized that churches were struggling with outdated communication methods and fragmented systems. Our mission became clear: build a dedicated SMS platform designed specifically for churches, with their unique needs in mind." }), _jsx("p", { children: "Today, Connect serves hundreds of churches of all sizes, from small parishes to large dioceses, helping them communicate more effectively with their members and strengthen their communities." })] })] }), _jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white mb-12", children: "Our Values" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: values.map((value, idx) => (_jsxs("div", { className: "bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-6 hover:border-accent-500/50 transition-colors", children: [_jsx("div", { className: "text-4xl mb-4", children: value.icon }), _jsx("h3", { className: "text-xl font-semibold text-slate-900 dark:text-white mb-3", children: value.title }), _jsx("p", { className: "text-slate-600 dark:text-slate-400 text-sm", children: value.description })] }, idx))) })] }), _jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white mb-6", children: "Our Team" }), _jsxs("div", { className: "bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-8", children: [_jsx("p", { className: "text-slate-700 dark:text-slate-300 mb-4", children: "We are a dedicated team of developers, designers, and church ministry professionals committed to making a difference in how faith communities communicate." }), _jsx("p", { className: "text-slate-700 dark:text-slate-300 mb-4", children: "Our diverse backgrounds\u2014from software engineering to pastoral ministry\u2014enable us to build solutions that truly understand the needs of churches." }), _jsx("p", { className: "text-slate-600 dark:text-slate-400 text-sm", children: "We're growing! If you're passionate about technology and faith communities, we'd love to hear from you. Visit our Careers page to learn about open positions." })] })] }), _jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white mb-6", children: "Why Choose Connect?" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-accent-500/10 border border-accent-500/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-3", children: "Built for Churches" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300 text-sm", children: "We understand the unique communication needs of faith communities and have built features specifically for churches." })] }), _jsxs("div", { className: "bg-accent-500/10 border border-accent-500/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-3", children: "Reliable & Secure" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300 text-sm", children: "Enterprise-grade security and 99.9% uptime ensures your communications reach your congregation every time." })] }), _jsxs("div", { className: "bg-accent-500/10 border border-accent-500/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-3", children: "Affordable Plans" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300 text-sm", children: "Starting at just $49/month, our plans are designed to fit organizations of any size and budget." })] }), _jsxs("div", { className: "bg-accent-500/10 border border-accent-500/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-3", children: "World-Class Support" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300 text-sm", children: "Our support team is dedicated to helping you succeed with personalized assistance and training." })] })] })] }), _jsxs("section", { className: "bg-gradient-to-r from-accent-500/10 to-blue-500/10 border border-accent-500/30 rounded-lg p-8 text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-4", children: "Ready to Transform Your Communication?" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300 mb-6 max-w-2xl mx-auto", children: "Join hundreds of churches already using Connect to strengthen their communities." }), _jsx(Link, { to: "/register", className: "inline-block bg-accent-500 hover:bg-accent-600 text-slate-900 dark:text-white font-semibold py-3 px-8 rounded-lg transition-colors", children: "Start Your Free Trial" })] })] }), _jsx("div", { className: "max-w-4xl mx-auto px-6 py-8 border-t border-slate-300 dark:border-slate-700 mt-12", children: _jsxs("div", { className: "flex gap-8", children: [_jsx(Link, { to: "/", className: "text-accent-400 hover:text-accent-300 font-medium", children: "\u2190 Back to Home" }), _jsx(Link, { to: "/contact", className: "text-accent-400 hover:text-accent-300 font-medium", children: "Contact Us \u2192" })] }) })] }));
}
//# sourceMappingURL=AboutPage.js.map