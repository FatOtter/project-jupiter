import { useState, useEffect } from 'react'
import { SceneViewer } from './components/SceneViewer'
import { ManifestModal } from './components/ManifestModal'
import { CommandBar } from './components/CommandBar'
import { useKeyboardNav } from './hooks/useKeyboardNav'

// Game Narrative Phase
type StoryPhase = 'DASHBOARD' | 'SCAN_COCKPIT' | 'END_CREDITS'

// UI View Mode (Sub-views for Dashboard)
type ViewMode = 'DASHBOARD' | 'LOGS' | 'MANIFEST'

function App() {
  const [phase, setPhase] = useState<StoryPhase>('DASHBOARD')
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD')
  
  // Keyboard Handler for Global Shortcuts
  useKeyboardNav(() => {
    // Basic navigation logic if needed
  })

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // ESC always returns to Dashboard from Scan
        if (phase === 'SCAN_COCKPIT') {
          setPhase('DASHBOARD')
          setViewMode('DASHBOARD')
        }
        // Or closes Manifest/Logs if open (via ViewMode)
        if (viewMode === 'MANIFEST' || viewMode === 'LOGS') setViewMode('DASHBOARD')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, viewMode])

  // --- Renderers ---

  // 1. The Main Dashboard (Hub)
  if (phase === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-terminal-bg text-terminal-text font-mono relative overflow-hidden flex">
        <div className="scanline"></div>
        
        {/* Left Sidebar: Navigation */}
        <div className="w-1/4 border-r border-terminal-dim p-6 flex flex-col gap-6 z-10 bg-black/80 backdrop-blur">
          <h1 className="text-2xl font-bold tracking-tighter glow-text border-b border-terminal-dim pb-4">
            RUSTED WHALE<br/><span className="text-sm text-terminal-dim">INVESTIGATION UNIT</span>
          </h1>
          
          <nav className="flex flex-col gap-4">
            <button 
              className={`text-left px-4 py-3 border transition-all group ${viewMode === 'DASHBOARD' ? 'border-terminal-text bg-terminal-text/10' : 'border-terminal-dim text-terminal-dim hover:border-terminal-text'}`}
              onClick={() => { setViewMode('DASHBOARD'); setPhase('SCAN_COCKPIT'); }}
            >
              <div className="font-bold group-hover:animate-pulse">[ &gt; ] ENTER COCKPIT</div>
              <div className="text-xs text-terminal-dim mt-1">Sector: Bridge (Critical)</div>
            </button>

            <button 
              className={`text-left px-4 py-3 border transition-all ${viewMode === 'LOGS' ? 'border-terminal-text bg-terminal-text/10' : 'border-terminal-dim text-terminal-dim hover:border-terminal-text'}`}
              onClick={() => setViewMode('LOGS')}
            >
              <div>[ L ] DATA LOGS</div>
            </button>

            <button 
              className={`text-left px-4 py-3 border transition-all ${viewMode === 'MANIFEST' ? 'border-terminal-text bg-terminal-text/10' : 'border-terminal-dim text-terminal-dim hover:border-terminal-text'}`}
              onClick={() => setViewMode('MANIFEST')}
            >
              <div>[ M ] CREW MANIFEST</div>
            </button>
          </nav>

          <div className="mt-auto text-xs text-terminal-dim">
            STATUS: DRIFTING<br/>
            ORBIT: GANYMEDE<br/>
            TIME: 03:42:12
          </div>
        </div>

        {/* Right Content: Dashboard View */}
        <div className="flex-1 bg-black relative">
          {viewMode === 'DASHBOARD' && (
            <div className="h-full flex flex-col justify-center items-center text-terminal-dim opacity-50">
              <div className="w-16 h-16 border-2 border-terminal-dim rounded-full flex items-center justify-center animate-pulse mb-4">
                !
              </div>
              <p>SYSTEM READY</p>
              <p className="text-xs mt-2">Select a module from the left panel.</p>
            </div>
          )}

          {viewMode === 'LOGS' && (
            <div className="h-full p-8 overflow-y-auto font-mono z-10 relative">
              <h2 className="text-xl border-b border-terminal-dim pb-2 mb-4">RECOVERED DATA</h2>
              <div className="space-y-4">
                <p><span className="text-terminal-text">03:40:00</span> - Connection established with ship core.</p>
                <p><span className="text-terminal-text">03:41:15</span> - Life support systems: CRITICAL.</p>
                <p><span className="text-terminal-text">03:42:00</span> - ERROR: Neural Link "Iron Uncle" unresponsive.</p>
                <p><span className="text-terminal-text">03:42:05</span> - WARNING: Unauthorized bio-modification detected in Med-Bay.</p>
              </div>
            </div>
          )}

          {viewMode === 'MANIFEST' && (
             <ManifestModal isOpen={true} onClose={() => setViewMode('DASHBOARD')} />
          )}
        </div>
      </div>
    )
  }

  // 2. The Scanner View (Visual Gameplay)
  if (phase === 'SCAN_COCKPIT') {
    return (
      <div className="h-screen w-screen bg-terminal-bg relative font-mono text-terminal-text overflow-hidden">
        <div className="scanline"></div>
        
        {/* Back Button / ESC Hint */}
        <div className="absolute top-4 left-4 z-50 pointer-events-auto">
          <button 
            onClick={() => setPhase('DASHBOARD')}
            className="bg-black/80 border border-terminal-text px-4 py-2 hover:bg-terminal-text hover:text-black transition-colors backdrop-blur"
          >
            {`[ < ] RETURN TO DASHBOARD (ESC)`}
          </button>
        </div>

        <SceneViewer 
          imageSrc="/assets/heartbeat/scene_cockpit_aftermath.png"
          title="SECTOR: COCKPIT [AFTERMATH]"
          description="Primary investigation zone. Crew unresponsive. Bio-signs critical."
          hotspots={[
            { 
              id: 'qiang', x: 50, y: 55, label: 'PILOT (QIANG)', 
              onClick: () => alert("SCAN RESULT: Subject unconscious. Jaw fractured. Pulse weak but stable. Evidence of extreme physical exertion.") 
            },
            { 
              id: 'iron_uncle', x: 75, y: 50, label: 'CAPTAIN (IRON UNCLE)', 
              onClick: () => alert("SCAN RESULT: Core Offline. 'Logic Plague' protocols active. System frozen to prevent corruption.") 
            },
            { 
              id: 'viper', x: 25, y: 60, label: 'NAVIGATOR (VIPER)', 
              onClick: () => alert("SCAN RESULT: Android unit in Safe Mode. No external damage.") 
            },
            { 
              id: 'ava', x: 50, y: 35, label: 'SHIP AI (AVA)', 
              onClick: () => alert("LOG ACCESS: 'Gravity Well Escaped'. 'Manual Override Detected'. 'Pilot Qiang status: CRITICAL'.") 
            }
          ]}
        />
      </div>
    )
  }

  return <div>ERROR: UNKNOWN STATE</div>
}

export default App
