'use client'

import { useState } from 'react'

/**
 * Product UI Component for Chapter 2 (User Journey)
 * Shows the deployed product landing page in an iframe
 */

interface ProductUIProps {
  deployedUrl?: string | null
  projectName: string
}

export function ProductUI({ deployedUrl, projectName }: ProductUIProps) {
  const [customUrl, setCustomUrl] = useState('')
  const [activeUrl, setActiveUrl] = useState(deployedUrl || '')

  const urlToShow = activeUrl || deployedUrl

  if (!urlToShow) {
    return (
      <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white">{projectName}</h2>
          <p className="text-slate-300">Live Product Demo</p>

          <div className="mt-6 space-y-3 text-left">
            <p className="text-sm text-slate-400 text-center">
              Paste your app URL to show the live product here
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && customUrl.trim()) setActiveUrl(customUrl.trim()) }}
                placeholder="https://your-app.vercel.app"
                className="flex-1 px-3 py-2 text-sm bg-slate-800 border border-slate-600 text-white placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => { if (customUrl.trim()) setActiveUrl(customUrl.trim()) }}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Load
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-slate-950 p-4 flex flex-col">
      <div className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
        {/* Browser Chrome */}
        <div className="flex items-center px-4 py-3 bg-slate-800 border-b border-slate-700 gap-3 flex-shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1">
            <input
              type="url"
              value={customUrl || urlToShow}
              onChange={e => setCustomUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setActiveUrl((e.target as HTMLInputElement).value) }}
              className="w-full px-3 py-1 bg-slate-900 rounded text-xs text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Iframe */}
        <iframe
          src={urlToShow}
          className="flex-1 w-full"
          title={`${projectName} - Live Product`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}
