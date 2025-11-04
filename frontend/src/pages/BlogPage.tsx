import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import AnimatedBlobs from '../components/AnimatedBlobs';

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

  return (
    <div className="min-h-screen bg-background transition-colors duration-normal">
      <AnimatedBlobs />
      {/* Back Button */}
      <div className="p-6">
        <BackButton variant="ghost" />
      </div>

      {/* Header Section */}
      <div className="px-6 py-12 bg-muted">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">Koinonia Blog</h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Insights, tips, and best practices for church communication and community engagement
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Categories */}
        <div className="mb-12 flex flex-wrap gap-3">
          {categories.map((category, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                idx === 0
                  ? 'bg-primary text-background'
                  : 'bg-muted border border-border text-foreground/80 hover:border-primary/50 hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-muted border border-border rounded-lg p-6 hover:border-primary/50 hover:bg-muted transition-all group cursor-pointer"
            >
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-foreground/80 mb-4 line-clamp-2">
                {post.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex justify-between items-center text-sm text-muted-foreground border-t border-border pt-4">
                <time dateTime={post.date}>{post.date}</time>
                <span>{post.readTime}</span>
              </div>

              {/* Read More Link */}
              <div className="mt-4 pt-4 border-t border-border">
                <button className="text-primary hover:text-primary/80 font-medium text-sm group-hover:translate-x-1 transition-transform inline-block">
                  Read Article →
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/30 rounded-lg p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-foreground/80 mb-6">
              Get the latest insights, tips, and updates delivered to your inbox every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
              <button className="bg-primary hover:bg-primary/90 text-background font-semibold px-6 py-3 rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-muted-foreground text-sm mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
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
            ].map((faq, idx) => (
              <div key={idx} className="bg-muted border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Navigation Links */}
      <div className="max-w-4xl mx-auto px-6 py-8 border-t border-border mt-12">
        <div className="flex gap-8">
          <Link to="/" className="text-primary hover:text-primary/80 font-medium">
            ← Back to Home
          </Link>
          <Link to="/contact" className="text-primary hover:text-primary/80 font-medium">
            Contact Us →
          </Link>
        </div>
      </div>
    </div>
  );
}
