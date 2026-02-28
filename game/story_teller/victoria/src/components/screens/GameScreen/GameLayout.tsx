import React from 'react';
import { LeftPanel } from './LeftPanel';
import { NarrativeView } from './NarrativeView';
import { InputArea } from './InputArea';
import { EraProgressBar } from './EraProgressBar';

export const GameLayout: React.FC = () => {
  return (
    <div className="flex flex-row h-screen w-full bg-game-bg text-game-text overflow-hidden">
      {/* 1. 竖向时代进度条 (New) */}
      <EraProgressBar />

      {/* 2. 左侧状态面板 */}
      <aside className="w-80 border-r border-game-border flex flex-col h-full overflow-y-auto custom-scrollbar bg-black/20">
        <LeftPanel />
      </aside>

      {/* 3. 主工作区 */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* 叙事区 - 独立滚动 */}
        <section className="flex-1 overflow-y-auto custom-scrollbar relative">
          <NarrativeView />
        </section>

        {/* 底部输入区 */}
        <footer className="shrink-0 border-t border-game-border bg-black/80 backdrop-blur-md z-10">
          <InputArea />
        </footer>
      </main>
    </div>
  );
};
