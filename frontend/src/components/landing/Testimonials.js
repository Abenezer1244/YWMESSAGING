import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Card from '../ui/Card';
const testimonials = [
    {
        name: 'Pastor Michael Thompson',
        role: 'Senior Pastor',
        church: 'Grace Community Church',
        content: 'Connect YW has transformed how we communicate with our congregation. Managing messages across our 5 locations is now seamless, and our members love the personal touch.',
    },
    {
        name: 'Sarah Johnson',
        role: 'Church Administrator',
        church: 'First Baptist Church',
        content: 'The analytics dashboard gives us incredible insights into engagement. We\'ve seen a 40% increase in member participation since using scheduled messages and templates.',
    },
    {
        name: 'Rev. David Martinez',
        role: 'Lead Pastor',
        church: 'Hope Chapel Ministries',
        content: 'The recurring message feature is a game-changer. Birthday messages, weekly reminders, and welcome messages all happen automatically. It\'s like having an extra staff member!',
    },
];
export default function Testimonials() {
    return (_jsx("section", { id: "testimonials", className: "py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16 animate-fadeIn", children: [_jsxs("h2", { className: "text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight tracking-tight", children: ["Trusted by ", _jsx("span", { className: "text-primary-500", children: "Church Leaders" })] }), _jsx("p", { className: "text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto font-light leading-relaxed", children: "See how churches across the country are using Connect YW to strengthen their communities." })] }), _jsx("div", { className: "grid md:grid-cols-3 gap-8", children: testimonials.map((testimonial, index) => (_jsxs(Card, { variant: "default", className: "animate-slideUp p-8 border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-normal", style: { animationDelay: `${index * 0.1}s` }, children: [_jsx("div", { className: "mb-6", children: _jsx("svg", { className: "w-10 h-10 text-primary-100 dark:text-primary-900", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h3.983v10h-9.983z" }) }) }), _jsxs("p", { className: "text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed italic", children: ["\"", testimonial.content, "\""] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0", children: testimonial.name.charAt(0) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-neutral-900 dark:text-white text-sm", children: testimonial.name }), _jsxs("div", { className: "text-xs text-neutral-600 dark:text-neutral-400", children: [testimonial.role, ", ", testimonial.church] })] })] })] }, index))) }), _jsx("div", { className: "mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-800", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-primary-500 dark:text-primary-400 mb-2", children: "100+" }), _jsx("div", { className: "text-neutral-600 dark:text-neutral-400 text-sm", children: "Churches" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-primary-500 dark:text-primary-400 mb-2", children: "25K+" }), _jsx("div", { className: "text-neutral-600 dark:text-neutral-400 text-sm", children: "Members" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-primary-500 dark:text-primary-400 mb-2", children: "500K+" }), _jsx("div", { className: "text-neutral-600 dark:text-neutral-400 text-sm", children: "Messages Sent" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-primary-500 dark:text-primary-400 mb-2", children: "99.9%" }), _jsx("div", { className: "text-neutral-600 dark:text-neutral-400 text-sm", children: "Uptime" })] })] }) })] }) }));
}
//# sourceMappingURL=Testimonials.js.map