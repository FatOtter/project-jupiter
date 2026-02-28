import React from 'react';

interface SpeakerLabelProps {
  speaker?: 'dm' | 'victoria' | string;
}

export const SpeakerLabel: React.FC<SpeakerLabelProps> = ({ speaker }) => {
  if (!speaker || speaker === 'dm') return null;

  const label =
    speaker === 'victoria' ? '维多利亚' : speaker;

  const colorClass =
    speaker === 'victoria' ? 'text-victoria' :
    'text-companion';

  return (
    <span className={`${colorClass} font-bold mr-2`}>
      [{label}]
    </span>
  );
};
