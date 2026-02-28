import React from 'react';
import { useGameStore } from '../../../../store/gameStore';

const GAME_ACTIONS = [
  { id: 'ask', label: '询问', prefix: '我想询问……' },
  { id: 'observe', label: '观察', prefix: '我仔细观察……' },
  { id: 'act', label: '行动', prefix: '我决定……' },
  { id: 'leave', label: '离开', prefix: '我准备离开……' },
];

export const QuickActions: React.FC = () => {
  const { isStreaming, player, characterCreation, sendPlayerInput } = useGameStore();

  // 如果 player 还没建立，使用 DM 建议的动态选项
  // 否则使用标准的四个游戏内行动
  const suggestedOptions = !player 
    ? characterCreation.suggestedOptions 
    : [];

  const handleAction = async (text: string) => {
    if (isStreaming) return;
    await sendPlayerInput(text);
  };

  const renderOption = (label: string, text: string, id: string) => (
    <button
      key={id}
      onClick={() => handleAction(text)}
      disabled={isStreaming}
      className="group flex items-center transition-all disabled:opacity-30 disabled:pointer-events-none"
    >
      <span className="text-game-text-dim/40 group-hover:text-game-text transition-colors">
        [
      </span>
      <span className="px-2 py-0.5 text-[11px] tracking-widest uppercase text-game-text-dim group-hover:text-game-bg group-hover:bg-game-text transition-all duration-200 ease-out">
        {label}
      </span>
      <span className="text-game-text-dim/40 group-hover:text-game-text transition-colors">
        ]
      </span>
    </button>
  );

  return (
    <div className="flex gap-4 flex-wrap font-mono">
      {!player && suggestedOptions.length > 0 ? (
        suggestedOptions.map((opt, i) => renderOption(opt, opt, `opt-${i}`))
      ) : player ? (
        GAME_ACTIONS.map((action) => renderOption(action.label, action.prefix, action.id))
      ) : (
        <span className="text-[10px] text-game-text-dim/30 animate-pulse tracking-widest uppercase">
          Waiting for system guidance...
        </span>
      )}
    </div>
  );
};
