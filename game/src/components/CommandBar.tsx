interface CommandBarProps {
  activeTab: 'SCAN' | 'LOGS' | 'MANIFEST';
  onTabChange: (tab: 'SCAN' | 'LOGS' | 'MANIFEST') => void;
}

export function CommandBar({ activeTab, onTabChange }: CommandBarProps) {
  const tabs = [
    { id: 'SCAN', label: 'SCANNER', key: 'F1' },
    { id: 'LOGS', label: 'DATA LOGS', key: 'F2' },
    { id: 'MANIFEST', label: 'CREW MANIFEST', key: 'F3' },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-terminal-text p-2 font-mono text-sm z-50 flex justify-between items-center text-terminal-text select-none">
      <div className="flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 border transition-all ${
              activeTab === tab.id 
                ? 'bg-terminal-text text-black border-terminal-text font-bold' 
                : 'bg-black text-terminal-dim border-transparent hover:border-terminal-dim'
            }`}
          >
            <span className="opacity-50 mr-2">[{tab.key}]</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="text-xs text-terminal-dim animate-pulse px-4">
        {activeTab === 'SCAN' && "Use MOUSE or ARROWS to investigate"}
        {activeTab === 'LOGS' && "Review collected evidence"}
        {activeTab === 'MANIFEST' && "Deduce crew fate"}
      </div>
    </div>
  )
}
