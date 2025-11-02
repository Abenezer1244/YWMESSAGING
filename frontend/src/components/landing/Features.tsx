import { Users, MessageSquare, Clock, FileText, BarChart3, UserPlus } from 'lucide-react';
import Card from '../ui/Card';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Multi-Branch Management',
    description: 'Manage 3-10 church locations from one unified dashboard. Coordinate messaging across all branches seamlessly.',
  },
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: 'SMS Messaging',
    description: 'Send messages to individuals, groups, entire branches, or your whole congregation. Support for one-way and two-way communication.',
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: 'Message Scheduling',
    description: 'Schedule messages in advance or set up recurring messages (daily, weekly, monthly). Send welcome messages automatically.',
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: 'Message Templates',
    description: 'Save time with pre-built and custom message templates. Maintain consistent communication while personalizing your messages.',
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: 'Analytics & Insights',
    description: 'Track delivery rates, reply rates, and engagement metrics. Understand your congregation\'s communication patterns with detailed analytics.',
  },
  {
    icon: <UserPlus className="w-8 h-8" />,
    title: 'Member Management',
    description: 'Import members via CSV, organize by groups and tags, and maintain detailed member profiles. Segment your congregation for targeted messaging.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-800 via-blue-750 to-blue-federal overflow-hidden transition-colors duration-normal">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-blue-sky-blue opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-pacific opacity-15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-pacific via-blue-sky-blue to-blue-honolulu bg-clip-text text-transparent">Stay Connected</span>
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
            Powerful features designed specifically for churches managing multiple locations and hundreds of members.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="default"
              className="group animate-slideUp relative p-8 bg-gradient-to-br from-blue-700/40 to-blue-marian/40 border border-blue-600/40 hover:border-blue-500/80 backdrop-blur-xl rounded-2xl transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-pacific/0 via-blue-sky-blue/0 to-blue-honolulu/0 group-hover:from-blue-pacific/5 group-hover:via-blue-sky-blue/5 group-hover:to-blue-honolulu/5 transition-all duration-300 pointer-events-none"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-pacific to-blue-sky-blue text-white rounded-lg flex items-center justify-center mb-5 group-hover:shadow-lg group-hover:shadow-blue-sky-blue/50 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

