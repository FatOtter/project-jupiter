import React, { useState } from 'react';
import { NotebookEntryId } from '../../../types/game';
import { notebookEntries, notebookList } from '../../../data/victoria';

interface MemoryCollectionProps {
  unlockedEntries: NotebookEntryId[];
  victoriaTrust: number;
}

export const MemoryCollection: React.FC<MemoryCollectionProps> = ({
  unlockedEntries,
  victoriaTrust,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<NotebookEntryId | null>(null);

  const unlockedList = notebookList.filter((entry) =>
    unlockedEntries.includes(entry.id)
  );

  const availableButLocked = notebookList.filter(
    (entry) => !unlockedEntries.includes(entry.id) && entry.requiredTrust <= victoriaTrust
  );

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded p-3">
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">收集的记忆</div>
      
      {unlockedList.length === 0 && availableButLocked.length === 0 ? (
        <div className="text-sm text-zinc-600">暂无解锁的记忆</div>
      ) : (
        <div className="space-y-1">
          {unlockedList.map((entry) => (
            <div key={entry.id}>
              <button
                onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                className="w-full text-left py-1 px-2 rounded hover:bg-zinc-800 text-violet-400 text-sm"
              >
                📖 {entry.title}
              </button>
              
              {selectedEntry === entry.id && (
                <div className="mt-2 p-3 bg-zinc-800 rounded border-l-2 border-violet-500">
                  <div className="text-violet-400 text-sm mb-2">{entry.summary}</div>
                  <div className="text-zinc-300 text-xs whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {availableButLocked.length > 0 && (
            <div className="pt-2 border-t border-zinc-800 mt-2">
              <div className="text-xs text-zinc-600 mb-1">可解锁（触发条件待满足）</div>
              {availableButLocked.map((entry) => (
                <div key={entry.id} className="text-zinc-600 text-sm py-1 px-2">
                  🔒 {entry.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
