import { useState, useRef, useEffect } from 'react'
import { useKeyboardNav } from '../hooks/useKeyboardNav'

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
  const [cursor, setCursor] = useState({ x: 50, y: 50 })
  const [lockedTarget, setLockedTarget] = useState<Hotspot | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // 1. Keyboard Movement
  useKeyboardNav((action) => {
    setCursor(prev => {
      let newX = prev.x
      let newY = prev.y
      const SPEED = 2

      switch(action) {
        case 'UP': newY = Math.max(0, prev.y - SPEED); break;
        case 'DOWN': newY = Math.min(100, prev.y + SPEED); break;
        case 'LEFT': newX = Math.max(0, prev.x - SPEED); break;
        case 'RIGHT': newX = Math.min(100, prev.x + SPEED); break;
        case 'ENTER': 
          if (lockedTarget) lockedTarget.onClick();
          break;
      }
      return { x: newX, y: newY }
    })
  }, [lockedTarget])

  // 2. Mouse Movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setCursor({ x, y })
  }

  // 3. Mouse Click
  const handleClick = () => {
    if (lockedTarget) lockedTarget.onClick()
  }

  // Check for collision
  useEffect(() => {
    const HIT_RADIUS = 5 // 5% radius
    const hit = hotspots.find(h => {
      // Calculate distance based on aspect ratio approximation or just raw %
      // Simple raw % distance is usually fine for this aesthetic
      const dx = h.x - cursor.x
      const dy = h.y - cursor.y
      return Math.sqrt(dx*dx + dy*dy) < HIT_RADIUS
    })
    setLockedTarget(hit || null)
  }, [cursor, hotspots])

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full border-2 border-terminal-dim bg-black overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url(${imageSrc})` }}
      >
        <div className="absolute inset-0 bg-terminal-bg/30 mix-blend-multiply"></div>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-terminal-bg/80 border border-terminal-text p-2 max-w-md backdrop-blur-sm">
        <h2 className="text-xl font-bold text-terminal-text mb-1">{`>> ${title}`}</h2>
        <p className="text-sm text-terminal-dim font-mono">{description}</p>
      </div>

      {/* Cursor Crosshair */}
      <div 
        className={`absolute z-50 pointer-events-none transition-all duration-75 ease-linear
          ${lockedTarget ? 'scale-125' : 'scale-100'}
        `}
        style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
      >
        {/* Crosshair Lines */}
        <div className="absolute -left-4 top-0 w-8 h-[1px] bg-terminal-text/50"></div>
        <div className="absolute left-0 -top-4 w-[1px] h-8 bg-terminal-text/50"></div>
        
        {/* Center Box */}
        <div className={`absolute -left-2 -top-2 w-4 h-4 border 
          ${lockedTarget ? 'border-terminal-text bg-terminal-text/20 animate-pulse' : 'border-terminal-dim'}
        `}></div>

        {/* Coordinates */}
        <div className="absolute left-4 top-4 text-xs font-mono text-terminal-dim">
          X:{cursor.x.toFixed(1)} Y:{cursor.y.toFixed(1)}
        </div>

        {/* Target Lock Label */}
        {lockedTarget && (
          <div className="absolute left-6 -top-2 bg-terminal-text text-black px-2 py-1 text-xs font-bold whitespace-nowrap">
            [ ENTER TO SCAN: {lockedTarget.label} ]
          </div>
        )}
      </div>

      {/* Hidden Hotspot Markers (Optional: keep them faint so player knows where to look?) */}
      {hotspots.map((spot) => (
        <div
          key={spot.id}
          className="absolute z-10 w-2 h-2 bg-terminal-dim/30 rounded-full"
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
        ></div>
      ))}

      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
    </div>
  )
}
