import React from 'react';
import { useGameStore } from '../../../../store/gameStore';
import { getEraInfo } from '../../../../data/eras';
import { PlayerStatus } from './PlayerStatus';
import { PartyList } from './PartyList';
import { MemoryCollection } from './MemoryCollection';

const ERA_NAMES: Record<string, string> = {
  genesis: '创世纪 (2062-2120)',
  golden_age: '黄金时代 (2120-2300)',
  great_doubt: '大质疑时代 (2300-2350)',
  singularity_trap: '奇点陷阱 (2350后)',
  return: '回归时代 (10000+)',
};

export const LeftPanel: React.FC = () => {
  const { selectedEra, currentScene, resetGame, player, characterCreation } = useGameStore();
  const eraInfo = selectedEra ? getEraInfo(selectedEra) : null;

  const isCharacterComplete = player && characterCreation.isComplete;

  return (
    <div className="w-64 h-full bg-game-bg border-r border-game-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-game-border">
        <h1 className="text-lg font-bold text-game-text">
          {isCharacterComplete ? '漫行者纪事' : '身份核实中...'}
        </h1>
        {isCharacterComplete && eraInfo && (
          <div className="text-game-text-dim text-xs mt-1">
            {eraInfo.name}
          </div>
        )}
        {!isCharacterComplete && characterCreation.era && (
          <div className="text-game-text-dim text-xs mt-1">
            {ERA_NAMES[characterCreation.era] || characterCreation.era}
          </div>
        )}
        {currentScene && (
          <div className="text-game-text-dim text-xs mt-0.5 truncate">
            {currentScene}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <PlayerStatus />
        {isCharacterComplete && <PartyList />}
        {isCharacterComplete && <MemoryCollection />}
      </div>

      <div className="p-4 border-t border-game-border">
        <button
          onClick={() => {
            if (window.confirm('确定要重新开始吗？当前进度将丢失。')) {
              resetGame();
            }
          }}
          className="w-full text-left text-game-text-dim hover:text-antagonist text-xs transition-colors"
        >
          [ 重新开始 ]
        </button>
      </div>
    </div>
  );
};
