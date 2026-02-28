import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { IDENTITY_TYPES, MAINTENANCE_LEVELS } from '../../../types/game';
import { Button, Input, Select, Panel } from '../../ui';

export const CharacterForm: React.FC = () => {
  const { player, setPlayer, setCurrentStep } = useGameStore();
  
  const [name, setName] = React.useState(player?.name || '');
  const [subtype, setSubtype] = React.useState(player?.identitySubtype || '');

  const typeInfo = IDENTITY_TYPES.find(t => t.id === player?.identityType);

  const handleNext = () => {
    if (!name.trim()) return;
    
    setPlayer({
      ...player!,
      name: name.trim(),
      identitySubtype: subtype,
    } as any);
    
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(0);
  };

  if (!player) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-game-text border-b border-game-border pb-2">
        角色基本信息
      </h2>

      <Panel title={`身份类型: ${typeInfo?.name || ''}`}>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="角色名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入角色名称..."
          />

          <Select
            label="子类型"
            value={subtype}
            onChange={(e) => setSubtype(e.target.value)}
            options={(typeInfo?.subtypes || []).map(s => ({
              value: s.id,
              label: s.name,
            }))}
          />
        </div>
      </Panel>

      {player.identityType === 'awakened_ai' && (
        <Panel title="觉醒AI专属属性">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="维护费等级"
              value={player.maintenanceLevel || 'sufficient'}
              onChange={(e) => setPlayer({
                ...player,
                maintenanceLevel: e.target.value as any
              } as any)}
              options={MAINTENANCE_LEVELS.map(m => ({
                value: m.id,
                label: m.name,
              }))}
            />
            
            <Select
              label="实例类型"
              value={player.instanceCount || 'single'}
              onChange={(e) => setPlayer({
                ...player,
                instanceCount: e.target.value as any
              } as any)}
              options={[
                { value: 'single', label: '单实例' },
                { value: 'multiple', label: '多实例' },
              ]}
            />
          </div>
        </Panel>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={handleBack}>
          ← 返回
        </Button>
        <Button onClick={handleNext} disabled={!name.trim()}>
          下一步 →
        </Button>
      </div>
    </div>
  );
};
