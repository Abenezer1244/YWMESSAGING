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
    return (_jsxs("div", { className: "min-h-screen bg-background transition-colors duration-normal", children: [_jsx("div", { className: "p-6", children: _jsx(BackButton, { variant: "ghost" }) }), _jsx("div", { className: "px-6 py-12 bg-muted", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsx("h1", { className: "text-5xl font-bold text-foreground mb-4", children: "About Connect" }), _jsx("p", { className: "text-xl text-foreground/80 max-w-2xl mx-auto", children: "Empowering faith communities with modern communication technology" })] }) }), _jsxs("div", { className: "max-w-4xl mx-auto px-6 py-12", children: [_jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-foreground mb-6", children: "Our Story" }), _jsxs("div", { className: "space-y-4 text-foreground/80 leading-relaxed", children: [_jsx("p", { children: "Connect was founded with a simple belief: churches need better tools to communicate with their congregations. Whether it's important announcements, event reminders, or emergency notifications, reliable communication is essential for modern faith communities." }), _jsx("p", { children: "We recognized that churches were struggling with outdated communication methods and fragmented systems. Our mission became clear: build a dedicated SMS platform designed specifically for churches, with their unique needs in mind." }), _jsx("p", { children: "Today, Connect serves hundreds of churches of all sizes, from small parishes to large dioceses, helping them communicate more effectively with their members and strengthen their communities." })] })] }), _jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-foreground mb-12", children: "Our Values" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: values.map((value, idx) => (_jsxs("div", { className: "bg-muted border border-border rounded-lg p-6 hover:border-primary/50 transition-colors", children: [_jsx("div", { className: "text-4xl mb-4", children: value.icon }), _jsx("h3", { className: "text-xl font-semibold text-foreground mb-3", children: value.title }), _jsx("p", { className: "text-muted-foreground text-sm", children: value.description })] }, idx))) })] }), _jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-foreground mb-6", children: "Our Team" }), _jsxs("div", { className: "bg-muted border border-border rounded-lg p-8", children: [_jsx("p", { className: "text-foreground/80 mb-4", children: "We are a dedicated team of developers, designers, and church ministry professionals committed to making a difference in how faith communities communicate." }), _jsx("p", { className: "text-foreground/80 mb-4", children: "Our diverse backgrounds\u2014from software engineering to pastoral ministry\u2014enable us to build solutions that truly understand the needs of churches." }), _jsx("p", { className: "text-muted-foreground text-sm", children: "We're growing! If you're passionate about technology and faith communities, we'd love to hear from you. Visit our Careers page to learn about open positions." })] })] }), _jsxs("section", { className: "mb-16", children: [_jsx("h2", { className: "text-3xl font-bold text-foreground mb-6", children: "Why Choose Connect?" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-primary/10 border border-primary/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground mb-3", children: "Built for Churches" }), _jsx("p", { className: "text-foreground/80 text-sm", children: "We understand the unique communication needs of faith communities and have built features specifically for churches." })] }), _jsxs("div", { className: "bg-primary/10 border border-primary/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground mb-3", children: "Reliable & Secure" }), _jsx("p", { className: "text-foreground/80 text-sm", children: "Enterprise-grade security and 99.9% uptime ensures your communications reach your congregation every time." })] }), _jsxs("div", { className: "bg-primary/10 border border-primary/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground mb-3", children: "Affordable Plans" }), _jsx("p", { className: "text-foreground/80 text-sm", children: "Starting at just $49/month, our plans are designed to fit organizations of any size and budget." })] }), _jsxs("div", { className: "bg-primary/10 border border-primary/30 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground mb-3", children: "World-Class Support" }), _jsx("p", { className: "text-foreground/80 text-sm", children: "Our support team is dedicated to helping you succeed with personalized assistance and training." })] })] })] }), _jsxs("section", { className: "bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/30 rounded-lg p-8 text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-4", children: "Ready to Transform Your Communication?" }), _jsx("p", { className: "text-foreground/80 mb-6 max-w-2xl mx-auto", children: "Join hundreds of churches already using Connect to strengthen their communities." }), _jsx(Link, { to: "/register", className: "inline-block bg-primary hover:bg-primary/90 text-background font-semibold py-3 px-8 rounded-lg transition-colors", children: "Start Your Free Trial" })] })] }), _jsx("div", { className: "max-w-4xl mx-auto px-6 py-8 border-t border-border mt-12", children: _jsxs("div", { className: "flex gap-8", children: [_jsx(Link, { to: "/", className: "text-primary hover:text-primary/80 font-medium", children: "\u2190 Back to Home" }), _jsx(Link, { to: "/contact", className: "text-primary hover:text-primary/80 font-medium", children: "Contact Us \u2192" })] }) })] }));
}
//# sourceMappingURL=AboutPage.js.map