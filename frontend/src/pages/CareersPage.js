import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
export default function CareersPage() {
    const jobOpenings = [
        {
            id: 1,
            title: 'Senior Full-Stack Developer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            experience: '5+ years',
            description: 'Build and maintain our core platform serving hundreds of churches.',
        },
        {
            id: 2,
            title: 'Product Manager',
            department: 'Product',
            location: 'Remote',
            type: 'Full-time',
            experience: '3+ years',
            description: 'Shape the future of church communication technology.',
        },
        {
            id: 3,
            title: 'Customer Success Manager',
            department: 'Customer Success',
            location: 'Remote',
            type: 'Full-time',
            experience: '2+ years',
            description: 'Help our church customers succeed with Connect.',
        },
        {
            id: 4,
            title: 'Solutions Architect',
            department: 'Professional Services',
            location: 'Remote',
            type: 'Full-time',
            experience: '4+ years',
            description: 'Design custom solutions for enterprise church customers.',
        },
        {
            id: 5,
            title: 'Marketing Manager',
            department: 'Marketing',
            location: 'Remote',
            type: 'Full-time',
            experience: '3+ years',
            description: 'Drive growth and awareness of Connect in the faith community.',
        },
        {
            id: 6,
            title: 'Support Specialist',
            department: 'Support',
            location: 'Remote',
            type: 'Full-time',
            experience: '1+ years',
            description: 'Provide excellent support to our growing customer base.',
        },
    ];
    const benefits = [
        {
            icon: '💰',
            title: 'Competitive Salary',
            description: 'We offer market-competitive compensation packages.',
        },
        {
            icon: '🏥',
            title: 'Health & Wellness',
            description: 'Medical, dental, and vision insurance for you and your family.',
        },
        {
            icon: '⏖️',
            title: 'Flexible PTO',
            description: 'Unlimited PTO to recharge and spend time with family.',
        },
        {
            icon: '🏠',
            title: 'Remote-First',
            description: 'Work from anywhere. We are a fully distributed team.',
        },
        {
            icon: '📚',
            title: 'Professional Development',
            description: 'Annual learning budget to grow your skills.',
        },
        {
            icon: '🎯',
            title: 'Mission-Driven Work',
            description: 'Make a real impact serving faith communities.',
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-white dark:bg-slate-950 transition-colors duration-normal", children: [_jsx("div", { className: "p-6", children: _jsx(BackButton, { variant: "ghost" }) }), _jsx("div", { className: "px-6 py-12 bg-gradient-to-b from-slate-900 to-slate-950", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsx("h1", { className: "text-5xl font-bold text-slate-900 dark:text-white mb-4", children: "Join Our Team" }), _jsx("p", { className: "text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto", children: "Help us empower faith communities with modern communication technology" })] }) }), _jsxs("div", { className: "max-w-4xl mx-auto px-6 py-12", children: [_jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white mb-6", children: "Why Join Connect?" }), _jsxs("div", { className: "bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-8", children: [_jsx("p", { className: "text-slate-700 dark:text-slate-300 mb-4", children: "At Connect, we believe that technology should serve a higher purpose. Our mission is to empower faith communities to communicate more effectively with their members and strengthen their communities." }), _jsx("p", { className: "text-slate-700 dark:text-slate-300 mb-4", children: "If you're passionate about both technology and making a meaningful impact, we'd love to have you on our team. We offer a collaborative environment where your contributions directly impact how churches connect with their congregations." }), _jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "We are committed to building a diverse and inclusive team that reflects the communities we serve." })] })] }), _jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white mb-12", children: "What We Offer" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: benefits.map((benefit, idx) => (_jsxs("div", { className: "bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-6 hover:border-accent-500/50 transition-colors", children: [_jsx("div", { className: "text-4xl mb-4", children: benefit.icon }), _jsx("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-2", children: benefit.title }), _jsx("p", { className: "text-slate-600 dark:text-slate-400 text-sm", children: benefit.description })] }, idx))) })] }), _jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white mb-12", children: "Open Positions" }), _jsx("div", { className: "space-y-4", children: jobOpenings.map((job) => (_jsxs("div", { className: "bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-6 hover:border-accent-500/50 hover:bg-slate-50 dark:bg-slate-900 transition-all group", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white group-hover:text-accent-400 transition-colors", children: job.title }), _jsx("p", { className: "text-slate-600 dark:text-slate-400 text-sm mt-1", children: job.description })] }), _jsx("button", { className: "bg-accent-500 hover:bg-accent-600 text-slate-900 dark:text-white font-semibold px-6 py-2 rounded-lg transition-colors whitespace-nowrap", children: "Apply Now" })] }), _jsxs("div", { className: "flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-accent-400", children: "\u2022" }), job.department] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-accent-400", children: "\u2022" }), job.location] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-accent-400", children: "\u2022" }), job.type] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-accent-400", children: "\u2022" }), job.experience] })] })] }, job.id))) }), _jsxs("div", { className: "mt-8 text-center", children: [_jsx("p", { className: "text-slate-700 dark:text-slate-300 mb-4", children: "Don't see the perfect role? Send us your resume and we'll keep you in mind for future opportunities." }), _jsx("a", { href: "mailto:careers@connect.com", className: "inline-block bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold py-3 px-8 rounded-lg transition-colors border border-slate-300 dark:border-slate-700 hover:border-accent-500/50", children: "Send Your Resume" })] })] }), _jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-900 dark:text-white mb-6", children: "Our Culture" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-accent-500/10 border border-accent-500/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-3", children: "Collaborative" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300", children: "We work together across teams to solve problems and achieve our mission." })] }), _jsxs("div", { className: "bg-accent-500/10 border border-accent-500/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-3", children: "Innovation" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300", children: "We encourage creative thinking and experimentation." })] }), _jsxs("div", { className: "bg-accent-500/10 border border-accent-500/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-3", children: "Learning" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300", children: "Continuous learning and growth are at the core of our culture." })] }), _jsxs("div", { className: "bg-accent-500/10 border border-accent-500/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-3", children: "Impact" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300", children: "Your work makes a real difference in people's lives." })] })] })] }), _jsxs("section", { className: "bg-gradient-to-r from-accent-500/10 to-blue-500/10 border border-accent-500/30 rounded-lg p-8 text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-4", children: "Ready to Make an Impact?" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300 mb-6 max-w-2xl mx-auto", children: "Join our growing team and help us empower faith communities around the world." }), _jsx("a", { href: "mailto:careers@connect.com", className: "inline-block bg-accent-500 hover:bg-accent-600 text-slate-900 dark:text-white font-semibold py-3 px-8 rounded-lg transition-colors", children: "Explore Opportunities" })] })] }), _jsx("div", { className: "max-w-4xl mx-auto px-6 py-8 border-t border-slate-300 dark:border-slate-700 mt-12", children: _jsxs("div", { className: "flex gap-8", children: [_jsx(Link, { to: "/", className: "text-accent-400 hover:text-accent-300 font-medium", children: "\u2190 Back to Home" }), _jsx(Link, { to: "/contact", className: "text-accent-400 hover:text-accent-300 font-medium", children: "Contact Us \u2192" })] }) })] }));
}
//# sourceMappingURL=CareersPage.js.map