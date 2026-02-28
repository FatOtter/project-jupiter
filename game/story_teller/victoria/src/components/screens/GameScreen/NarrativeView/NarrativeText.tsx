import React from 'react';
import { StreamingText } from '../../../ui';

interface NarrativeTextProps {
  content: string;
  speaker?: 'dm' | 'victoria' | string;
  role: 'player' | 'dm';
  isStreaming?: boolean;
}

export const NarrativeText: React.FC<NarrativeTextProps> = ({
  content,
  speaker,
  role,
  isStreaming = false,
}) => {
  if (role === 'player') {
    return (
      <div className="py-2 opacity-70">
        <div className="flex gap-2 font-mono text-sm text-game-text-dim">
          <span className="shrink-0">{'>'}</span>
          <span className="uppercase tracking-tighter shrink-0">[USER_INPUT]:</span>
          <span className="italic">{content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 border-l-2 border-game-text/10 pl-6 my-2">
      <StreamingText
        text={content}
        isStreaming={isStreaming}
        speaker={speaker}
      />
    </div>
  );
};
