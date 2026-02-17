import { useState, useEffect } from 'react'

function App() {
  const [bootSequence, setBootSequence] = useState<string[]>([])
  const [isBooted, setIsBooted] = useState(false)

  useEffect(() => {
    const logs = [
      "INITIALIZING JUPITER NET...",
      "CONNECTING TO RUSTED WHALE [ID: RW-47]...",
      "handshake: ACK received...",
      "WARNING: CORRUPTED MEMORY SECTORS DETECTED",
      "LOADING 'MEMORY DIVE' PROTOCOL v0.9...",
      "...",
      "ACCESS GRANTED."
    ]

    let delay = 0
    logs.forEach((log, index) => {
      delay += Math.random() * 800 + 200
      setTimeout(() => {
        setBootSequence(prev => [...prev, log])
        if (index === logs.length - 1) {
          setTimeout(() => setIsBooted(true), 1000)
        }
      }, delay)
    })
  }, [])

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text p-8 font-mono relative overflow-hidden">
      {/* CRT Effects */}
      <div className="scanline"></div>
      <div className="absolute inset-0 bg-green-500/5 pointer-events-none animate-flicker"></div>

      <div className="max-w-3xl mx-auto z-10 relative crt-glow">
        <header className="mb-12 border-b border-terminal-dim pb-4">
          <h1 className="text-4xl font-bold tracking-tighter">PROJECT JUPITER</h1>
          <p className="text-sm text-terminal-dim mt-2">CASE FILE: THE RUSTED WHALE INCIDENT</p>
        </header>

        <div className="space-y-2">
          {bootSequence.map((log, i) => (
            <div key={i} className={`${log.includes("WARNING") ? "text-terminal-alert" : ""}`}>
              <span className="opacity-50 mr-2">{`>`}</span>
              {log}
            </div>
          ))}
          
          {!isBooted && (
            <div className="animate-blink inline-block w-3 h-5 bg-terminal-text align-middle ml-2"></div>
          )}
        </div>

        {isBooted && (
          <div className="mt-12 border border-terminal-text p-6 animate-pulse">
            <p className="text-center text-xl mb-4">SYSTEM READY</p>
            <div className="flex justify-center">
              <button 
                className="px-8 py-2 bg-terminal-text text-terminal-bg font-bold hover:bg-white hover:text-black transition-colors"
                onClick={() => alert("Loading Module 1: The Descent...")}
              >
                [ ENTER MEMORY ]
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
