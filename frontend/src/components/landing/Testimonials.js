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
    return (_jsx("section", { id: "testimonials", className: "py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-secondary-900 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16 animate-fadeIn", children: [_jsxs("h2", { className: "text-4xl sm:text-5xl font-bold text-secondary-900 dark:text-secondary-50 mb-4", children: ["Trusted by ", _jsx("span", { className: "text-primary-600 dark:text-primary-400", children: "Church Leaders" })] }), _jsx("p", { className: "text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto", children: "See how churches across the country are using Connect YW to strengthen their communities." })] }), _jsx("div", { className: "grid md:grid-cols-3 gap-8", children: testimonials.map((testimonial, index) => (_jsxs(Card, { variant: "default", className: "animate-slideUp", style: { animationDelay: `${index * 0.1}s` }, children: [_jsx("div", { className: "mb-4", children: _jsx("svg", { className: "w-12 h-12 text-primary-200 dark:text-primary-800", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h3.983v10h-9.983z" }) }) }), _jsxs("p", { className: "text-secondary-700 dark:text-secondary-300 mb-6 leading-relaxed italic", children: ["\"", testimonial.content, "\""] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-primary-400 dark:from-primary-500 to-primary-600 dark:to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4", children: testimonial.name.charAt(0) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-secondary-900 dark:text-secondary-50", children: testimonial.name }), _jsxs("div", { className: "text-sm text-secondary-600 dark:text-secondary-400", children: [testimonial.role, ", ", testimonial.church] })] })] })] }, index))) }), _jsx("div", { className: "mt-16 pt-12 border-t border-secondary-200 dark:border-secondary-700", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2", children: "100+" }), _jsx("div", { className: "text-secondary-600 dark:text-secondary-400", children: "Churches" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2", children: "25K+" }), _jsx("div", { className: "text-secondary-600 dark:text-secondary-400", children: "Members" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2", children: "500K+" }), _jsx("div", { className: "text-secondary-600 dark:text-secondary-400", children: "Messages Sent" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2", children: "99.9%" }), _jsx("div", { className: "text-secondary-600 dark:text-secondary-400", children: "Uptime" })] })] }) })] }) }));
}
//# sourceMappingURL=Testimonials.js.map