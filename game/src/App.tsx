import { useState, useEffect } from 'react'
import { SceneViewer } from './components/SceneViewer'

// Game State Machine
type GamePhase = 'BOOT' | 'SCENE_1_DESCENT' | 'SCENE_2_COCKPIT' | 'SCENE_3_BITE' | 'SCENE_4_CROSSOVER' | 'END_CREDITS'

function App() {
  const [phase, setPhase] = useState<GamePhase>('BOOT')
  const [bootLogs, setBootLogs] = useState<string[]>([])
  const [logIndex, setLogIndex] = useState(0)

  // Boot Sequence Logic
  const fullLogs = [
    "INITIALIZING JUPITER NET...",
    "CONNECTING TO RUSTED WHALE [ID: RW-47]...",
    "handshake: ACK received...",
    "WARNING: DATA CORRUPTION DETECTED IN BLACK BOX",
    "RECONSTRUCTING TIMELINE...",
    "...",
    "ACCESS GRANTED."
  ]

  useEffect(() => {
    if (phase !== 'BOOT') return
    
    if (logIndex < fullLogs.length) {
      const timeout = setTimeout(() => {
        setBootLogs(prev => [...prev, fullLogs[logIndex]])
        setLogIndex(prev => prev + 1)
      }, Math.random() * 300 + 50)
      return () => clearTimeout(timeout)
    }
  }, [logIndex, phase])

  // --- Helper: Simple Scene Transition ---
  const goto = (p: GamePhase) => setPhase(p)

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
                onClick={() => goto('SCENE_1_DESCENT')}
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
          title="MEMORY 01: THE DESCENT"
          description="T-Minus 2 min. The Whale enters the Great Red Spot. Structure compromised."
          hotspots={[
            {
              id: 'engines', x: 20, y: 65, label: 'PLASMA THRUSTERS',
              onClick: () => alert("LOG: Thrusters at 110%. Vibration exceeding hull tolerance.")
            },
            {
              id: 'hull', x: 50, y: 50, label: 'MID-SHIP',
              onClick: () => {
                if(confirm("LOG: Bio-signs detected in cockpit. Proceed?")) goto('SCENE_2_COCKPIT')
              }
            }
          ]}
        />
        <div className="absolute bottom-4 left-4 text-terminal-dim text-xs">
          HINT: Look for the cockpit.
        </div>
      </div>
    )
  }

  if (phase === 'SCENE_2_COCKPIT') {
    return (
      <div className="h-screen w-screen bg-terminal-bg relative">
        <div className="scanline"></div>
        <SceneViewer 
          imageSrc="/assets/heartbeat/ch2_struggle.png"
          title="MEMORY 02: THE STRUGGLE"
          description="Cockpit interior. G-Force: 9G. Crew status: UNKNOWN."
          hotspots={[
            {
              id: 'qiang', x: 60, y: 60, label: 'PILOT QIANG',
              onClick: () => alert("DATA: Heart rate 180. Cortisol critical. He is screaming something.")
            },
            {
              id: 'iron_uncle', x: 80, y: 50, label: 'CAPTAIN (CYBORG)',
              onClick: () => alert("DATA: System Frozen. Logic Plague detected. Why is he not moving?")
            },
            {
              id: 'lever', x: 30, y: 70, label: 'MANUAL OVERRIDE',
              onClick: () => {
                if(confirm("ZOOM IN on the lever interaction?")) goto('SCENE_3_BITE')
              }
            }
          ]}
        />
      </div>
    )
  }

  if (phase === 'SCENE_3_BITE') {
    return (
      <div className="h-screen w-screen bg-terminal-bg relative">
        <div className="scanline"></div>
        <SceneViewer 
          imageSrc="/assets/heartbeat/ch3_bite_v2.png"
          title="MEMORY 03: THE IMPACT"
          description="CRITICAL MOMENT. Pilot is engaging the mechanism manually."
          hotspots={[
            {
              id: 'mouth', x: 50, y: 50, label: 'POINT OF CONTACT',
              onClick: () => alert("ANALYSIS: Jaw dislocated. Teeth fractured. 600N of force applied.")
            },
            {
              id: 'wrench', x: 80, y: 80, label: 'LOOSE OBJECT',
              onClick: () => alert("EVIDENCE: Heavy wrench found on floor. Covered in blood. Did it fall? Or was it used as a weapon?") // Red Herring
            },
            {
              id: 'ai_log', x: 10, y: 20, label: 'AI TERMINAL',
              onClick: () => alert("LOG: 'Life Support disabled by ADMIN: IRON_UNCLE'. Timestamp matches jaw fracture.") // Red Herring
            },
            {
              id: 'next', x: 90, y: 50, label: 'NEXT MEMORY',
              onClick: () => goto('SCENE_4_CROSSOVER')
            }
          ]}
        />
      </div>
    )
  }

  if (phase === 'SCENE_4_CROSSOVER') {
    return (
      <div className="h-screen w-screen bg-terminal-bg relative">
        <div className="scanline"></div>
        <SceneViewer 
          imageSrc="/assets/heartbeat/ch4_crossover.png"
          title="MEMORY 04: THE AFTERMATH"
          description="Med-Bay. 2 Hours after impact. A new signal appears."
          hotspots={[
            {
              id: 'hand', x: 45, y: 40, label: 'CAPTAIN\'S HAND',
              onClick: () => alert("OBSERVATION: Heavy pressure applied to the new unit's chest. Is this a greeting? Or restraint?") // Ambiguity
            },
            {
              id: 'body', x: 70, y: 60, label: 'BIOLOGICAL REMAINS',
              onClick: () => alert("AUTOPSY: C3/C4 Vertebrae crushed. Cause: Mechanical stress... or blunt force?")
            },
            {
              id: 'new_unit', x: 30, y: 60, label: 'NEW CYBORG UNIT',
              onClick: () => {
                alert("SYSTEM: New ID registered. 'QIANG-02'. Debt Status: ACTIVE.")
                if(confirm("End Investigation?")) goto('END_CREDITS')
              }
            }
          ]}
        />
      </div>
    )
  }

  if (phase === 'END_CREDITS') {
    return (
      <div className="min-h-screen bg-terminal-bg text-terminal-text flex flex-col justify-center items-center text-center p-8">
        <div className="scanline"></div>
        <h1 className="text-3xl mb-4 animate-pulse">INVESTIGATION COMPLETE</h1>
        <p className="max-w-md mb-8 text-terminal-dim">
          The data has been logged. The truth remains... interpretive.
          <br/><br/>
          Did Qiang sacrifice himself?
          <br/>
          Or was he harvested for parts?
        </p>
        <button 
          className="text-terminal-text border border-terminal-text px-4 py-2 hover:bg-terminal-text hover:text-black"
          onClick={() => goto('BOOT')}
        >
          [ REBOOT SYSTEM ]
        </button>
      </div>
    )
  }

  return <div>ERROR: UNKNOWN STATE</div>
}

export default App
