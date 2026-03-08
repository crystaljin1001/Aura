'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { saveAboutSection } from '../api/about-actions'
import type { AboutSectionData, SkillGroup, ExperienceEntry } from '../types'

interface EditAboutModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: AboutSectionData
}

export function EditAboutModal({ isOpen, onClose, initialData }: EditAboutModalProps) {
  const router = useRouter()
  const [isSaving, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [headline, setHeadline] = useState(initialData.headline)
  const [headlineHighlight, setHeadlineHighlight] = useState(initialData.headlineHighlight)
  const [bio, setBio] = useState<string[]>(initialData.bio.length ? initialData.bio : [''])
  const [location, setLocation] = useState(initialData.location)
  const [yearsExperience, setYearsExperience] = useState(initialData.yearsExperience)
  const [availabilityLabel, setAvailabilityLabel] = useState(initialData.availabilityLabel)
  const [skills, setSkills] = useState<SkillGroup[]>(initialData.skills)
  const [experience, setExperience] = useState<ExperienceEntry[]>(initialData.experience)

  /* ── Bio helpers ────────────────────────────────────────────────── */
  function updateBio(i: number, val: string) {
    setBio(bio.map((p, idx) => (idx === i ? val : p)))
  }
  function addBio() { setBio([...bio, '']) }
  function removeBio(i: number) { setBio(bio.filter((_, idx) => idx !== i)) }

  /* ── Skills helpers ─────────────────────────────────────────────── */
  function updateSkillCategory(i: number, val: string) {
    setSkills(skills.map((g, idx) => idx === i ? { ...g, category: val } : g))
  }
  function updateSkillItems(i: number, raw: string) {
    setSkills(skills.map((g, idx) =>
      idx === i ? { ...g, items: raw.split(',').map(s => s.trim()).filter(Boolean) } : g
    ))
  }
  function addSkillGroup() { setSkills([...skills, { category: '', items: [] }]) }
  function removeSkillGroup(i: number) { setSkills(skills.filter((_, idx) => idx !== i)) }

  /* ── Experience helpers ─────────────────────────────────────────── */
  function updateExp(i: number, field: keyof ExperienceEntry, val: string) {
    setExperience(experience.map((e, idx) => idx === i ? { ...e, [field]: val } : e))
  }
  function addExp() {
    setExperience([...experience, { role: '', company: '', period: '', description: '' }])
  }
  function removeExp(i: number) { setExperience(experience.filter((_, idx) => idx !== i)) }

  /* ── Save ───────────────────────────────────────────────────────── */
  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await saveAboutSection({
        headline,
        headlineHighlight,
        bio: bio.filter(p => p.trim()),
        location,
        yearsExperience,
        availabilityLabel,
        skills: skills.filter(g => g.category.trim()),
        experience: experience.filter(e => e.role.trim() || e.company.trim()),
      })
      if (result.success) {
        router.refresh()
        onClose()
      } else {
        setError(result.error ?? 'Failed to save')
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit About Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-2">

          {/* ── Headline ── */}
          <Section title="Headline">
            <label className="text-xs text-muted-foreground">Full headline text</label>
            <Input
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder="I build products that make a difference"
            />
            <label className="text-xs text-muted-foreground mt-2 block">
              Highlighted portion (gradient text) — must appear at the end of the headline
            </label>
            <Input
              value={headlineHighlight}
              onChange={e => setHeadlineHighlight(e.target.value)}
              placeholder="make a difference"
            />
          </Section>

          {/* ── Bio ── */}
          <Section title="Bio Paragraphs">
            <div className="space-y-2">
              {bio.map((para, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    value={para}
                    onChange={e => updateBio(i, e.target.value)}
                    rows={3}
                    className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={`Paragraph ${i + 1}`}
                  />
                  <button
                    onClick={() => removeBio(i)}
                    disabled={bio.length === 1}
                    className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addBio}
              className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-3 h-3" /> Add paragraph
            </button>
          </Section>

          {/* ── Badges ── */}
          <Section title="Info Badges">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Location</label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="San Francisco, CA" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Years Experience</label>
                <Input value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} placeholder="5+ Years Experience" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Availability</label>
                <Input value={availabilityLabel} onChange={e => setAvailabilityLabel(e.target.value)} placeholder="Open to Work" />
              </div>
            </div>
          </Section>

          {/* ── Skills ── */}
          <Section title="Skills & Technologies">
            <div className="space-y-3">
              {skills.map((group, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <GripVertical className="w-4 h-4 mt-2.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      value={group.category}
                      onChange={e => updateSkillCategory(i, e.target.value)}
                      placeholder="Category"
                      className="col-span-1"
                    />
                    <Input
                      value={group.items.join(', ')}
                      onChange={e => updateSkillItems(i, e.target.value)}
                      placeholder="React, TypeScript, Next.js"
                      className="col-span-2"
                    />
                  </div>
                  <button
                    onClick={() => removeSkillGroup(i)}
                    className="p-1 mt-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addSkillGroup}
              className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-3 h-3" /> Add category
            </button>
          </Section>

          {/* ── Experience ── */}
          <Section title="Experience">
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i} className="glass-card p-4 space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Entry {i + 1}</span>
                    <button
                      onClick={() => removeExp(i)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={exp.role}
                      onChange={e => updateExp(i, 'role', e.target.value)}
                      placeholder="Role / Title"
                    />
                    <Input
                      value={exp.company}
                      onChange={e => updateExp(i, 'company', e.target.value)}
                      placeholder="Company"
                    />
                  </div>
                  <Input
                    value={exp.period}
                    onChange={e => updateExp(i, 'period', e.target.value)}
                    placeholder="2022 - Present"
                  />
                  <textarea
                    value={exp.description}
                    onChange={e => updateExp(i, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="One punchy sentence of real impact"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={addExp}
              className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-3 h-3" /> Add experience
            </button>
          </Section>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  )
}
