import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Users, MessageSquare, Clock, FileText, BarChart3, UserPlus } from 'lucide-react';
import Card from '../ui/Card';
const features = [
    {
        icon: _jsx(Users, { className: "w-8 h-8" }),
        title: 'Multi-Branch Management',
        description: 'Manage 3-10 church locations from one unified dashboard. Coordinate messaging across all branches seamlessly.',
    },
    {
        icon: _jsx(MessageSquare, { className: "w-8 h-8" }),
        title: 'SMS Messaging',
        description: 'Send messages to individuals, groups, entire branches, or your whole congregation. Support for one-way and two-way communication.',
    },
    {
        icon: _jsx(Clock, { className: "w-8 h-8" }),
        title: 'Message Scheduling',
        description: 'Schedule messages in advance or set up recurring messages (daily, weekly, monthly). Send welcome messages automatically.',
    },
    {
        icon: _jsx(FileText, { className: "w-8 h-8" }),
        title: 'Message Templates',
        description: 'Save time with pre-built and custom message templates. Maintain consistent communication while personalizing your messages.',
    },
    {
        icon: _jsx(BarChart3, { className: "w-8 h-8" }),
        title: 'Analytics & Insights',
        description: 'Track delivery rates, reply rates, and engagement metrics. Understand your congregation\'s communication patterns with detailed analytics.',
    },
    {
        icon: _jsx(UserPlus, { className: "w-8 h-8" }),
        title: 'Member Management',
        description: 'Import members via CSV, organize by groups and tags, and maintain detailed member profiles. Segment your congregation for targeted messaging.',
    },
];
export default function Features() {
    return (_jsxs("section", { id: "features", className: "relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden transition-colors duration-normal", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-20 left-1/4 w-80 h-80 bg-accent-400 opacity-10 rounded-full blur-3xl animate-pulse" }), _jsx("div", { className: "absolute bottom-20 right-1/4 w-96 h-96 bg-accent-500 opacity-15 rounded-full blur-3xl animate-pulse delay-1000" })] }), _jsxs("div", { className: "relative max-w-7xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16 animate-fadeIn", children: [_jsxs("h2", { className: "text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight", children: ["Everything You Need to", ' ', _jsx("span", { className: "bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent", children: "Stay Connected" })] }), _jsx("p", { className: "text-lg text-slate-300 max-w-3xl mx-auto font-light leading-relaxed", children: "Powerful features designed specifically for churches managing multiple locations and hundreds of members." })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: features.map((feature, index) => (_jsxs(Card, { variant: "default", className: "group animate-slideUp relative p-8 bg-slate-900/50 border border-slate-700/50 hover:border-accent-400/50 backdrop-blur-xl rounded-lg transition-all duration-300 overflow-hidden", style: { animationDelay: `${index * 0.1}s` }, children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-accent-500/0 via-accent-400/0 to-accent-300/0 group-hover:from-accent-500/5 group-hover:via-accent-400/5 group-hover:to-accent-300/5 transition-all duration-300 pointer-events-none" }), _jsxs("div", { className: "relative z-10", children: [_jsx("div", { className: "w-12 h-12 bg-accent-500 text-slate-950 rounded-lg flex items-center justify-center mb-5 group-hover:shadow-lg group-hover:shadow-accent-500/50 transition-all duration-300", children: feature.icon }), _jsx("h3", { className: "text-lg font-semibold text-white mb-3", children: feature.title }), _jsx("p", { className: "text-slate-300 text-sm leading-relaxed", children: feature.description })] })] }, index))) })] })] }));
}
//# sourceMappingURL=Features.js.map