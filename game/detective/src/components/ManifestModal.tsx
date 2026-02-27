import { useState } from 'react'
import { CREW, OPTIONS, SOLUTION } from '../data/manifest'

interface ManifestModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ManifestModal({ isOpen, onClose }: ManifestModalProps) {
  const [selectedCrewId, setSelectedCrewId] = useState<string>(CREW[0].id)
  const [guesses, setGuesses] = useState<Record<string, any>>({})
  const [solved, setSolved] = useState<string[]>([])

  if (!isOpen) return null

  const handleGuess = (field: string, value: string) => {
    setGuesses(prev => ({
      ...prev,
      [selectedCrewId]: { ...prev[selectedCrewId], [field]: value }
    }))
  }

  const checkFate = () => {
    const guess = guesses[selectedCrewId]
    const truth = SOLUTION[selectedCrewId as keyof typeof SOLUTION]
    
    if (!truth) return // No solution defined for this char in MVP

    if (
      guess?.status === truth.status &&
      guess?.cause === truth.cause &&
      guess?.culprit === truth.culprit
    ) {
      alert(`FATE CONFIRMED: ${CREW.find(c => c.id === selectedCrewId)?.name}`)
      setSolved(prev => [...prev, selectedCrewId])
    } else {
      alert("INCORRECT DEDUCTION. REVIEW EVIDENCE.")
    }
  }

  const currentGuess = guesses[selectedCrewId] || {}
  const isSolved = solved.includes(selectedCrewId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-terminal-bg border-2 border-terminal-text shadow-lg shadow-terminal-text/20 flex flex-col h-[80vh]">
        {/* Header */}
        <div className="border-b border-terminal-text p-4 flex justify-between items-center bg-terminal-text/10">
          <h2 className="text-xl font-bold tracking-widest">CREW MANIFEST [RW-47]</h2>
          <button onClick={onClose} className="text-terminal-alert font-bold hover:underline">[X] CLOSE</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: Crew List */}
          <div className="w-1/3 border-r border-terminal-dim overflow-y-auto">
            {CREW.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedCrewId(member.id)}
                className={`w-full text-left p-4 border-b border-terminal-dim/30 hover:bg-terminal-text/5 transition-colors
                  ${selectedCrewId === member.id ? 'bg-terminal-text/20 border-l-4 border-l-terminal-text' : ''}
                  ${solved.includes(member.id) ? 'line-through opacity-50' : ''}
                `}
              >
                <div className="font-bold">{member.name}</div>
                <div className="text-xs text-terminal-dim">{member.role}</div>
              </button>
            ))}
          </div>

          {/* Main: Deduction Form */}
          <div className="w-2/3 p-8 overflow-y-auto">
            <h3 className="text-2xl mb-6 border-b border-terminal-dim pb-2">
              {CREW.find(c => c.id === selectedCrewId)?.name}
            </h3>

            {isSolved ? (
              <div className="text-terminal-text font-bold text-center border border-terminal-text p-4">
                FATE CONFIRMED
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-terminal-dim text-sm mb-2">CURRENT STATUS</label>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.status.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleGuess('status', opt)}
                        className={`px-3 py-1 border border-terminal-dim text-sm hover:border-terminal-text
                          ${currentGuess.status === opt ? 'bg-terminal-text text-terminal-bg font-bold' : ''}
                        `}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cause */}
                {currentGuess.status && currentGuess.status !== 'Alive' && currentGuess.status !== 'MIA' && (
                  <div>
                    <label className="block text-terminal-dim text-sm mb-2">CAUSE OF DEATH / CHANGE</label>
                    <select 
                      className="w-full bg-black border border-terminal-dim p-2 text-terminal-text"
                      value={currentGuess.cause || ''}
                      onChange={(e) => handleGuess('cause', e.target.value)}
                    >
                      <option value="">[ SELECT CAUSE ]</option>
                      {OPTIONS.cause.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                )}

                {/* Culprit (if applicable) */}
                {currentGuess.cause && (
                  <div>
                    <label className="block text-terminal-dim text-sm mb-2">RESPONSIBLE PARTY</label>
                    <select 
                      className="w-full bg-black border border-terminal-dim p-2 text-terminal-text"
                      value={currentGuess.culprit || ''}
                      onChange={(e) => handleGuess('culprit', e.target.value)}
                    >
                      <option value="">[ SELECT ENTITY ]</option>
                      {OPTIONS.culprit.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                )}

                <div className="pt-8 border-t border-terminal-dim/30">
                  <button 
                    className="w-full py-3 bg-terminal-dim/20 border border-terminal-dim hover:bg-terminal-text hover:text-black transition-all font-bold"
                    onClick={checkFate}
                  >
                    [ VERIFY DEDUCTION ]
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
