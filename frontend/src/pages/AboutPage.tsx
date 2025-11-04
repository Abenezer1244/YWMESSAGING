import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import AnimatedBlobs from '../components/AnimatedBlobs';

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
          <h1 className="text-5xl font-bold text-foreground mb-4">About Koinonia</h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Empowering faith communities with modern communication technology
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Mission Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              Koinonia was founded with a simple belief: churches need better tools to communicate with their congregations. Whether it's important announcements, event reminders, or emergency notifications, reliable communication is essential for modern faith communities.
            </p>
            <p>
              We recognized that churches were struggling with outdated communication methods and fragmented systems. Our mission became clear: build a dedicated SMS platform designed specifically for churches, with their unique needs in mind.
            </p>
            <p>
              Today, Koinonia serves hundreds of churches of all sizes, from small parishes to large dioceses, helping them communicate more effectively with their members and strengthen their communities.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="bg-muted border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Team</h2>
          <div className="bg-muted border border-border rounded-lg p-8">
            <p className="text-foreground/80 mb-4">
              We are a dedicated team of developers, designers, and church ministry professionals committed to making a difference in how faith communities communicate.
            </p>
            <p className="text-foreground/80 mb-4">
              Our diverse backgrounds—from software engineering to pastoral ministry—enable us to build solutions that truly understand the needs of churches.
            </p>
            <p className="text-muted-foreground text-sm">
              We're growing! If you're passionate about technology and faith communities, we'd love to hear from you. Visit our Careers page to learn about open positions.
            </p>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">Why Choose Koinonia?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Built for Churches</h3>
              <p className="text-foreground/80 text-sm">
                We understand the unique communication needs of faith communities and have built features specifically for churches.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Reliable & Secure</h3>
              <p className="text-foreground/80 text-sm">
                Enterprise-grade security and 99.9% uptime ensures your communications reach your congregation every time.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Affordable Plans</h3>
              <p className="text-foreground/80 text-sm">
                Starting at just $49/month, our plans are designed to fit organizations of any size and budget.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">World-Class Support</h3>
              <p className="text-foreground/80 text-sm">
                Our support team is dedicated to helping you succeed with personalized assistance and training.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Transform Your Communication?</h2>
          <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">
            Join hundreds of churches already using Koinonia to strengthen their communities.
          </p>
          <Link
            to="/register"
            className="inline-block bg-primary hover:bg-primary/90 text-background font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Start Your Free Trial
          </Link>
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
