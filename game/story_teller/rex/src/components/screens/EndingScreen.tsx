import React from 'react';
import { EndingType } from '../../types/game';
import { useGameStore } from '../../store/gameStore';

const endingInfo: Record<EndingType, { title: string; description: string }> = {
  witness: {
    title: '见证者',
    description: '你成为了和维多利亚一样的存在——一个记录者。她递给你一本空白记事本："你也开始记了。"',
  },
  changer: {
    title: '改变者',
    description: '你改变了某个人的一生。烛龙的节点在远处闪烁，一如既往。',
  },
  leaver: {
    title: '离去者',
    description: '维多利亚目送你离去。她没有挽留，只是在最后说了一句话。',
  },
};

export const EndingScreen: React.FC = () => {
  const { endingTriggered, victoria, reset, save } = useGameStore();

  if (!endingTriggered) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        结局加载中...
      </div>
    );
  }

  const ending = endingInfo[endingTriggered];

  return (
    <div className="min-h-screen bg-zinc-900 text-emerald-400 font-mono flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 text-center">
        {/* Ending title */}
        <div className="mb-8">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
            故事结束
          </div>
          <h1 className="text-3xl text-violet-400 mb-4">
            {ending.title}
          </h1>
          <p className="text-zinc-300 leading-relaxed">
            {ending.description}
          </p>
        </div>

        {/* Victoria's final words */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-8">
          <div className="text-violet-400 text-sm mb-2">[维多利亚]</div>
          <div className="text-zinc-300 text-sm italic">
            {victoria.trustLevel >= 80
              ? '"你知道吗，我等了很久。但我不后悔。因为遇见你，让等待变得有意义。……喵。"'
              : victoria.trustLevel >= 40
              ? '"每个人都有自己的路要走。你的路还在前面。"'
              : '"茶凉了。我再去泡一杯。"'}</div>
        </div>

        {/* Stats */}
        <div className="bg-zinc-800/30 border border-zinc-800 rounded p-4 mb-8">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
            本局统计
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-500">维多利亚信任</div>
              <div className="text-violet-400">{victoria.trustLevel} / 100</div>
            </div>
            <div>
              <div className="text-zinc-500">解锁记忆</div>
              <div className="text-violet-400">{victoria.unlockedNotebook.length} 条</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={save}
            className="px-6 py-2 border border-zinc-600 text-zinc-400 rounded hover:bg-zinc-800"
          >
            保存记录
          </button>
          <button
            onClick={reset}
            className="px-6 py-2 bg-emerald-600 text-zinc-900 rounded hover:bg-emerald-500"
          >
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
};
