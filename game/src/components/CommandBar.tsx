interface CommandBarProps {
  mode: 'BOOT' | 'SCAN' | 'MANIFEST' | 'DIALOG';
  onLogToggle: () => void;
  onManifestToggle: () => void;
}

export function CommandBar({ mode, onLogToggle, onManifestToggle }: CommandBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-terminal-text p-2 font-mono text-sm z-50 flex justify-between items-center text-terminal-text">
      <div className="flex gap-4">
        <span className="bg-terminal-text text-black px-2 font-bold animate-pulse">
          MODE: {mode}
        </span>
        
        {mode === 'SCAN' && (
          <>
            <span>[ARROWS] MOVE CURSOR</span>
            <span>[ENTER] ANALYZE</span>
          </>
        )}
        
        {mode === 'MANIFEST' && (
          <>
            <span>[ARROWS] NAVIGATE</span>
            <span>[SPACE] SELECT</span>
            <span>[ESC] CLOSE</span>
          </>
        )}
      </div>

      <div className="flex gap-4 opacity-80">
        <button onClick={onLogToggle} className="hover:bg-terminal-text hover:text-black px-1">[L] LOGS</button>
        <button onClick={onManifestToggle} className="hover:bg-terminal-text hover:text-black px-1">[M] MANIFEST</button>
      </div>
    </div>
  )
}
