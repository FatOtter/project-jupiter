import React from 'react';

interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-zinc-900 border border-zinc-700 rounded ${className}`}>
      {title && (
        <div className="px-3 py-2 border-b border-zinc-700 text-zinc-400 text-xs font-mono uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="p-3">
        {children}
      </div>
    </div>
  );
};
