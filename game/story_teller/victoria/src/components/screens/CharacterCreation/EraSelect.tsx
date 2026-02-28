import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { ERAS } from '../../../types/game';
import type { Era } from '../../../types/game';
import { getEraInfo } from '../../../data/eras';
import { Button, Panel } from '../../ui';

export const EraSelect: React.FC = () => {
  const { selectedEra, setEra, player, party, currentScene, setScene, startGame } = useGameStore();
  const [localEra, setLocalEra] = React.useState<Era | null>(selectedEra);
  const [localScene, setLocalScene] = React.useState(currentScene);

  const handleSelectEra = (era: Era) => {
    setLocalEra(era);
    const eraInfo = getEraInfo(era);
    if (eraInfo && eraInfo.scenes.length > 0) {
      setLocalScene(eraInfo.scenes[0].name);
    }
  };

  const handleStart = () => {
    if (!localEra || !localScene) return;
    setEra(localEra);
    setScene(localScene);
    startGame();
  };

  const handleBack = () => {
    useGameStore.getState().setCurrentStep(3);
  };

  const selectedEraInfo = localEra ? getEraInfo(localEra) : null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-game-text border-b border-game-border pb-2">
        选择时代与场景
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {ERAS.map((era) => (
          <button
            key={era.id}
            onClick={() => handleSelectEra(era.id)}
            className={`text-left p-4 border transition-all ${
              localEra === era.id
                ? 'border-game-text bg-game-text/10'
                : 'border-game-border hover:border-game-text-dim'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-game-text">{era.name}</div>
                <div className="text-game-text-dim text-xs">{era.yearRange}</div>
              </div>
              {localEra === era.id && (
                <span className="text-game-text">✓</span>
              )}
            </div>
            <div className="text-game-text-dim text-sm mt-2">{era.description}</div>
          </button>
        ))}
      </div>

      {selectedEraInfo && (
        <Panel title="选择开场场景">
          <div className="space-y-2">
            {selectedEraInfo.scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setLocalScene(scene.name)}
                className={`w-full text-left p-3 border transition-all ${
                  localScene === scene.name
                    ? 'border-game-text bg-game-text/10'
                    : 'border-game-border hover:border-game-text-dim'
                }`}
              >
                <div className="font-bold text-game-text">{scene.name}</div>
                <div className="text-game-text-dim text-xs">{scene.description}</div>
              </button>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="角色确认">
        <div className="space-y-1 text-sm">
          <div>名称: <span className="text-game-text">{player?.name}</span></div>
          <div>身份: <span className="text-game-text">{player?.identityType} / {player?.identitySubtype}</span></div>
          <div>形态: <span className="text-game-text">{player?.form}</span></div>
          <div>派系: <span className="text-game-text">{player?.factionStance}</span></div>
          {party.length > 0 && (
            <div>同行者: <span className="text-game-text">{party.map(p => p.name).join(', ')}</span></div>
          )}
        </div>
      </Panel>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={handleBack}>
          ← 返回
        </Button>
        <Button onClick={handleStart} disabled={!localEra || !localScene}>
          开始游戏
        </Button>
      </div>
    </div>
  );
};
