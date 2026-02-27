import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { useDMSession } from '../../../hooks/useDMSession';
import { PlayerStatus, PartyList, MemoryCollection, NarrativeView, InputArea } from '../GameScreen';
import { eras } from '../../../data/eras';

export const GameScreen: React.FC = () => {
  const {
    player,
    party,
    selectedEra,
    currentScene,
    victoria,
    conversationHistory,
    triggeredMilestones,
    isStreaming,
    currentStreamingContent,
    save,
  } = useGameStore();

  const { sendPlayerInput } = useDMSession();

  if (!player || !selectedEra) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        游戏状态错误
      </div>
    );
  }

  const eraConfig = eras[selectedEra];
  const lastTurn = conversationHistory[conversationHistory.length - 1];
  const currentSpeaker = lastTurn?.dmResponse?.speaker;

  // Get the most recent milestone if any
  const lastMilestone = triggeredMilestones[triggeredMilestones.length - 1];
  const showMilestoneEffect = lastMilestone && 
    conversationHistory.length > 0 &&
    lastTurn?.dmResponse?.milestoneTriggered === lastMilestone;

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-64 flex-shrink-0 border-r border-zinc-700 bg-zinc-900/50 overflow-y-auto p-3 space-y-3">
        <PlayerStatus
          player={player}
          victoriaTrust={victoria.trustLevel}
        />
        
        <PartyList party={party} />
        
        <MemoryCollection
          unlockedEntries={victoria.unlockedNotebook}
          victoriaTrust={victoria.trustLevel}
        />

        {/* Current era info */}
        <div className="bg-zinc-900 border border-zinc-700 rounded p-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">当前时代</div>
          <div className="text-emerald-400 font-mono text-sm">{eraConfig.nameZh}</div>
          <div className="text-xs text-zinc-500">{eraConfig.yearRange}</div>
        </div>

        {/* Save button */}
        <button
          onClick={save}
          className="w-full px-3 py-2 border border-zinc-700 text-zinc-400 rounded hover:bg-zinc-800 text-sm font-mono"
        >
          保存进度
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-700 bg-zinc-900/30 px-4 py-2">
          <div className="text-xs text-zinc-500">
            {currentScene || eraConfig.nameZh}
          </div>
        </div>

        {/* Narrative View */}
        <NarrativeView
          history={conversationHistory}
          isStreaming={isStreaming}
          streamingContent={currentStreamingContent}
          currentSpeaker={currentSpeaker}
          milestoneTriggered={showMilestoneEffect ? lastMilestone : undefined}
        />

        {/* Input Area */}
        <InputArea
          onSend={sendPlayerInput}
          disabled={isStreaming}
          placeholder={isStreaming ? 'DM正在思考...' : '输入你的行动或对话...'}
        />
      </div>
    </div>
  );
};
