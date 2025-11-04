import { Check, X } from 'lucide-react';

export default function Comparison() {
  return (
    <section id="comparison" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-foreground mb-6">Why Choose Connect</h2>
        <p className="text-lg text-muted-foreground mb-12">See how we compare to competitors</p>

        <div className="bg-muted/20 rounded-lg border border-border/50 overflow-hidden">
          {/* Simple comparison table */}
          <div className="grid grid-cols-5 gap-4 p-6 border-b border-border/50">
            <div>Feature</div>
            <div className="text-center font-semibold">Connect</div>
            <div className="text-center font-semibold">Twilio</div>
            <div className="text-center font-semibold">Pushpay</div>
            <div className="text-center font-semibold">Planning Center</div>
          </div>

          {/* Sample rows */}
          {[
            { name: 'SMS Messaging', connect: true, twilio: true, pushpay: true, planning: false },
            { name: 'Phone Encryption', connect: true, twilio: false, pushpay: false, planning: false },
            { name: 'Message Templates', connect: true, twilio: false, pushpay: true, planning: true },
          ].map((item, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-4 p-6 border-b border-border/30">
              <div className="font-medium">{item.name}</div>
              <div className="flex justify-center">{item.connect ? <Check className="w-5 h-5 text-primary" /> : <X className="w-5 h-5 text-muted-foreground/30" />}</div>
              <div className="flex justify-center">{item.twilio ? <Check className="w-5 h-5 text-muted-foreground/50" /> : <X className="w-5 h-5 text-muted-foreground/20" />}</div>
              <div className="flex justify-center">{item.pushpay ? <Check className="w-5 h-5 text-muted-foreground/50" /> : <X className="w-5 h-5 text-muted-foreground/20" />}</div>
              <div className="flex justify-center">{item.planning ? <Check className="w-5 h-5 text-muted-foreground/50" /> : <X className="w-5 h-5 text-muted-foreground/20" />}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
