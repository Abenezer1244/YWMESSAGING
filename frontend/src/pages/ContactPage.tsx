import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';
import AnimatedBlobs from '../components/AnimatedBlobs';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    churchName: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      value: 'support@koinoniasms.com',
      description: 'For general inquiries and support requests',
      href: 'mailto:support@koinoniasms.com',
    },
    {
      icon: '💬',
      title: 'Sales',
      value: 'sales@koinoniasms.com',
      description: 'For pricing, plans, and partnership opportunities',
      href: 'mailto:sales@koinoniasms.com',
    },
    {
      icon: '🔒',
      title: 'Security',
      value: 'security@koinoniasms.com',
      description: 'For security concerns and vulnerability reports',
      href: 'mailto:security@koinoniasms.com',
    },
    {
      icon: '🐞',
      title: 'Support',
      value: 'help@koinoniasms.com',
      description: 'For technical support and feature requests',
      href: 'mailto:help@koinoniasms.com',
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
          <h1 className="text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Reach out to our team.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Methods */}
          {contactMethods.map((method, idx) => (
            <a
              key={idx}
              href={method.href}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:bg-card transition-all group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{method.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{method.title}</h3>
              <p className="text-primary font-medium mb-2">{method.value}</p>
              <p className="text-muted-foreground text-sm">{method.description}</p>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-card border border-border rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@church.com"
                className="w-full px-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            {/* Church Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Church/Organization Name
              </label>
              <input
                type="text"
                name="churchName"
                value={formData.churchName}
                onChange={handleChange}
                placeholder="Community Church"
                className="w-full px-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                className="w-full px-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                rows={6}
                className="w-full px-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Hours Section */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Support Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Business Hours</h3>
              <ul className="text-foreground/80 space-y-2">
                <li>Monday - Friday: 9:00 AM - 6:00 PM EST</li>
                <li>Saturday: 10:00 AM - 4:00 PM EST</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Response Time</h3>
              <ul className="text-foreground/80 space-y-2">
                <li>Urgent Issues: Within 1 hour</li>
                <li>General Support: Within 4 hours</li>
                <li>Other Inquiries: Within 24 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="max-w-4xl mx-auto px-6 py-8 border-t border-border mt-12">
        <div className="flex gap-8">
          <Link to="/" className="text-primary hover:text-primary/80 font-medium">
            ← Back to Home
          </Link>
          <Link to="/about" className="text-primary hover:text-primary/80 font-medium">
            ← About Us
          </Link>
        </div>
      </div>
    </div>
  );
}
