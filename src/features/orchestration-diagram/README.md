# Orchestration Diagram Feature

An interactive SVG-based visualization of Aura's backend architecture showing how data flows through the multi-agent system.

## Components

### OrchestrationDiagram
Main interactive diagram showing the three-tier architecture:
- **Input Tier** (Left): GitHub Activity, Logic Map, 90s Video Demo
- **Processing Tier** (Center): 5 Specialist Agents
- **Synthesis Tier** (Right): Math Engine → Builder Profile

**Features:**
- Animated data pulses flowing through connections
- Neon-blue glowing edges
- Dark mode optimized (charcoal background)
- Hover effects on nodes
- Color-coded by tier
- SVG-based for crisp rendering at any size

### AgentDetailPanel
Grid of cards explaining each specialist agent:
- Icon and color-coded design
- Responsibilities breakdown
- Data source indication
- Output description

**Agents covered:**
1. Video Agent - Analyzes demo for business impact
2. Logic Agent - Validates architectural decisions
3. Quality Agent - Scans for error handling patterns
4. Flow Agent - Measures commit atomicity
5. Scale Agent - Detects infrastructure patterns

## Usage

```tsx
import { OrchestrationDiagram, AgentDetailPanel } from '@/features/orchestration-diagram'

function ArchitecturePage() {
  return (
    <div>
      <OrchestrationDiagram />
      <AgentDetailPanel />
    </div>
  )
}
```

## Styling

The diagram uses:
- **Dark background**: `#0a0a0a`
- **Node colors**: Blue (input), Cyan (agents), Purple (synthesis), Green (output)
- **Neon glow**: SVG filter for glowing edges
- **Animations**: Framer Motion for smooth transitions
- **Pulses**: Circular markers animating along paths

## Page Route

The diagram is displayed at `/architecture` route.

## Architecture Philosophy

The visualization demonstrates Aura's core architectural principles:

1. **Separation of Concerns**: Each agent has one job
2. **Deterministic Scoring**: No black-box AI in final scores
3. **Parallel Processing**: Agents run independently
4. **Signal vs Noise**: Active filtering of boilerplate

## Customization

### Adding a New Agent

1. Add node to `nodes` array in `OrchestrationDiagram.tsx`:
```typescript
{
  id: 'new-agent',
  label: 'New Agent',
  sublabel: 'Input: Source',
  x: 400,
  y: 850, // Position it
  icon: YourIcon,
  tier: 'processing',
}
```

2. Add edges connecting it:
```typescript
{ from: 'input-id', to: 'new-agent', color: '#3b82f6' },
{ from: 'new-agent', to: 'math-engine', color: '#06b6d4' },
```

3. Add details to `AgentDetailPanel.tsx`:
```typescript
{
  icon: YourIcon,
  name: 'New Agent',
  color: 'text-color-400',
  bgColor: 'bg-color-500/10',
  borderColor: 'border-color-500/30',
  description: 'What it does',
  responsibilities: ['Task 1', 'Task 2'],
  dataSource: 'Data Source',
  output: 'Output metric',
}
```

### Adjusting Layout

- **Spacing**: Modify x/y coordinates in `nodes` array
- **Node size**: Change width/height in `rect` elements
- **Animation speed**: Adjust `dur` in `animateMotion`
- **Colors**: Update color constants in `getNodeColor()` function

## Dependencies

- `framer-motion` - Animation library (already in package.json)
- `lucide-react` - Icons (already in package.json)
- No external diagram library needed - pure SVG!

## Performance

- SVG is performant and scales infinitely
- Framer Motion provides GPU-accelerated animations
- No heavy libraries like D3.js or React Flow needed
- Total bundle size impact: ~5KB (just the component code)

## Future Enhancements

- [ ] Add click interactions to show agent details in modal
- [ ] Export diagram as PNG/SVG
- [ ] Real-time data flow visualization
- [ ] Dynamic node positioning based on screen size
- [ ] Dark/light mode toggle
- [ ] Agent status indicators (active/idle)
