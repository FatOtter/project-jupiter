import { useState, useEffect } from 'react'
import { SceneViewer } from './components/SceneViewer'

// Simple state machine for game phases
type GamePhase = 'BOOT' | 'SCENE_1_DESCENT' | 'SCENE_2_COCKPIT'

function App() {
  const [phase, setPhase] = useState<GamePhase>('BOOT')
  const [bootLogs, setBootLogs] = useState<string[]>([])
  const [logIndex, setLogIndex] = useState(0)

  // Boot Sequence Logic
  const fullLogs = [
    "INITIALIZING JUPITER NET...",
    "CONNECTING TO RUSTED WHALE [ID: RW-47]...",
    "handshake: ACK received...",
    "WARNING: CORRUPTED MEMORY SECTORS DETECTED",
    "LOADING 'MEMORY DIVE' PROTOCOL v0.9...",
    "...",
    "ACCESS GRANTED."
  ]

  useEffect(() => {
    if (phase !== 'BOOT') return
    
    if (logIndex < fullLogs.length) {
      const timeout = setTimeout(() => {
        setBootLogs(prev => [...prev, fullLogs[logIndex]])
        setLogIndex(prev => prev + 1)
      }, Math.random() * 500 + 100)
      return () => clearTimeout(timeout)
    }
  }, [logIndex, phase])

  // --- Renderers ---

  if (phase === 'BOOT') {
    return (
      <div className="min-h-screen bg-terminal-bg text-terminal-text p-8 font-mono relative overflow-hidden flex flex-col justify-center items-center">
        <div className="scanline"></div>
        <div className="max-w-2xl w-full">
          <header className="mb-8 border-b border-terminal-dim pb-4">
            <h1 className="text-4xl font-bold tracking-tighter glow-text">PROJECT JUPITER</h1>
            <p className="text-sm text-terminal-dim mt-2">CASE FILE: THE RUSTED WHALE INCIDENT</p>
          </header>
          
          <div className="space-y-2 h-64 overflow-y-auto font-mono text-sm">
            {bootLogs.map((log, i) => (
              <div key={i} className={`${log.includes("WARNING") ? "text-terminal-alert" : ""}`}>
                <span className="opacity-50 mr-2">{`>`}</span>
                {log}
              </div>
            ))}
            {logIndex < fullLogs.length && (
              <div className="animate-blink inline-block w-2 h-4 bg-terminal-text align-middle ml-1"></div>
            )}
          </div>

          {logIndex >= fullLogs.length && (
            <div className="mt-8 flex justify-center animate-pulse">
              <button 
                className="px-8 py-3 border border-terminal-text bg-terminal-bg text-terminal-text hover:bg-terminal-text hover:text-black transition-all uppercase tracking-widest font-bold"
                onClick={() => setPhase('SCENE_1_DESCENT')}
              >
                [ ENTER MEMORY DIVE ]
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'SCENE_1_DESCENT') {
    return (
      <div className="h-screen w-screen bg-terminal-bg relative">
        <div className="scanline"></div>
        <SceneViewer 
          imageSrc="/assets/heartbeat/rusted_whale_design.png"
          title="MEMORY FRAGMENT: THE DESCENT"
          description="T-Minus 2 minutes to critical depth. The Rusted Whale enters the Great Red Spot's turbulence layer."
          hotspots={[
            {
              id: 'engines',
              x: 20, y: 65,
              label: 'PLASMA THRUSTERS',
              onClick: () => alert("LOG: Thrusters firing at 110%. Cooling systems failing.")
            },
            {
              id: 'storm',
              x: 80, y: 40,
              label: 'JUPITER STORM',
              onClick: () => alert("LOG: Gravity shear detected. Structural integrity dropping.")
            },
            {
              id: 'cockpit',
              x: 50, y: 50,
              label: 'COCKPIT ACCESS',
              onClick: () => {
                const confirmed = confirm("Enter the Cockpit Memory?");
                if (confirmed) setPhase('SCENE_2_COCKPIT')
              }
            }
          ]}
        />
        {/* Back to root debug */}
        <button className="absolute bottom-4 right-4 text-xs text-terminal-dim hover:text-white z-50" onClick={() => setPhase('BOOT')}>[ ABORT DIVE ]</button>
      </div>
    )
  }

  if (phase === 'SCENE_2_COCKPIT') {
    return (
      <div className="h-screen w-screen bg-terminal-bg relative">
        <div className="scanline"></div>
        <SceneViewer 
          imageSrc="/assets/heartbeat/ch2_struggle.png"
          title="MEMORY FRAGMENT: THE STRUGGLE"
          description="Inside the cockpit. G-Force: 9G. Silicon crew unresponsive due to logic plague."
          hotspots={[
            {
              id: 'qiang',
              x: 60, y: 60,
              label: 'PILOT QIANG',
              onClick: () => alert("LOG: Bio-signs critical. Bones fracturing. He is trying to reach the manual override.")
            },
            {
              id: 'lever',
              x: 30, y: 70,
              label: 'EMERGENCY LEVER',
              onClick: () => alert("LOG: Manual Ballast Release. Requires 500N force to activate.")
            }
          ]}
        />
        <button className="absolute bottom-4 right-4 text-xs text-terminal-dim hover:text-white z-50" onClick={() => setPhase('BOOT')}>[ ABORT DIVE ]</button>
      </div>
    )
  }

  return <div>ERROR: UNKNOWN STATE</div>
}

export default App
