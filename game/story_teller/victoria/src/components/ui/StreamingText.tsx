import React, { useEffect, useRef, useState } from 'react';

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  speaker?: 'dm' | 'victoria' | string;
  className?: string;
  speed?: number;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  isStreaming,
  speaker,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (isStreaming) {
      setDisplayedText(text);
      indexRef.current = text.length;
    } else {
      setDisplayedText(text);
    }
  }, [text, isStreaming]);

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedText]);

  const speakerColor = 
    speaker === 'victoria' ? 'text-victoria' :
    speaker === 'dm' || !speaker ? 'text-game-text' :
    'text-companion';

  const speakerLabel = 
    speaker === 'victoria' ? '[维多利亚]' :
    speaker === 'dm' || !speaker ? null :
    `[${speaker}]`;

  return (
    <div
      ref={containerRef}
      className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${speakerColor} ${className}`}
    >
      {speakerLabel && (
        <span className="font-bold mr-2">{speakerLabel}</span>
      )}
      <span className="prose prose-invert max-w-none">
        {displayedText}
      </span>
      {isStreaming && cursorVisible && (
        <span className="animate-pulse">▎</span>
      )}
    </div>
  );
};
