import React from 'react';

interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`border border-game-border bg-game-bg p-4 ${className}`}>
      {title && (
        <div className="text-game-text-dim text-xs uppercase tracking-wider border-b border-game-border pb-2 mb-3">
          {title}
        </div>
      )}
      <div className="text-game-text">
        {children}
      </div>
    </div>
  );
};

export const PanelCard: React.FC<PanelProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`border border-game-border bg-black/50 p-4 ${className}`}>
      {title && (
        <div className="text-game-text font-bold mb-2">
          {title}
        </div>
      )}
      <div className="text-game-text text-sm">
        {children}
      </div>
    </div>
  );
};
