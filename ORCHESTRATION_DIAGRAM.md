# Orchestration Diagram - Interactive Architecture Visualization

## Overview

A sleek, dark-mode interactive diagram visualizing Aura's backend multi-agent architecture. Built with pure SVG and Framer Motion for smooth animations and neon-blue glowing effects.

## 🎨 Visual Design

### Dark Mode Aesthetic
- **Background**: Deep charcoal (`#0a0a0a`)
- **Grid Pattern**: Subtle background grid for depth
- **Neon Glow**: Blue glowing edges on all nodes and connections
- **Animated Pulses**: Data flows visualized as moving dots along paths

### Color Coding by Tier
- 🔵 **Blue** - Input Sources (GitHub, Logic Map, Video)
- 🔷 **Cyan** - Specialist Agents (5 processing nodes)
- 🟣 **Purple** - Math Engine (Synthesis)
- 🟢 **Green** - Builder Profile (Output)

## 🏗️ Architecture

### Three-Tier System

```
[Input Tier]  →  [Processing Tier]  →  [Synthesis Tier]  →  [Output]
  (3 nodes)          (5 agents)           (1 engine)       (1 profile)
```

#### Input Tier (Left)
1. **GitHub Activity** - Commits, PRs, Issues
2. **Logic Map** - Decision Trees & Trade-offs
3. **90s Video Demo** - Product Walkthrough

#### Processing Tier (Center) - Specialist Agents
1. **Video Agent** - Analyzes demo for "Aha!" moments
   - Input: 90s Video Demo
   - Output: Product narrative quality score

2. **Logic Agent** - Validates architectural decisions
   - Input: Logic Map
   - Output: Architectural clarity score

3. **Quality Agent** - Scans for "Unhappy Path" patterns
   - Input: GitHub Diffs
   - Output: Code robustness score

4. **Flow Agent** - Measures atomic intent
   - Input: GitHub Commits
   - Output: Development intent score

5. **AI Fluency Agent** - Detects AI tool usage & agentic architecture
   - Input: GitHub Code
   - Output: AI Fluency score (Cursor, Copilot, RAG, LLM workflows)

#### Synthesis Tier (Right)
**Scoring Engine**
- Role-based weighted aggregation of all agent scores
- Weights adjust dynamically per role (Product Engineer, Backend, Startup, etc.)
- Transparent formulas (no black-box AI)
- Outputs: Spider Map, Builder Score, Grade, Persona

**Example Weights by Role:**
- Product Engineer: Video 25%, Logic 20%, Quality 20%, Flow 15%, AI 20%
- Infrastructure: Video 10%, Logic 25%, Quality 35%, Flow 15%, AI 15%
- Startup: Video 20%, Logic 15%, Quality 15%, Flow 25%, AI 25%

#### Output
**Builder Profile (Spider Map)**
- 5-dimensional visualization
- Overall score (0-100)
- Grade (A-F)
- Builder persona classification

## 📍 Location

### Route
The diagram is accessible at:
```
/architecture
```

### File Structure
```
src/features/orchestration-diagram/
├── components/
│   ├── OrchestrationDiagram.tsx      # Main SVG diagram
│   └── AgentDetailPanel.tsx          # Agent info cards
├── types/
│   └── index.ts                      # TypeScript types
├── index.ts                          # Exports
└── README.md                         # Feature documentation

src/app/architecture/
└── page.tsx                          # Architecture page
```

## 🎬 Animations

### Data Pulses
- Circular markers animate along connection paths
- Variable speed (3-5 seconds per pulse)
- Infinite loop
- Color matches the connection

### Node Interactions
- **Hover**: Scale up (1.05x)
- **Initial Load**: Fade in + scale up
- **Staggered Entrance**: Each node appears with 0.1s delay

### Path Drawing
- Connections draw from left to right
- Smooth cubic bezier curves
- 1 second animation per edge

## 🎯 Use Cases

### For Developers
- Understand Aura's backend architecture
- See data flow through the system
- Learn about each agent's responsibilities

### For Recruiters/Clients
- Quick visual overview of system complexity
- Understand the "how" behind Builder Profiles
- See the multi-agent approach

### For Documentation
- Architecture diagrams for README
- Onboarding material for contributors
- Marketing/pitch materials

## 💻 Technical Implementation

### Technology Stack
- **SVG**: Pure SVG for crisp rendering
- **Framer Motion**: Smooth animations
- **Lucide React**: Icons
- **No external diagram library**: Lightweight implementation

### Performance
- GPU-accelerated animations via Framer Motion
- Lightweight (~5KB component code)
- No heavy libraries like D3.js or React Flow
- Scales infinitely (vector-based)

### Browser Support
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (SVG viewBox scales)
- Touch-friendly on tablets

## 🚀 Accessing the Diagram

### Option 1: Direct URL
Navigate to:
```
http://localhost:3000/architecture
```

### Option 2: From Dashboard
(Can add navigation link later)

### Option 3: From Documentation
Link from README or other docs

## 📝 Page Content

The `/architecture` page includes:

1. **Hero Section**
   - Title: "Orchestration Map"
   - Subtitle explaining the purpose
   - Badge: "Backend Architecture"

2. **Interactive Diagram**
   - Full SVG visualization
   - Animated pulses
   - Hover interactions

3. **"How It Works"**
   - 3-step breakdown
   - Input Collection → Agent Processing → Math Synthesis

4. **Agent Details Panel**
   - 5 agent cards with full details
   - Responsibilities, data sources, outputs
   - Math Engine info card

5. **"Why This Architecture?"**
   - Separation of Concerns
   - Deterministic Scoring
   - Parallel Processing
   - Signal vs Noise filtering

6. **CTA Section**
   - Links to Dashboard and GitHub connection

## 🎨 Customization

### Changing Colors
Edit the `getNodeColor()` function in `OrchestrationDiagram.tsx`:
```typescript
const getNodeColor = () => {
  switch (node.tier) {
    case 'input': return '#3b82f6'    // Blue
    case 'processing': return '#06b6d4' // Cyan
    case 'synthesis': return '#8b5cf6' // Purple
    case 'output': return '#10b981'    // Green
  }
}
```

### Adjusting Layout
Modify `x` and `y` coordinates in the `nodes` array:
```typescript
{
  id: 'github',
  x: 100,  // Horizontal position
  y: 200,  // Vertical position
  // ...
}
```

### Adding New Agents
1. Add to `nodes` array
2. Add edges connecting it
3. Add details to `AgentDetailPanel.tsx`

See `README.md` in the feature directory for detailed instructions.

## 🔮 Future Enhancements

Potential additions:
- [ ] Click nodes to show detailed modal
- [ ] Export diagram as PNG/SVG
- [ ] Real-time data flow (if agents are running)
- [ ] Responsive positioning for mobile
- [ ] Dark/light mode toggle
- [ ] Agent status indicators (active/idle/error)
- [ ] Zoom and pan controls
- [ ] Fullscreen mode

## 📊 Impact

This visualization helps:
- **Clarify** the system architecture
- **Communicate** technical decisions
- **Market** the product's sophistication
- **Onboard** new developers
- **Debug** data flow issues

## 🎉 Summary

You now have a beautiful, interactive architecture diagram that:
- ✅ Lives at `/architecture` route
- ✅ Shows the complete multi-agent system
- ✅ Has smooth neon-blue animations
- ✅ Works on all devices
- ✅ Includes detailed agent documentation
- ✅ Is fully customizable
- ✅ Uses minimal dependencies

**Access it now:** http://localhost:3000/architecture
