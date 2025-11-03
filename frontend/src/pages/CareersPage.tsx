import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

export default function CareersPage() {
  const jobOpenings = [
    {
      id: 1,
      title: 'Senior Full-Stack Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: '5+ years',
      description: 'Build and maintain our core platform serving hundreds of churches.',
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Shape the future of church communication technology.',
    },
    {
      id: 3,
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time',
      experience: '2+ years',
      description: 'Help our church customers succeed with Connect.',
    },
    {
      id: 4,
      title: 'Solutions Architect',
      department: 'Professional Services',
      location: 'Remote',
      type: 'Full-time',
      experience: '4+ years',
      description: 'Design custom solutions for enterprise church customers.',
    },
    {
      id: 5,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Drive growth and awareness of Connect in the faith community.',
    },
    {
      id: 6,
      title: 'Support Specialist',
      department: 'Support',
      location: 'Remote',
      type: 'Full-time',
      experience: '1+ years',
      description: 'Provide excellent support to our growing customer base.',
    },
  ];

  const benefits = [
    {
      icon: '💰',
      title: 'Competitive Salary',
      description: 'We offer market-competitive compensation packages.',
    },
    {
      icon: '🏥',
      title: 'Health & Wellness',
      description: 'Medical, dental, and vision insurance for you and your family.',
    },
    {
      icon: '⏖️',
      title: 'Flexible PTO',
      description: 'Unlimited PTO to recharge and spend time with family.',
    },
    {
      icon: '🏠',
      title: 'Remote-First',
      description: 'Work from anywhere. We are a fully distributed team.',
    },
    {
      icon: '📚',
      title: 'Professional Development',
      description: 'Annual learning budget to grow your skills.',
    },
    {
      icon: '🎯',
      title: 'Mission-Driven Work',
      description: 'Make a real impact serving faith communities.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-normal">
      {/* Back Button */}
      <div className="p-6">
        <BackButton variant="ghost" />
      </div>

      {/* Header Section */}
      <div className="px-6 py-12 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Join Our Team</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Help us empower faith communities with modern communication technology
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Why Join Connect Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Why Join Connect?</h2>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8">
            <p className="text-slate-300 mb-4">
              At Connect, we believe that technology should serve a higher purpose. Our mission is to empower faith communities to communicate more effectively with their members and strengthen their communities.
            </p>
            <p className="text-slate-300 mb-4">
              If you're passionate about both technology and making a meaningful impact, we'd love to have you on our team. We offer a collaborative environment where your contributions directly impact how churches connect with their congregations.
            </p>
            <p className="text-slate-400">
              We are committed to building a diverse and inclusive team that reflects the communities we serve.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-accent-500/50 transition-colors"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-12">Open Positions</h2>
          <div className="space-y-4">
            {jobOpenings.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-accent-500/50 hover:bg-slate-900 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-accent-400 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{job.description}</p>
                  </div>
                  <button className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors whitespace-nowrap">
                    Apply Now
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="text-accent-400">•</span>
                    {job.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-accent-400">•</span>
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-accent-400">•</span>
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-accent-400">•</span>
                    {job.experience}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-300 mb-4">
              Don't see the perfect role? Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <a
              href="mailto:careers@connect.com"
              className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors border border-slate-700 hover:border-accent-500/50"
            >
              Send Your Resume
            </a>
          </div>
        </section>

        {/* Culture Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Our Culture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-accent-500/10 border border-accent-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Collaborative</h3>
              <p className="text-slate-300">
                We work together across teams to solve problems and achieve our mission.
              </p>
            </div>
            <div className="bg-accent-500/10 border border-accent-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Innovation</h3>
              <p className="text-slate-300">
                We encourage creative thinking and experimentation.
              </p>
            </div>
            <div className="bg-accent-500/10 border border-accent-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Learning</h3>
              <p className="text-slate-300">
                Continuous learning and growth are at the core of our culture.
              </p>
            </div>
            <div className="bg-accent-500/10 border border-accent-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Impact</h3>
              <p className="text-slate-300">
                Your work makes a real difference in people's lives.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-accent-500/10 to-blue-500/10 border border-accent-500/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Make an Impact?</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Join our growing team and help us empower faith communities around the world.
          </p>
          <a
            href="mailto:careers@connect.com"
            className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Explore Opportunities
          </a>
        </section>
      </div>

      {/* Navigation Links */}
      <div className="max-w-4xl mx-auto px-6 py-8 border-t border-slate-700 mt-12">
        <div className="flex gap-8">
          <Link to="/" className="text-accent-400 hover:text-accent-300 font-medium">
            ← Back to Home
          </Link>
          <Link to="/contact" className="text-accent-400 hover:text-accent-300 font-medium">
            Contact Us →
          </Link>
        </div>
      </div>
    </div>
  );
}
