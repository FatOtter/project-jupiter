import { useState } from 'react'

interface Hotspot {
  id: string
  x: number // percentage 0-100
  y: number // percentage 0-100
  label: string
  onClick: () => void
}

interface SceneProps {
  imageSrc: string
  title: string
  description: string
  hotspots: Hotspot[]
}

export function SceneViewer({ imageSrc, title, description, hotspots }: SceneProps) {
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null)

  return (
    <div className="relative w-full h-full border-2 border-terminal-dim bg-black overflow-hidden group">
      {/* Background Image with CRT Filter overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundImage: `url(${imageSrc})` }}
      >
        <div className="absolute inset-0 bg-terminal-bg/30 mix-blend-multiply"></div>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-terminal-bg/80 border border-terminal-text p-2 max-w-md backdrop-blur-sm">
        <h2 className="text-xl font-bold text-terminal-text mb-1">{`>> ${title}`}</h2>
        <p className="text-sm text-terminal-dim font-mono">{description}</p>
      </div>

      {/* Hotspots */}
      {hotspots.map((spot) => (
        <button
          key={spot.id}
          className="absolute z-30 w-8 h-8 -ml-4 -mt-4 flex items-center justify-center group/spot focus:outline-none"
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          onClick={spot.onClick}
          onMouseEnter={() => setHoveredSpot(spot.id)}
          onMouseLeave={() => setHoveredSpot(null)}
        >
          {/* Target Reticle Animation */}
          <div className="absolute inset-0 border border-terminal-alert rounded-full animate-ping opacity-75"></div>
          <div className="relative w-4 h-4 bg-terminal-alert/20 border border-terminal-alert rounded-full hover:bg-terminal-alert/50 transition-colors"></div>
          
          {/* Tooltip */}
          {hoveredSpot === spot.id && (
            <div className="absolute left-6 top-0 bg-black border border-terminal-text px-2 py-1 text-xs text-terminal-text whitespace-nowrap z-40">
              {`[ ANALYZE: ${spot.label} ]`}
            </div>
          )}
        </button>
      ))}

      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
    </div>
  )
}
