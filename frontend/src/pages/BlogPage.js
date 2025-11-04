import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
export default function BlogPage() {
    const blogPosts = [
        {
            id: 1,
            title: 'Effective Church Communication in the Digital Age',
            excerpt: 'Learn how modern SMS technology can strengthen your church community and keep members engaged.',
            date: 'March 15, 2024',
            category: 'Communication',
            readTime: '5 min read',
        },
        {
            id: 2,
            title: 'Best Practices for Sending Timely Announcements',
            excerpt: 'Discover the optimal timing and messaging strategies for reaching your congregation effectively.',
            date: 'March 10, 2024',
            category: 'Best Practices',
            readTime: '6 min read',
        },
        {
            id: 3,
            title: 'Growing Your Church Community with Digital Tools',
            excerpt: 'Explore how technology can help you attract and retain members in your growing faith community.',
            date: 'March 5, 2024',
            category: 'Growth',
            readTime: '7 min read',
        },
        {
            id: 4,
            title: 'Managing Multiple Branches: A Complete Guide',
            excerpt: 'Tips and strategies for coordinating communication across multiple church locations.',
            date: 'February 28, 2024',
            category: 'Management',
            readTime: '8 min read',
        },
        {
            id: 5,
            title: 'Security Best Practices for Church Data',
            excerpt: 'Understanding how we protect your sensitive church information and member data.',
            date: 'February 20, 2024',
            category: 'Security',
            readTime: '6 min read',
        },
        {
            id: 6,
            title: 'Case Study: How Hope Church Increased Attendance',
            excerpt: 'Real-world example of how proactive SMS communication boosted church attendance and engagement.',
            date: 'February 15, 2024',
            category: 'Case Study',
            readTime: '7 min read',
        },
    ];
    const categories = ['All', 'Communication', 'Best Practices', 'Growth', 'Management', 'Security', 'Case Study'];
    return (_jsxs("div", { className: "min-h-screen bg-background transition-colors duration-normal", children: [_jsx("div", { className: "p-6", children: _jsx(BackButton, { variant: "ghost" }) }), _jsx("div", { className: "px-6 py-12 bg-muted", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsx("h1", { className: "text-5xl font-bold text-foreground mb-4", children: "Connect Blog" }), _jsx("p", { className: "text-xl text-foreground/80 max-w-2xl mx-auto", children: "Insights, tips, and best practices for church communication and community engagement" })] }) }), _jsxs("div", { className: "max-w-4xl mx-auto px-6 py-12", children: [_jsx("div", { className: "mb-12 flex flex-wrap gap-3", children: categories.map((category, idx) => (_jsx("button", { className: `px-4 py-2 rounded-lg font-medium transition-colors ${idx === 0
                                ? 'bg-primary text-background'
                                : 'bg-muted border border-border text-foreground/80 hover:border-primary/50 hover:text-primary'}`, children: category }, idx))) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-12", children: blogPosts.map((post) => (_jsxs("article", { className: "bg-muted border border-border rounded-lg p-6 hover:border-primary/50 hover:bg-muted transition-all group cursor-pointer", children: [_jsx("div", { className: "mb-4", children: _jsx("span", { className: "inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full", children: post.category }) }), _jsx("h3", { className: "text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors", children: post.title }), _jsx("p", { className: "text-foreground/80 mb-4 line-clamp-2", children: post.excerpt }), _jsxs("div", { className: "flex justify-between items-center text-sm text-muted-foreground border-t border-border pt-4", children: [_jsx("time", { dateTime: post.date, children: post.date }), _jsx("span", { children: post.readTime })] }), _jsx("div", { className: "mt-4 pt-4 border-t border-border", children: _jsx("button", { className: "text-primary hover:text-primary/80 font-medium text-sm group-hover:translate-x-1 transition-transform inline-block", children: "Read Article \u2192" }) })] }, post.id))) }), _jsx("div", { className: "bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/30 rounded-lg p-8", children: _jsxs("div", { className: "max-w-2xl mx-auto text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-4", children: "Subscribe to Our Newsletter" }), _jsx("p", { className: "text-foreground/80 mb-6", children: "Get the latest insights, tips, and updates delivered to your inbox every week." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsx("input", { type: "email", placeholder: "Enter your email", className: "flex-1 px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors" }), _jsx("button", { className: "bg-primary hover:bg-primary/90 text-background font-semibold px-6 py-3 rounded-lg transition-colors", children: "Subscribe" })] }), _jsx("p", { className: "text-muted-foreground text-sm mt-3", children: "We respect your privacy. Unsubscribe at any time." })] }) }), _jsxs("section", { className: "mt-12", children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: "Frequently Asked Questions" }), _jsx("div", { className: "space-y-4", children: [
                                    {
                                        question: 'How often do you publish new blog posts?',
                                        answer: 'We publish new blog posts every week, typically on Mondays and Thursdays.',
                                    },
                                    {
                                        question: 'Can I suggest a topic for a blog post?',
                                        answer: 'Absolutely! We love hearing from our community. Contact us at blog@connect.com with your suggestions.',
                                    },
                                    {
                                        question: 'Can I use your blog posts on my own website?',
                                        answer: 'You can share our blog posts with proper attribution and a link back to our site.',
                                    },
                                ].map((faq, idx) => (_jsxs("div", { className: "bg-muted border border-border rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: faq.question }), _jsx("p", { className: "text-muted-foreground", children: faq.answer })] }, idx))) })] })] }), _jsx("div", { className: "max-w-4xl mx-auto px-6 py-8 border-t border-border mt-12", children: _jsxs("div", { className: "flex gap-8", children: [_jsx(Link, { to: "/", className: "text-primary hover:text-primary/80 font-medium", children: "\u2190 Back to Home" }), _jsx(Link, { to: "/contact", className: "text-primary hover:text-primary/80 font-medium", children: "Contact Us \u2192" })] }) })] }));
}
//# sourceMappingURL=BlogPage.js.map