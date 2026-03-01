# Hiring Dashboard Feature

A futuristic, dark-mode mockup showcasing an AI-powered candidate screening dashboard.

## Overview

This feature visualizes how hiring managers would interact with Aura's Builder Profiles in a real-world recruiting scenario. It demonstrates the "end game" of the platform - turning builder profiles into hiring decisions.

## Components

### HiringDashboardMockup

Main component that renders the complete hiring dashboard interface.

**Layout:**
- **Left Sidebar (400px)**: Top 5 AI-ranked candidates with:
  - Rank badge with color
  - Candidate name and title
  - Mini spider map visualization
  - AI-generated ranking explanation (why #1, why #2, etc.)
  - GitHub and portfolio links

- **Main Content Area**:
  - Selected candidate header with avatar and status badge
  - Two side-by-side video players:
    - Product Demo (paused state with UI mockup)
    - Architecture Walkthrough (paused state with diagram)
  - Prominent green "Schedule Intro Call" button
  - 5-dimension stats summary cards

## Features

### Mini Spider Map
- 80x80px pentagon visualization
- 5 dimensions: Product & Business Sense, Communication & Impact, Quality & Scalability, Velocity & Focus, AI Fluency
- Color-coded per candidate
- Animated entrance

### AI Ranking Explanations
Each candidate has a one-sentence AI summary explaining their ranking:
- **#1**: Highlights why they're the perfect fit
- **#2**: Explains why they're strong but slightly weaker in one area
- **#3-5**: Clear reasoning for each position

### Video Player Mockups
Realistic paused video frames showing:
- Product Demo: UI wireframes and interface elements
- Architecture: SVG-based system diagram

### Interactive Elements
- Hover effects on candidate cards
- Animated play buttons on videos
- Smooth transitions using Framer Motion
- Clickable GitHub/portfolio links (with `stopPropagation` to prevent card selection)

## Mock Data

5 fictional candidates with diverse profiles:

1. **Alex Chen** (9.2 avg) - Full-stack, perfect fit
2. **Jordan Martinez** (8.5 avg) - Product engineer, strong demo
3. **Taylor Kim** (8.4 avg) - Backend, high quality/logic
4. **Sam Rodriguez** (8.3 avg) - Frontend specialist
5. **Casey Morgan** (7.9 avg) - DevOps, infrastructure expert

Each has unique spider map values and color scheme.

## Page Route

Located at `/hiring-demo`

## Design Philosophy

### Dark Mode Optimized
- Background: `#0a0a0a` (deep black)
- Cards: `rgba(255,255,255,0.02)` (subtle white)
- Borders: `rgba(255,255,255,0.1)` (faint edges)
- Neon accents for candidate colors

### Futuristic Aesthetic
- Glassmorphism effects
- Gradient overlays
- Glow effects on status badges
- Smooth animations

### Information Hierarchy
1. Rank and name (most prominent)
2. Spider map visual
3. AI explanation
4. Links (least prominent)

## Usage

```tsx
import { HiringDashboardMockup } from '@/features/hiring-dashboard'

function DemoPage() {
  return <HiringDashboardMockup />
}
```

## Customization

### Adding More Candidates

Edit `mockCandidates` array in `HiringDashboardMockup.tsx`:

```typescript
{
  id: '6',
  name: 'New Candidate',
  rank: 6,
  title: 'Role',
  avatarColor: '#hex-color',
  aiRanking: 'One sentence explanation...',
  spiderMap: [
    { label: 'Video', value: 8.0 },
    // ... 5 dimensions
  ],
  githubUrl: 'github.com/username',
  portfolioUrl: 'website.com',
}
```

### Changing Colors

Candidate avatar colors affect:
- Avatar background
- Border highlights (on selection)
- Spider map visualization
- Stats display

### Modifying Video Mockups

Edit the mockup content in the video player sections:
- Product Demo: UI wireframe elements
- Architecture: SVG diagram nodes and connections

## Performance

- Lightweight: No video files loaded (mockups only)
- Smooth animations via Framer Motion
- Efficient SVG rendering for spider maps
- No external dependencies beyond existing packages

## Future Enhancements

- [ ] Interactive spider map (click dimension for details)
- [ ] Real video playback
- [ ] Filter/search candidates
- [ ] Custom ranking criteria
- [ ] Export candidate reports
- [ ] Calendar integration for scheduling
- [ ] Slack/email notifications

## Benefits for Aura

This mockup demonstrates:
- **Product value** for hiring managers
- **End-to-end use case** of builder profiles
- **Visual differentiation** from LinkedIn/resume screening
- **AI explainability** (not a black box)
- **Speed** (top 5, not top 500)

## Marketing Use

Perfect for:
- Landing page hero section
- Product demo videos
- Investor pitch decks
- Blog posts about AI hiring
- Case studies

## Technical Notes

- Uses `motion.div` for animations
- SVG for spider maps (scalable, performant)
- Gradient backgrounds for video mockups
- Responsive grid layout
- Overflow handling for long names/text

## Accessibility

- Semantic HTML structure
- Color contrast ratios meet WCAG AA
- Keyboard navigable (candidate cards)
- Screen reader friendly labels
- Focus indicators on interactive elements
