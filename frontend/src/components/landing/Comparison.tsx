import { Check, X } from 'lucide-react';

interface ComparisonItem {
  name: string;
  koinonia: boolean;
  twilio: boolean;
  pushpay: boolean;
  planningCenter: boolean;
  rightNow: boolean;
  breeze: boolean;
  unique?: boolean;
}

const comparisonFeatures: ComparisonItem[] = [
  {
    name: 'SMS Messaging',
    koinonia: true,
    twilio: true,
    pushpay: true,
    planningCenter: false,
    rightNow: true,
    breeze: true,
  },
  {
    name: 'Phone Encryption (E2E)',
    koinonia: true,
    twilio: false,
    pushpay: false,
    planningCenter: false,
    rightNow: false,
    breeze: false,
    unique: true,
  },
  {
    name: 'Message Templates',
    koinonia: true,
    twilio: false,
    pushpay: true,
    planningCenter: true,
    rightNow: true,
    breeze: true,
  },
  {
    name: 'Recurring Messages',
    koinonia: true,
    twilio: false,
    pushpay: true,
    planningCenter: true,
    rightNow: false,
    breeze: true,
  },
  {
    name: 'Multi-Location Support',
    koinonia: true,
    twilio: false,
    pushpay: true,
    planningCenter: true,
    rightNow: true,
    breeze: true,
  },
  {
    name: 'Two-Way Messaging',
    koinonia: true,
    twilio: true,
    pushpay: false,
    planningCenter: false,
    rightNow: false,
    breeze: false,
  },
  {
    name: 'Analytics Dashboard',
    koinonia: true,
    twilio: true,
    pushpay: true,
    planningCenter: true,
    rightNow: true,
    breeze: true,
  },
  {
    name: 'Member Management',
    koinonia: true,
    twilio: false,
    pushpay: true,
    planningCenter: true,
    rightNow: true,
    breeze: true,
  },
  {
    name: 'Group Segmentation',
    koinonia: true,
    twilio: false,
    pushpay: true,
    planningCenter: true,
    rightNow: true,
    breeze: true,
  },
  {
    name: 'API Access',
    koinonia: true,
    twilio: true,
    pushpay: false,
    planningCenter: false,
    rightNow: false,
    breeze: false,
  },
  {
    name: 'Security Logging',
    koinonia: true,
    twilio: false,
    pushpay: false,
    planningCenter: true,
    rightNow: false,
    breeze: false,
    unique: true,
  },
  {
    name: 'CSRF Protection',
    koinonia: true,
    twilio: false,
    pushpay: false,
    planningCenter: false,
    rightNow: false,
    breeze: false,
    unique: true,
  },
  {
    name: 'Mobile App',
    koinonia: true,
    twilio: false,
    pushpay: true,
    planningCenter: true,
    rightNow: true,
    breeze: true,
  },
  {
    name: '14-Day Free Trial',
    koinonia: true,
    twilio: false,
    pushpay: true,
    planningCenter: true,
    rightNow: false,
    breeze: true,
  },
  {
    name: 'Affordable Pricing',
    koinonia: true,
    twilio: true,
    pushpay: false,
    planningCenter: false,
    rightNow: false,
    breeze: false,
    unique: true,
  },
  {
    name: 'Church-Specific Design',
    koinonia: true,
    twilio: false,
    pushpay: true,
    planningCenter: true,
    rightNow: true,
    breeze: true,
  },
];

export default function Comparison() {
  return (
    <section id="comparison" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">Why Choose Koinonia</h2>
          <p className="text-lg text-muted-foreground mb-4">Comprehensive feature comparison with industry leaders</p>
          <p className="text-sm text-muted-foreground">16 essential features for church communication across 6 platforms</p>
        </div>

        {/* Comparison Table - Scrollable on mobile */}
        <div className="overflow-x-auto">
          <div className="bg-muted/20 rounded-lg border border-border/50 overflow-hidden min-w-full">
            {/* Table Header */}
            <div className="grid gap-3 p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent"
                 style={{gridTemplateColumns: '200px repeat(6, 1fr)'}}>
              <div className="font-semibold text-foreground">Feature</div>
              <div className="text-center">
                <div className="font-semibold text-primary bg-primary/10 rounded px-2 py-1 inline-block">Koinonia</div>
              </div>
              <div className="text-center text-xs font-semibold text-foreground">Twilio</div>
              <div className="text-center text-xs font-semibold text-foreground">Pushpay</div>
              <div className="text-center text-xs font-semibold text-foreground">Planning Center</div>
              <div className="text-center text-xs font-semibold text-foreground">RightNow</div>
              <div className="text-center text-xs font-semibold text-foreground">Breeze</div>
            </div>

            {/* Table Body */}
            {comparisonFeatures.map((feature, idx) => (
              <div
                key={idx}
                className={`grid gap-3 p-4 border-b border-border/30 hover:bg-primary/5 transition-colors ${
                  feature.unique ? 'bg-primary/5' : idx % 2 === 0 ? 'bg-muted/10' : ''
                }`}
                style={{gridTemplateColumns: '200px repeat(6, 1fr)'}}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{feature.name}</span>
                  {feature.unique && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      Unique
                    </span>
                  )}
                </div>

                {/* Koinonia - Featured */}
                <div className="flex justify-center">
                  {feature.koinonia ? (
                    <Check className="w-5 h-5 text-primary font-bold" strokeWidth={3} />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/20" />
                  )}
                </div>

                {/* Competitors */}
                <div className="flex justify-center">
                  {feature.twilio ? (
                    <Check className="w-5 h-5 text-muted-foreground/50 font-bold" strokeWidth={3} />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/20" />
                  )}
                </div>
                <div className="flex justify-center">
                  {feature.pushpay ? (
                    <Check className="w-5 h-5 text-muted-foreground/50 font-bold" strokeWidth={3} />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/20" />
                  )}
                </div>
                <div className="flex justify-center">
                  {feature.planningCenter ? (
                    <Check className="w-5 h-5 text-muted-foreground/50 font-bold" strokeWidth={3} />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/20" />
                  )}
                </div>
                <div className="flex justify-center">
                  {feature.rightNow ? (
                    <Check className="w-5 h-5 text-muted-foreground/50 font-bold" strokeWidth={3} />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/20" />
                  )}
                </div>
                <div className="flex justify-center">
                  {feature.breeze ? (
                    <Check className="w-5 h-5 text-muted-foreground/50 font-bold" strokeWidth={3} />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/20" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Highlights */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-border/50 bg-muted/20 hover:border-primary/30 transition-all">
            <div className="text-2xl mb-3">🔐</div>
            <h3 className="font-semibold text-foreground mb-2">End-to-End Encryption</h3>
            <p className="text-sm text-muted-foreground">Phone numbers encrypted with AES-256-GCM, searchable with HMAC-SHA256</p>
          </div>
          <div className="p-6 rounded-lg border border-border/50 bg-muted/20 hover:border-primary/30 transition-all">
            <div className="text-2xl mb-3">🛡️</div>
            <h3 className="font-semibold text-foreground mb-2">Enterprise Security</h3>
            <p className="text-sm text-muted-foreground">CSRF protection, rate limiting, security event logging, full audit trails</p>
          </div>
          <div className="p-6 rounded-lg border border-border/50 bg-muted/20 hover:border-primary/30 transition-all">
            <div className="text-2xl mb-3">⛪</div>
            <h3 className="font-semibold text-foreground mb-2">Church-First Design</h3>
            <p className="text-sm text-muted-foreground">Built specifically for churches with affordable pricing and 14-day free trial</p>
          </div>
        </div>

        {/* Feature Count Summary */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 text-sm">
            <div>
              <div className="text-2xl font-bold text-primary">16</div>
              <div className="text-muted-foreground">Features Compared</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">6</div>
              <div className="text-muted-foreground">Platforms</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-muted-foreground">Unique to Koinonia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
