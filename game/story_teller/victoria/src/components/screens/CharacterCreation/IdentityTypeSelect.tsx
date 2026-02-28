import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { IDENTITY_TYPES } from '../../../types/game';
import type { IdentityType } from '../../../types/game';
import { Button, Panel } from '../../ui';

export const IdentityTypeSelect: React.FC = () => {
  const { player, setPlayer, setCurrentStep } = useGameStore();
  const [selectedType, setSelectedType] = React.useState<IdentityType | null>(
    player?.identityType || null
  );

  const handleSelect = (type: IdentityType) => {
    setSelectedType(type);
  };

  const handleNext = () => {
    if (!selectedType) return;
    
    const typeInfo = IDENTITY_TYPES.find(t => t.id === selectedType);
    const defaultSubtype = typeInfo?.subtypes[0]?.id || '';
    
    setPlayer({
      name: '',
      identityType: selectedType,
      identitySubtype: defaultSubtype,
      form: 'silicon',
      factionStance: 'neutral',
      memoryAnchor: '',
      specialAbility: '',
      ...(selectedType === 'awakened_ai' && {
        maintenanceLevel: 'sufficient',
        instanceCount: 'single',
      }),
    } as any);
    
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-game-text border-b border-game-border pb-2">
        选择身份类型
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {IDENTITY_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className={`text-left p-4 border transition-all ${
              selectedType === type.id
                ? 'border-game-text bg-game-text/10'
                : 'border-game-border hover:border-game-text-dim'
            }`}
          >
            <div className="font-bold text-game-text mb-1">{type.name}</div>
            <div className="text-game-text-dim text-sm">{type.description}</div>
          </button>
        ))}
      </div>

      {selectedType && (
        <Panel title="子类型选择">
          <div className="space-y-2">
            {IDENTITY_TYPES.find(t => t.id === selectedType)?.subtypes.map((subtype) => (
              <div key={subtype.id} className="p-2 border border-game-border">
                <div className="font-bold text-game-text">{subtype.name}</div>
                <div className="text-game-text-dim text-xs">{subtype.description}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedType}
        >
          下一步 →
        </Button>
      </div>
    </div>
  );
};
