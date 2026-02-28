import React from 'react';
import { useGameStore } from '../../../../store/gameStore';
import { NOTEBOOK_ENTRIES } from '../../../../types/game';
import { Panel } from '../../../ui';

export const MemoryCollection: React.FC = () => {
  const { victoria } = useGameStore();
  const [expandedEntry, setExpandedEntry] = React.useState<string | null>(null);

  const unlockedEntries = NOTEBOOK_ENTRIES.filter(
    (entry) => victoria.unlockedNotebook.includes(entry.id)
  );

  return (
    <Panel title="收集记忆">
      {unlockedEntries.length === 0 ? (
        <div className="text-game-text-dim text-sm text-center py-2">
          <span className="text-victoria">V.</span> 尚未分享记事本内容
        </div>
      ) : (
        <div className="space-y-1">
          {unlockedEntries.map((entry) => (
            <div key={entry.id}>
              <button
                onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                className="w-full text-left p-2 border border-game-border hover:border-game-text-dim transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-victoria text-sm">{entry.title}</span>
                  <span className="text-game-text-dim text-xs">
                    信任值 {entry.trustRequired}+
                  </span>
                </div>
              </button>
              
              {expandedEntry === entry.id && (
                <div className="p-2 border border-game-border border-t-0 bg-black/30 text-xs text-game-text-dim">
                  {entry.summary}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};
