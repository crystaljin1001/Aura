'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface HeroCodeSnippetProps {
  code: string
  filename: string
  language?: string
}

export function HeroCodeSnippet({ code, filename, language = 'typescript' }: HeroCodeSnippetProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-[#1E1E1E]">
        {/* Fake MacOS Window Header */}
        <div className="flex items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          {/* The Filename */}
          <p className="mx-auto text-xs text-slate-400 font-mono">
            {filename}
          </p>
        </div>

        {/* The Actual Highlighted Code */}
        <div className="p-6 text-base max-h-[70vh] overflow-y-auto">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              background: 'transparent',
              margin: 0,
              padding: 0,
              fontSize: '0.95rem',
            }}
            showLineNumbers={true}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}
