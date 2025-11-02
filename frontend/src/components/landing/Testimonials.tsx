import { Quote } from 'lucide-react';
import Card from '../ui/Card';

interface Testimonial {
  name: string;
  role: string;
  church: string;
  content: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Pastor Michael Thompson',
    role: 'Senior Pastor',
    church: 'Grace Community Church',
    content: 'Connect has transformed how we communicate with our congregation. Managing messages across our 5 locations is now seamless, and our members love the personal touch.',
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
  return (
    <section id="testimonials" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-800 via-blue-750 to-blue-federal overflow-hidden transition-colors duration-normal">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-pacific opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-sky-blue opacity-15 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-blue-pacific via-blue-sky-blue to-blue-honolulu bg-clip-text text-transparent">Church Leaders</span>
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
            See how churches across the country are using Connect to strengthen their communities.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
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
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-10 h-10 text-blue-sky-blue opacity-70" />
                </div>

                {/* Testimonial Content */}
                <p className="text-blue-50 mb-6 leading-relaxed italic text-sm">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-pacific to-blue-sky-blue rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                    <div className="text-xs text-blue-200">
                      {testimonial.role}, {testimonial.church}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-12 border-t border-blue-500/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-pacific to-blue-sky-blue bg-clip-text text-transparent mb-2">100+</div>
              <div className="text-blue-200 text-sm">Churches</div>
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-pacific to-blue-sky-blue bg-clip-text text-transparent mb-2">25K+</div>
              <div className="text-blue-200 text-sm">Members</div>
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-pacific to-blue-sky-blue bg-clip-text text-transparent mb-2">500K+</div>
              <div className="text-blue-200 text-sm">Messages Sent</div>
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-pacific to-blue-sky-blue bg-clip-text text-transparent mb-2">99.9%</div>
              <div className="text-blue-200 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

