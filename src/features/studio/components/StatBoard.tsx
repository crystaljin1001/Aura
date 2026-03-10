'use client'

/**
 * Stat Board Component for Chapter 4
 * Displays 3 auto-extracted metrics in a minimalist UI
 */

interface Metric {
  label: string
  value: string
  description?: string
}

interface StatBoardProps {
  metrics: Metric[]
  projectName: string
}

export function StatBoard({ metrics, projectName }: StatBoardProps) {
  // Show up to 3 metrics
  const displayMetrics = metrics.slice(0, 3)

  return (
    <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Impact Metrics</h2>
          <p className="text-slate-400">{projectName}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayMetrics.map((metric, index) => (
            <div
              key={index}
              className="relative group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
            >
              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-300"></div>

              {/* Content */}
              <div className="relative z-10 text-center space-y-3">
                {/* Value */}
                <div className="text-5xl font-bold text-white">
                  {metric.value}
                </div>

                {/* Label */}
                <div className="text-lg font-semibold text-slate-200">
                  {metric.label}
                </div>

                {/* Description */}
                {metric.description && (
                  <div className="text-sm text-slate-400 leading-relaxed">
                    {metric.description}
                  </div>
                )}
              </div>

              {/* Border Accent */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-sm text-slate-500">
          Auto-extracted from repository analysis
        </div>
      </div>
    </div>
  )
}
