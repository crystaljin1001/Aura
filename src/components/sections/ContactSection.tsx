import { Button } from '@/components/ui/button';
import { Mail, Calendar, Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export function ContactSection() {
  return (
    <section id="contact" className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="glass-card-glow p-12 md:p-16">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Let's build something{' '}
            <span className="gradient-text">amazing</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            I'm always open to discussing new opportunities, collaborations,
            or just chatting about product ideas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/auth">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                <Mail className="w-4 h-4 mr-2" />
                Get in Touch
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border hover:bg-glass-hover">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule a Call
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg glass-card hover:bg-glass-hover transition-colors"
            >
              <Github className="w-5 h-5 text-muted-foreground" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg glass-card hover:bg-glass-hover transition-colors"
            >
              <Linkedin className="w-5 h-5 text-muted-foreground" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg glass-card hover:bg-glass-hover transition-colors"
            >
              <Twitter className="w-5 h-5 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
