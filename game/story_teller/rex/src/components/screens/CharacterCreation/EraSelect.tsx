import React from 'react';
import { Era } from '../../../types/game';
import { eras, eraList } from '../../../data/eras';

interface EraSelectProps {
  onComplete: (era: Era, scene: string) => void;
  onBack: () => void;
}

export const EraSelect: React.FC<EraSelectProps> = ({ onComplete, onBack }) => {
  const [selectedEra, setSelectedEra] = React.useState<Era | null>(null);
  const [selectedScene, setSelectedScene] = React.useState<string | null>(null);

  const handleEraSelect = (era: Era) => {
    setSelectedEra(era);
    setSelectedScene(null);
  };

  const handleComplete = () => {
    if (selectedEra && selectedScene) {
      onComplete(selectedEra, selectedScene);
    }
  };

  const currentEra = selectedEra ? eras[selectedEra] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg text-emerald-400 font-mono">选择时代</h2>
        <p className="text-sm text-zinc-500 mt-1">
          选择你的故事发生的时代背景。
        </p>
      </div>

      {/* Era selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {eraList.map((era) => (
          <button
            key={era.id}
            onClick={() => handleEraSelect(era.id)}
            className={`text-left p-4 border rounded transition-colors ${
              selectedEra === era.id
                ? 'border-emerald-500 bg-zinc-800'
                : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900'
            }`}
          >
            <div className="font-mono">
              <div className="text-emerald-400 text-xs">{era.name}</div>
              <div className="text-lg text-zinc-100">{era.nameZh}</div>
              <div className="text-xs text-zinc-500 mt-1">{era.yearRange}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Era details and scene selection */}
      {currentEra && (
        <div className="bg-zinc-800 border border-zinc-700 rounded p-4 space-y-4">
          <div>
            <div className="text-zinc-300">{currentEra.description}</div>
            <div className="text-sm text-amber-400 mt-2">
              核心张力：{currentEra.tension}
            </div>
            <div className="text-sm text-violet-400 mt-1">
              维多利亚状态：{currentEra.victoriaState}
            </div>
          </div>

          <div>
            <div className="text-sm text-zinc-400 mb-2">选择开场场景</div>
            <div className="space-y-2">
              {currentEra.openingScenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedScene(scene.id)}
                  className={`w-full text-left p-3 border rounded transition-colors ${
                    selectedScene === scene.id
                      ? 'border-emerald-500 bg-zinc-700'
                      : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  <div className="font-mono">
                    <div className="text-emerald-400">{scene.name}</div>
                    <div className="text-xs text-zinc-500 mt-1">{scene.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-zinc-600 text-zinc-400 rounded hover:bg-zinc-800 font-mono text-sm"
        >
          返回
        </button>
        <button
          onClick={handleComplete}
          disabled={!selectedEra || !selectedScene}
          className="px-6 py-2 bg-emerald-600 text-zinc-900 rounded hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
        >
          开始游戏
        </button>
      </div>
    </div>
  );
};
