'use client';

/**
 * Compact Mermaid Diagram Preview Component
 * For use in modals and compact spaces
 */

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MermaidPreviewProps {
  mermaidCode: string;
  className?: string;
}

export function MermaidPreview({ mermaidCode, className = '' }: MermaidPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7); // Start smaller for modal view
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Initialize Mermaid with dark theme
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#1e40af',
        lineColor: '#60a5fa',
        secondaryColor: '#10b981',
        tertiaryColor: '#8b5cf6',
        background: '#0f172a',
        mainBkg: '#1e293b',
        secondBkg: '#334155',
        tertiaryBkg: '#475569',
        darkMode: true,
      },
      fontFamily: 'ui-monospace, monospace',
    });

    // Render diagram
    if (containerRef.current) {
      const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
      containerRef.current.innerHTML = `<div class="mermaid" id="${id}">${mermaidCode}</div>`;

      mermaid.contentLoaded();
    }
  }, [mermaidCode]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.3));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-900/50 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2 bg-gray-800/30">
        <span className="text-xs text-gray-400">Architecture Diagram</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            disabled={scale <= 0.3}
            className="h-7 w-7 p-0"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-xs text-gray-400 min-w-[45px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            disabled={scale >= 1.5}
            className="h-7 w-7 p-0"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <div className="h-4 w-px bg-gray-700" />
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-7 w-7 p-0"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Diagram Container */}
      <div
        ref={containerRef}
        className="overflow-auto p-6 bg-slate-900"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          minHeight: '300px',
          maxHeight: '500px',
        }}
      />
    </div>
  );
}
