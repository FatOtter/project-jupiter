import React, { useEffect } from 'react';
import { TextInput } from './TextInput';
import { QuickActions } from './QuickActions';
import { useGameStore } from '../../../../store/gameStore';

export const InputArea: React.FC = () => {
  const { initNarrative, conversationHistory } = useGameStore();

  useEffect(() => {
    if (conversationHistory.length === 0) {
      initNarrative();
    }
  }, [conversationHistory.length, initNarrative]);

  return (
    <div className="p-4 bg-black border-t border-game-border shadow-[0_-10px_30px_-10px_rgba(0,0,0,1)]">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 顶部指令选项 */}
        <div className="border-b border-game-border/10 pb-2">
          <QuickActions />
        </div>
        
        {/* 纯净的命令行输入区 */}
        <div className="py-2">
          <TextInput />
        </div>
      </div>
    </div>
  );
};
