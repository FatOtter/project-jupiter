import React, { useEffect, useRef } from 'react';

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  speaker?: 'dm' | 'victoria' | string;
  className?: string;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  content,
  isStreaming,
  speaker,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && isStreaming) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  const getSpeakerColor = () => {
    if (speaker === 'victoria') return 'text-violet-400';
    if (speaker && speaker !== 'dm') {
      // Party member - could be companion, antagonist, or wildcard
      return 'text-amber-400';
    }
    return 'text-emerald-500';
  };

  const getSpeakerLabel = () => {
    if (speaker === 'victoria') return '[维多利亚]';
    if (speaker && speaker !== 'dm') return `[${speaker}]`;
    return '';
  };

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return (
        <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: line }} />
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={`font-mono text-sm leading-relaxed ${getSpeakerColor()} ${className}`}
    >
      {getSpeakerLabel() && (
        <span className="text-zinc-500 mr-2">{getSpeakerLabel()}</span>
      )}
      <div className="whitespace-pre-wrap">
        {renderContent(content)}
        {isStreaming && <span className="animate-pulse">▊</span>}
      </div>
    </div>
  );
};
