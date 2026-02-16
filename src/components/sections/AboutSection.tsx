import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Briefcase } from 'lucide-react';

const skills = [
  { category: 'Frontend', items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Framer Motion'] },
  { category: 'Backend', items: ['Node.js', 'Python', 'PostgreSQL', 'Supabase', 'GraphQL'] },
  { category: 'DevOps', items: ['Docker', 'AWS', 'Vercel', 'GitHub Actions', 'Terraform'] },
  { category: 'Tools', items: ['Figma', 'Cursor', 'Linear', 'Notion', 'Postman'] },
];

const experiences = [
  {
    role: 'Solo Founder',
    company: 'Aura Labs',
    period: '2024 - Present',
    description: 'Building developer productivity tools. Shipped 5 products with 10k+ users.',
  },
  {
    role: 'Senior Engineer',
    company: 'TechCorp',
    period: '2021 - 2024',
    description: 'Led frontend team of 5. Built design system used across 12 products.',
  },
  {
    role: 'Full-Stack Developer',
    company: 'StartupXYZ',
    period: '2019 - 2021',
    description: 'First engineering hire. Built MVP to Series A. 50x user growth.',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Story */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              About Me
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
              I build products that{' '}
              <span className="gradient-text">make a difference</span>
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                My journey started with a simple belief: great products come from understanding
                real problems. Over the past 5 years, I've shipped 12 products across different
                domains – from developer tools to consumer apps.
              </p>
              <p>
                I thrive in the 0-to-1 phase. Taking an idea, validating it with users, and
                building something people love. My approach is simple: ship fast, learn faster,
                iterate constantly.
              </p>
              <p>
                When I'm not coding, you'll find me writing about product development,
                contributing to open source, or mentoring aspiring builders.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <Badge variant="secondary" className="px-3 py-1.5">
                <MapPin className="w-3 h-3 mr-1" />
                San Francisco, CA
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5">
                <Calendar className="w-3 h-3 mr-1" />
                5+ Years Experience
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5">
                <Briefcase className="w-3 h-3 mr-1" />
                Open to Work
              </Badge>
            </div>
          </div>

          {/* Skills & Experience */}
          <div className="space-y-8">
            {/* Skills */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Skills & Technologies</h3>
              <div className="space-y-4">
                {skills.map((skillGroup) => (
                  <div key={skillGroup.category}>
                    <p className="text-xs font-medium text-muted-foreground mb-2">{skillGroup.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((skill) => (
                        <span key={skill} className="px-3 py-1 text-sm glass-card hover:bg-glass-hover transition-colors cursor-default">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Experience</h3>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.company} className="glass-card p-4 hover:bg-glass-hover transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-foreground">{exp.role}</h4>
                      <span className="text-xs text-muted-foreground">{exp.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{exp.company}</p>
                    <p className="text-xs text-muted-foreground">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
