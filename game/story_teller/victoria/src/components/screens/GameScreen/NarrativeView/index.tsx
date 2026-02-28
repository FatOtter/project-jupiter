import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../../../store/gameStore';
import { NarrativeText } from './NarrativeText';
import { MilestoneEffect } from './MilestoneEffect';
import { MILESTONE_EVENTS } from '../../../../data/worldbuilding';

export const NarrativeView: React.FC = () => {
  const { conversationHistory, isStreaming, streamingContent, triggeredMilestones } = useGameStore();
  const [showMilestone, setShowMilestone] = React.useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current?.parentElement;
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [conversationHistory, streamingContent]);

  useEffect(() => {
    if (triggeredMilestones.length > 0) {
      const latest = triggeredMilestones[triggeredMilestones.length - 1];
      const milestone = MILESTONE_EVENTS.find(m => m.id === latest);
      if (milestone) {
        setShowMilestone(milestone.name);
      }
    }
  }, [triggeredMilestones]);

  return (
    <div ref={scrollRef} className="p-6">
      {conversationHistory.length === 0 && !isStreaming && (
        <div className="h-[calc(100vh-200px)] flex items-center justify-center text-game-text-dim">
          <div className="text-center">
            <div className="text-2xl mb-2 animate-pulse">⏳</div>
            <div className="tracking-[0.3em] uppercase text-[10px]">Initializing World Data...</div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full space-y-2">
        {conversationHistory.map((turn, index) => (
          <NarrativeText
            key={index}
            content={turn.content}
            role={turn.role}
            speaker={turn.role === 'dm' && turn.dmResponse?.speaker 
              ? (turn.dmResponse.speaker as any)
              : undefined
            }
            isStreaming={false}
          />
        ))}

        {isStreaming && streamingContent && (
          <NarrativeText
            content={streamingContent}
            role="dm"
            isStreaming={true}
          />
        )}

        {isStreaming && !streamingContent && (
          <div className="text-game-text-dim animate-pulse font-mono text-sm py-4">
            {'>'} ESTABLISHING UPLINK...
          </div>
        )}
        
        <div className="h-12" />
      </div>

      {showMilestone && (
        <MilestoneEffect
          milestoneName={showMilestone}
          onComplete={() => setShowMilestone(null)}
        />
      )}
    </div>
  );
};
