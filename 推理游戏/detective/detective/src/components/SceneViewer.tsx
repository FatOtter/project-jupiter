import { useState, useRef, useEffect } from 'react'
import { useKeyboardNav } from '../hooks/useKeyboardNav'

interface Hotspot {
  id: string
  x: number
  y: number
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
  const [cursor, setCursor] = useState({ x: 50, y: 50 })
  const [lockedTarget, setLockedTarget] = useState<Hotspot | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useKeyboardNav((action) => {
    setCursor(prev => {
      const SPEED = 2
      let newX = prev.x, newY = prev.y
      switch(action) {
        case 'UP': newY = Math.max(0, prev.y - SPEED); break
        case 'DOWN': newY = Math.min(100, prev.y + SPEED); break
        case 'LEFT': newX = Math.max(0, prev.x - SPEED); break
        case 'RIGHT': newX = Math.min(100, prev.x + SPEED); break
        case 'ENTER': if (lockedTarget) lockedTarget.onClick(); break
      }
      return { x: newX, y: newY }
    })
  }, [lockedTarget])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setCursor({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    })
  }

  const handleClick = () => { if (lockedTarget) lockedTarget.onClick() }

  useEffect(() => {
    const hit = hotspots.find(h => Math.sqrt((h.x - cursor.x)**2 + (h.y - cursor.y)**2) < 5)
    setLockedTarget(hit || null)
  }, [cursor, hotspots])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Background Image - using <img> for reliable loading */}
      <img
        src={imageSrc}
        alt="Scene"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; console.error('Image failed to load:', imageSrc) }}
      />

      {/* Scene Info */}
      <div className="absolute top-16 left-4 z-20 bg-terminal-bg/80 border border-terminal-text p-2 max-w-md backdrop-blur-sm">
        <h2 className="text-xl font-bold text-terminal-text mb-1">{`>> ${title}`}</h2>
        <p className="text-sm text-terminal-dim font-mono">{description}</p>
      </div>

      {/* Crosshair Cursor */}
      <div
        className={`absolute z-50 pointer-events-none transition-all duration-75 ${lockedTarget ? 'scale-150' : ''}`}
        style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
      >
        <div className="absolute -left-4 top-0 w-8 h-[1px] bg-terminal-text/50"></div>
        <div className="absolute left-0 -top-4 w-[1px] h-8 bg-terminal-text/50"></div>
        <div className={`absolute -left-2 -top-2 w-4 h-4 border ${lockedTarget ? 'border-terminal-text bg-terminal-text/20 animate-pulse' : 'border-terminal-dim'}`}></div>
        <div className="absolute left-4 top-4 text-[10px] font-mono text-terminal-dim">
          {cursor.x.toFixed(0)},{cursor.y.toFixed(0)}
        </div>
        {lockedTarget && (
          <div className="absolute left-6 -top-2 bg-terminal-text text-black px-2 py-1 text-xs font-bold whitespace-nowrap z-40">
            {'[ CLICK/ENTER: ' + lockedTarget.label + ' ]'}
          </div>
        )}
      </div>

      {/* Faint Hotspot Indicators */}
      {hotspots.map(spot => (
        <div key={spot.id} className="absolute z-10 w-3 h-3 border border-terminal-dim/40 rounded-full animate-ping" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}></div>
      ))}

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
    </div>
  )
}
