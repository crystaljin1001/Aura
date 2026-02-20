/**
 * Portfolio Feature Exports
 */

// Components
export { HeroSection } from './components/HeroSection'
export { ContextBlockSection } from './components/ContextBlockSection'
export { ArchitectureDiagramSection } from './components/ArchitectureDiagramSection'
export { ProductHealthBadge } from './components/ProductHealthBadge'

// API Actions
export {
  getCaseStudyData,
  generateContextBlock,
  generateArchitectureDiagram,
} from './api/actions'

// Types
export type {
  ProductHealthScore,
  ContextBlock,
  ArchitectureDiagram,
  CaseStudyProject,
} from './types'

// Utils
export { calculateHealthScore, getHealthScoreColors } from './utils/health-score'
