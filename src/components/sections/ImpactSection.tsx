'use client';

import { useState, useEffect, useRef } from 'react';
import { Layers, Star, Users, Code2 } from 'lucide-react';

// Animated Counter Component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              if (timer) clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className="font-mono font-bold">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const metrics = [
  { label: 'Products Shipped', value: 12, suffix: '', icon: <Layers className="w-5 h-5" />, color: 'text-blue-400' },
  { label: 'GitHub Stars', value: 2847, suffix: '', icon: <Star className="w-5 h-5" />, color: 'text-amber-400' },
  { label: 'Total Users', value: 15, suffix: 'k+', icon: <Users className="w-5 h-5" />, color: 'text-emerald-400' },
  { label: 'Lines of Code', value: 500, suffix: 'k+', icon: <Code2 className="w-5 h-5" />, color: 'text-cyan-400' },
];

const testimonials = [
  {
    quote: "Alex's products are incredibly well-crafted. You can tell every detail was thought through.",
    author: 'Sarah Chen',
    role: 'Engineering Manager, Google',
  },
  {
    quote: "One of the most productive engineers I've worked with. Ships quality code at incredible speed.",
    author: 'Mike Johnson',
    role: 'CTO, StartupXYZ',
  },
];

export function ImpactSection() {
  return (
    <section id="impact" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Impact
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Numbers that{' '}
            <span className="gradient-text">speak</span>
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {metrics.map((metric) => (
            <div key={metric.label} className="glass-card p-6 text-center group hover:scale-[1.02] transition-transform">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-current/10 mb-4 ${metric.color}`}>
                {metric.icon}
              </div>
              <p className={`text-3xl md:text-4xl font-bold mb-1 ${metric.color} metric-glow`}>
                <AnimatedCounter value={metric.value} suffix={metric.suffix} />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="glass-card-glow p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-lg text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{testimonial.author[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
