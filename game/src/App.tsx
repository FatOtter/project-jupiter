import { useState, useEffect } from 'react'
import { SceneViewer } from './components/SceneViewer'
import { ManifestModal } from './components/ManifestModal'
import { CommandBar } from './components/CommandBar'
import { useKeyboardNav } from './hooks/useKeyboardNav'

type GamePhase = 'BOOT' | 'SCENE_1_DESCENT' | 'SCENE_2_COCKPIT' | 'SCENE_3_BITE' | 'SCENE_4_CROSSOVER' | 'END_CREDITS'

function App() {
  const [phase, setPhase] = useState<GamePhase>('BOOT')
  const [isManifestOpen, setIsManifestOpen] = useState(false)
  const [bootLogs, setBootLogs] = useState<string[]>([])
  
  // Keyboard Handler for Global Shortcuts
  useKeyboardNav((action) => {
    // If Manifest is open, it handles its own nav (we'll implement that inside ManifestModal later)
    // Here we handle global toggles
    if (action === 'TAB') { // M key mapped to TAB for now or we need to update hook
       // For now let's rely on CommandBar clicking or add dedicated keys
    }
  })

  // Hack: Add key listener for 'm' since our hook only does arrows
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') setIsManifestOpen(prev => !prev)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // ... Boot Logic (Kept same as before, abbreviated for brevity) ...
  useEffect(() => {
    if (phase === 'BOOT' && bootLogs.length === 0) {
      setBootLogs(["SYSTEM BOOT...", "PRESS [ENTER] TO START"])
    }
  }, [phase])

  // --- Renderers ---

  if (phase === 'BOOT') {
    return (
      <div className="min-h-screen bg-terminal-bg text-terminal-text flex flex-col items-center justify-center font-mono">
        <h1 className="text-4xl mb-4 text-terminal-text animate-pulse">PROJECT JUPITER</h1>
        <div className="mb-8">[ TERMINAL ACCESS ]</div>
        <button 
          className="border border-terminal-text px-4 py-2 hover:bg-terminal-text hover:text-black"
          onClick={() => setPhase('SCENE_1_DESCENT')}
        >
          [ CLICK TO START (OR PRESS ENTER) ]
        </button>
      </div>
    )
  }

  // Common UI Wrapper
  const renderScene = (content: React.ReactNode) => (
    <div className="h-screen w-screen bg-terminal-bg relative font-mono text-terminal-text overflow-hidden">
      <div className="scanline"></div>
      
      {/* Content Area */}
      <div className="absolute inset-0 bottom-12">
        {content}
      </div>

      {/* Footer */}
      <CommandBar 
        mode={isManifestOpen ? 'MANIFEST' : 'SCAN'} 
        onLogToggle={() => alert("LOGS NOT IMPLEMENTED")}
        onManifestToggle={() => setIsManifestOpen(!isManifestOpen)}
      />

      {/* Manifest Modal */}
      <ManifestModal isOpen={isManifestOpen} onClose={() => setIsManifestOpen(false)} />
    </div>
  )

  // ... Scenes Configuration (Same as previous version) ...
  // For brevity, I'm pasting Scene 1 logic. You can infer others remain similar.
  
  if (phase === 'SCENE_1_DESCENT') {
    return renderScene(
      <SceneViewer 
        imageSrc="/assets/heartbeat/rusted_whale_design.png"
        title="MEMORY 01: THE DESCENT"
        description="Use ARROW KEYS to move cursor. PRESS ENTER to scan."
        hotspots={[
          { id: 'engines', x: 20, y: 65, label: 'THRUSTERS', onClick: () => alert("LOG: Thrusters Critical.") },
          { id: 'hull', x: 50, y: 50, label: 'COCKPIT', onClick: () => { if(confirm("Enter Cockpit?")) setPhase('SCENE_2_COCKPIT') } }
        ]}
      />
    )
  }

  if (phase === 'SCENE_2_COCKPIT') {
    return renderScene(
      <SceneViewer 
        imageSrc="/assets/heartbeat/ch2_struggle.png"
        title="MEMORY 02: THE STRUGGLE"
        description="Cockpit interior. G-Force: 9G."
        hotspots={[
          { id: 'qiang', x: 60, y: 60, label: 'PILOT QIANG', onClick: () => alert("DATA: Heart rate 180.") },
          { id: 'lever', x: 30, y: 70, label: 'LEVER', onClick: () => { if(confirm("Zoom in?")) setPhase('SCENE_3_BITE') } }
        ]}
      />
    )
  }

  if (phase === 'SCENE_3_BITE') {
    return renderScene(
      <SceneViewer 
        imageSrc="/assets/heartbeat/ch3_bite_v2.png"
        title="MEMORY 03: THE IMPACT"
        description="Critical moment."
        hotspots={[
          { id: 'mouth', x: 50, y: 50, label: 'POINT OF CONTACT', onClick: () => alert("ANALYSIS: Jaw dislocated.") },
          { id: 'next', x: 90, y: 50, label: 'NEXT', onClick: () => setPhase('SCENE_4_CROSSOVER') }
        ]}
      />
    )
  }

  if (phase === 'SCENE_4_CROSSOVER') {
    return renderScene(
      <SceneViewer 
        imageSrc="/assets/heartbeat/ch4_crossover.png"
        title="MEMORY 04: AFTERMATH"
        description="Med-Bay."
        hotspots={[
          { id: 'body', x: 70, y: 60, label: 'REMAINS', onClick: () => alert("AUTOPSY: Deceased.") },
          { id: 'end', x: 30, y: 60, label: 'END', onClick: () => setPhase('END_CREDITS') }
        ]}
      />
    )
  }

  if (phase === 'END_CREDITS') {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-terminal-text">
        <div>THANKS FOR PLAYING. REFRESH TO RESTART.</div>
      </div>
    )
  }

  return <div>ERROR</div>
}

export default App
