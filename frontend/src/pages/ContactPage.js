import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';
export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        churchName: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            // Simulate form submission
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Message sent! We\'ll get back to you soon.');
            setFormData({
                name: '',
                email: '',
                churchName: '',
                subject: '',
                message: '',
            });
        }
        catch (error) {
            toast.error('Failed to send message. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const contactMethods = [
        {
            icon: '📧',
            title: 'Email',
            value: 'support@connect.com',
            description: 'For general inquiries and support requests',
            href: 'mailto:support@connect.com',
        },
        {
            icon: '💬',
            title: 'Sales',
            value: 'sales@connect.com',
            description: 'For pricing, plans, and partnership opportunities',
            href: 'mailto:sales@connect.com',
        },
        {
            icon: '🔒',
            title: 'Security',
            value: 'security@connect.com',
            description: 'For security concerns and vulnerability reports',
            href: 'mailto:security@connect.com',
        },
        {
            icon: '🐞',
            title: 'Support',
            value: 'help@connect.com',
            description: 'For technical support and feature requests',
            href: 'mailto:help@connect.com',
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 transition-colors duration-normal", children: [_jsx("div", { className: "p-6", children: _jsx(BackButton, { variant: "ghost" }) }), _jsx("div", { className: "px-6 py-12 bg-gradient-to-b from-slate-900 to-slate-950", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsx("h1", { className: "text-5xl font-bold text-white mb-4", children: "Get in Touch" }), _jsx("p", { className: "text-xl text-slate-300 max-w-2xl mx-auto", children: "Have questions? We'd love to hear from you. Reach out to our team." })] }) }), _jsxs("div", { className: "max-w-4xl mx-auto px-6 py-12", children: [_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12", children: contactMethods.map((method, idx) => (_jsxs("a", { href: method.href, className: "bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-accent-500/50 hover:bg-slate-900 transition-all group", children: [_jsx("div", { className: "text-4xl mb-4 group-hover:scale-110 transition-transform", children: method.icon }), _jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: method.title }), _jsx("p", { className: "text-accent-400 font-medium mb-2", children: method.value }), _jsx("p", { className: "text-slate-400 text-sm", children: method.description })] }, idx))) }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-700 rounded-lg p-8 mb-12", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6", children: "Send us a Message" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-white mb-2", children: "Full Name *" }), _jsx("input", { type: "text", name: "name", value: formData.name, onChange: handleChange, placeholder: "John Doe", className: "w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-white mb-2", children: "Email Address *" }), _jsx("input", { type: "email", name: "email", value: formData.email, onChange: handleChange, placeholder: "john@church.com", className: "w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-white mb-2", children: "Church/Organization Name" }), _jsx("input", { type: "text", name: "churchName", value: formData.churchName, onChange: handleChange, placeholder: "Community Church", className: "w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-white mb-2", children: "Subject" }), _jsx("input", { type: "text", name: "subject", value: formData.subject, onChange: handleChange, placeholder: "How can we help?", className: "w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-white mb-2", children: "Message *" }), _jsx("textarea", { name: "message", value: formData.message, onChange: handleChange, placeholder: "Tell us more about your inquiry...", rows: 6, className: "w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors resize-none" })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full bg-accent-500 hover:bg-accent-600 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors", children: isSubmitting ? 'Sending...' : 'Send Message' })] })] }), _jsxs("div", { className: "bg-accent-500/10 border border-accent-500/30 rounded-lg p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6", children: "Support Hours" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-3", children: "Business Hours" }), _jsxs("ul", { className: "text-slate-300 space-y-2", children: [_jsx("li", { children: "Monday - Friday: 9:00 AM - 6:00 PM EST" }), _jsx("li", { children: "Saturday: 10:00 AM - 4:00 PM EST" }), _jsx("li", { children: "Sunday: Closed" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-3", children: "Response Time" }), _jsxs("ul", { className: "text-slate-300 space-y-2", children: [_jsx("li", { children: "Urgent Issues: Within 1 hour" }), _jsx("li", { children: "General Support: Within 4 hours" }), _jsx("li", { children: "Other Inquiries: Within 24 hours" })] })] })] })] })] }), _jsx("div", { className: "max-w-4xl mx-auto px-6 py-8 border-t border-slate-700 mt-12", children: _jsxs("div", { className: "flex gap-8", children: [_jsx(Link, { to: "/", className: "text-accent-400 hover:text-accent-300 font-medium", children: "\u2190 Back to Home" }), _jsx(Link, { to: "/about", className: "text-accent-400 hover:text-accent-300 font-medium", children: "\u2190 About Us" })] }) })] }));
}
//# sourceMappingURL=ContactPage.js.map