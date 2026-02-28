import React, { useEffect, useState } from 'react';

interface MilestoneEffectProps {
  milestoneName?: string;
  onComplete: () => void;
}

export const MilestoneEffect: React.FC<MilestoneEffectProps> = ({
  milestoneName,
  onComplete,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 animate-pulse">
      <div className="absolute inset-0 border-4 border-victoria opacity-50" />
      {milestoneName && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-game-bg border-2 border-victoria px-6 py-3 text-victoria font-bold">
            ⚡ {milestoneName}
          </div>
        </div>
      )}
    </div>
  );
};
