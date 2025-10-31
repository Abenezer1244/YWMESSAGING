import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Card from '../ui/Card';
const features = [
    {
        icon: (_jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) })),
        title: 'Multi-Branch Management',
        description: 'Manage 3-10 church locations from one unified dashboard. Coordinate messaging across all branches seamlessly.',
    },
    {
        icon: (_jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" }) })),
        title: 'SMS Messaging',
        description: 'Send messages to individuals, groups, entire branches, or your whole congregation. Support for one-way and two-way communication.',
    },
    {
        icon: (_jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) })),
        title: 'Message Scheduling',
        description: 'Schedule messages in advance or set up recurring messages (daily, weekly, monthly). Send welcome messages automatically.',
    },
    {
        icon: (_jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) })),
        title: 'Message Templates',
        description: 'Save time with pre-built and custom message templates. Maintain consistent communication while personalizing your messages.',
    },
    {
        icon: (_jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) })),
        title: 'Analytics & Insights',
        description: 'Track delivery rates, reply rates, and engagement metrics. Understand your congregation\'s communication patterns with detailed analytics.',
    },
    {
        icon: (_jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" }) })),
        title: 'Member Management',
        description: 'Import members via CSV, organize by groups and tags, and maintain detailed member profiles. Segment your congregation for targeted messaging.',
    },
];
export default function Features() {
    return (_jsx("section", { id: "features", className: "py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-secondary-900 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16 animate-fadeIn", children: [_jsxs("h2", { className: "text-4xl sm:text-5xl font-bold text-secondary-900 dark:text-secondary-50 mb-4", children: ["Everything You Need to", ' ', _jsx("span", { className: "text-primary-600 dark:text-primary-400", children: "Stay Connected" })] }), _jsx("p", { className: "text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto", children: "Powerful features designed specifically for churches managing multiple locations and hundreds of members." })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-8", children: features.map((feature, index) => (_jsxs(Card, { variant: "default", className: "group animate-slideUp", style: { animationDelay: `${index * 0.1}s` }, children: [_jsx("div", { className: "w-16 h-16 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary-600 dark:group-hover:bg-primary-500 group-hover:text-white dark:group-hover:text-secondary-50 transition-colors duration-normal", children: feature.icon }), _jsx("h3", { className: "text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-3", children: feature.title }), _jsx("p", { className: "text-secondary-600 dark:text-secondary-400 leading-relaxed", children: feature.description })] }, index))) })] }) }));
}
//# sourceMappingURL=Features.js.map