import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Briefcase, Building2 } from 'lucide-react';
import type { AboutSectionData } from '@/features/user-profile/types';

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_DATA: AboutSectionData = {
  headline: 'I build products that',
  headlineHighlight: 'make a difference',
  bio: [
    'My journey started with a simple belief: great products come from understanding real problems.',
    'I thrive in the 0-to-1 phase — taking an idea, validating it with users, and building something people love.',
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

/* ------------------------------------------------------------------ */
/*  Category color map                                                 */
/* ------------------------------------------------------------------ */

const CATEGORY_COLORS: Record<string, { dot: string; label: string; badge: string }> = {
  Frontend:    { dot: 'bg-blue-400',    label: 'text-blue-400',    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-300' },
  Backend:     { dot: 'bg-emerald-400', label: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' },
  Database:    { dot: 'bg-amber-400',   label: 'text-amber-400',   badge: 'bg-amber-500/10 border-amber-500/20 text-amber-300' },
  DevOps:      { dot: 'bg-purple-400',  label: 'text-purple-400',  badge: 'bg-purple-500/10 border-purple-500/20 text-purple-300' },
  Mobile:      { dot: 'bg-pink-400',    label: 'text-pink-400',    badge: 'bg-pink-500/10 border-pink-500/20 text-pink-300' },
  'AI / ML':   { dot: 'bg-cyan-400',    label: 'text-cyan-400',    badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' },
  Tools:       { dot: 'bg-orange-400',  label: 'text-orange-400',  badge: 'bg-orange-500/10 border-orange-500/20 text-orange-300' },
};

function getCategoryStyle(category: string) {
  return (
    CATEGORY_COLORS[category] ?? {
      dot: 'bg-blue-400',
      label: 'text-muted-foreground',
      badge: 'bg-secondary/50 border-border text-foreground',
    }
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface AboutSectionProps {
  data?: AboutSectionData | null;
  isOwner?: boolean;
  generateButton?: React.ReactNode;
}

export function AboutSection({ data, isOwner, generateButton }: AboutSectionProps) {
  const d = data ?? DEFAULT_DATA;

  const headlineBase = d.headline.endsWith(d.headlineHighlight)
    ? d.headline.slice(0, -d.headlineHighlight.length)
    : d.headline + ' ';

  return (
    <section id="about" className="py-28 px-4 relative">
      {/* Subtle section separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 items-start">

          {/* ── Left: Story ── */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
              About Me
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              {headlineBase}
              {d.headlineHighlight && (
                <span className="gradient-text">{d.headlineHighlight}</span>
              )}
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed text-[15px]">
              {d.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Meta badges */}
            {(d.location || d.yearsExperience || d.availabilityLabel) && (
              <div className="flex flex-wrap gap-2 mt-8">
                {d.location && (
                  <Badge variant="secondary" className="px-3 py-1.5 bg-secondary/60">
                    <MapPin className="w-3 h-3 mr-1.5" />
                    {d.location}
                  </Badge>
                )}
                {d.yearsExperience && (
                  <Badge variant="secondary" className="px-3 py-1.5 bg-secondary/60">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    {d.yearsExperience}
                  </Badge>
                )}
                {d.availabilityLabel && (
                  <Badge variant="secondary" className="px-3 py-1.5 bg-secondary/60">
                    <Briefcase className="w-3 h-3 mr-1.5" />
                    {d.availabilityLabel}
                  </Badge>
                )}
              </div>
            )}

            {/* Generate / Edit button — owner only */}
            {isOwner && generateButton && (
              <div className="mt-8">{generateButton}</div>
            )}
          </div>

          {/* ── Right: Skills & Experience ── */}
          <div className="space-y-10">

            {/* Skills */}
            {d.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6">
                  Skills & Technologies
                </h3>
                <div className="space-y-5">
                  {d.skills.map((skillGroup) => {
                    const style = getCategoryStyle(skillGroup.category);
                    return (
                      <div key={skillGroup.category}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          <p className={`text-xs font-semibold uppercase tracking-wider ${style.label}`}>
                            {skillGroup.category}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {skillGroup.items.map((skill) => (
                            <span
                              key={skill}
                              className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors cursor-default ${style.badge}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Experience */}
            <div>
              <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6">
                Experience
              </h3>
              {d.experience.length > 0 ? (
                <div className="space-y-3">
                  {d.experience.map((exp) => (
                    <div
                      key={`${exp.company}-${exp.role}`}
                      className="relative pl-4 border-l-2 border-border hover:border-blue-500/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-0.5">
                        <h4 className="font-semibold text-foreground text-sm">{exp.role}</h4>
                        <span className="text-xs text-muted-foreground shrink-0 ml-3">{exp.period}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Building2 className="w-3 h-3 text-muted-foreground/60" />
                        <p className="text-xs text-muted-foreground font-medium">{exp.company}</p>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-muted-foreground/80 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : isOwner ? (
                <div className="border border-dashed border-border rounded-xl p-5 text-center">
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
