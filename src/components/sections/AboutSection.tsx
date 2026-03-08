import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Briefcase } from 'lucide-react';
import type { AboutSectionData } from '@/features/user-profile/types';

/* ------------------------------------------------------------------ */
/*  Defaults (shown until AI generates real content)                   */
/* ------------------------------------------------------------------ */

const DEFAULT_DATA: AboutSectionData = {
  headline: 'I build products that',
  headlineHighlight: 'make a difference',
  bio: [
    "My journey started with a simple belief: great products come from understanding real problems.",
    "I thrive in the 0-to-1 phase — taking an idea, validating it with users, and building something people love.",
  ],
  location: '',
  yearsExperience: '',
  availabilityLabel: '',
  skills: [
    { category: 'Frontend', items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'] },
    { category: 'Backend', items: ['Node.js', 'PostgreSQL', 'Supabase'] },
  ],
  experience: [],
};

interface AboutSectionProps {
  data?: AboutSectionData | null;
  isOwner?: boolean;
  generateButton?: React.ReactNode;
}

export function AboutSection({ data, isOwner, generateButton }: AboutSectionProps) {
  const d = data ?? DEFAULT_DATA;

  // Split headline into base + highlight
  const headlineBase = d.headline.endsWith(d.headlineHighlight)
    ? d.headline.slice(0, -d.headlineHighlight.length)
    : d.headline + ' ';

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
              {headlineBase}
              {d.headlineHighlight && (
                <span className="gradient-text">{d.headlineHighlight}</span>
              )}
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {d.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              {d.location && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  <MapPin className="w-3 h-3 mr-1" />
                  {d.location}
                </Badge>
              )}
              {d.yearsExperience && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  <Calendar className="w-3 h-3 mr-1" />
                  {d.yearsExperience}
                </Badge>
              )}
              {d.availabilityLabel && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {d.availabilityLabel}
                </Badge>
              )}
            </div>

            {/* Generate button — visible to owner only */}
            {isOwner && generateButton && (
              <div className="mt-6">{generateButton}</div>
            )}
          </div>

          {/* Skills & Experience */}
          <div className="space-y-8">
            {/* Skills */}
            {d.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Skills & Technologies</h3>
                <div className="space-y-4">
                  {d.skills.map((skillGroup) => (
                    <div key={skillGroup.category}>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {skillGroup.category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.items.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 text-sm glass-card hover:bg-glass-hover transition-colors cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Experience</h3>
              {d.experience.length > 0 ? (
                <div className="space-y-4">
                  {d.experience.map((exp) => (
                    <div
                      key={`${exp.company}-${exp.role}`}
                      className="glass-card p-4 hover:bg-glass-hover transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-foreground">{exp.role}</h4>
                        <span className="text-xs text-muted-foreground">{exp.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{exp.company}</p>
                      <p className="text-xs text-muted-foreground">{exp.description}</p>
                    </div>
                  ))}
                </div>
              ) : isOwner ? (
                <div className="glass-card p-6 text-center border-dashed">
                  <p className="text-sm text-muted-foreground">
                    Upload your CV in Settings, then click{' '}
                    <span className="text-blue-400">&quot;Generate with AI&quot;</span> to populate your experience.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
