import React, { useEffect, useRef } from 'react';
import { ConversationTurn, DMResponse } from '../../../types/game';
import { StreamingText } from '../../../ui';

interface NarrativeViewProps {
  history: ConversationTurn[];
  isStreaming: boolean;
  streamingContent: string;
  currentSpeaker?: 'dm' | 'victoria' | string;
  milestoneTriggered?: string;
}

export const NarrativeView: React.FC<NarrativeViewProps> = ({
  history,
  isStreaming,
  streamingContent,
  currentSpeaker,
  milestoneTriggered,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, streamingContent]);

  const getSpeakerColor = (turn: ConversationTurn): string => {
    if (turn.role === 'player') return 'text-zinc-300';
    if (!turn.dmResponse?.speaker) return 'text-emerald-500';
    if (turn.dmResponse.speaker === 'victoria') return 'text-violet-400';
    return 'text-amber-400';
  };

  const getSpeakerLabel = (turn: ConversationTurn): string => {
    if (turn.role === 'player') return '[你]';
    if (!turn.dmResponse?.speaker || turn.dmResponse.speaker === 'dm') return '';
    if (turn.dmResponse.speaker === 'victoria') return '[维多利亚]';
    return `[${turn.dmResponse.speaker}]`;
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {/* Milestone effect */}
      {milestoneTriggered && (
        <div className="border border-violet-500 rounded p-3 bg-zinc-900/50 animate-pulse">
          <div className="text-violet-400 text-sm font-mono">
            ⚡ 里程碑事件触发
          </div>
        </div>
      )}

      {/* Conversation history */}
      {history.map((turn, index) => (
        <div
          key={index}
          className={`${turn.role === 'player' ? 'text-right' : 'text-left'}`}
        >
          <div
            className={`inline-block max-w-[85%] text-left ${
              turn.role === 'player'
                ? 'bg-zinc-800 rounded-lg px-3 py-2'
                : ''
            }`}
          >
            <span className="text-zinc-500 text-xs mr-2">
              {getSpeakerLabel(turn)}
            </span>
            <div className={`font-mono text-sm leading-relaxed ${getSpeakerColor(turn)}`}>
              {turn.role === 'player' ? (
                turn.content
              ) : (
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: turn.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Streaming content */}
      {isStreaming && streamingContent && (
        <div className="text-left">
          <span className="text-zinc-500 text-xs mr-2">
            {currentSpeaker === 'victoria' ? '[维多利亚]' : ''}
          </span>
          <StreamingText
            content={streamingContent}
            isStreaming={isStreaming}
            speaker={currentSpeaker}
          />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
