import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { IdentityTypeSelect } from './IdentityTypeSelect';
import { CharacterForm } from './CharacterForm';
import { AttributeForm } from './AttributeForm';
import { PartyCreation } from './PartyCreation';
import { EraSelect } from './EraSelect';

const STEPS = [
  '选择身份类型',
  '角色基本信息',
  '核心属性',
  '同行者创建',
  '时代与场景',
];

export const CharacterCreation: React.FC = () => {
  const { currentStep } = useGameStore();

  return (
    <div className="min-h-screen bg-game-bg text-game-text font-mono p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">漫行者纪事</h1>
        <div className="text-game-text-dim">Project Jupiter: The Wanderer's Chronicle</div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`px-4 py-2 border ${
              index === currentStep
                ? 'border-game-text text-game-text'
                : index < currentStep
                ? 'border-game-text-dim text-game-text-dim'
                : 'border-game-border text-game-text-dim opacity-50'
            }`}
          >
            <span className="text-xs">{index + 1}.</span>
            <span className="ml-1 text-sm">{step}</span>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {currentStep === 0 && <IdentityTypeSelect />}
        {currentStep === 1 && <CharacterForm />}
        {currentStep === 2 && <AttributeForm />}
        {currentStep === 3 && <PartyCreation />}
        {currentStep === 4 && <EraSelect />}
      </div>
    </div>
  );
};
