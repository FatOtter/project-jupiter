import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { FORMS, FACTION_STANCES } from '../../../types/game';
import { Button, TextArea, Select, Panel } from '../../ui';

export const AttributeForm: React.FC = () => {
  const { player, setPlayer, setCurrentStep } = useGameStore();
  
  const [form, setForm] = React.useState(player?.form || 'silicon');
  const [factionStance, setFactionStance] = React.useState(player?.factionStance || 'neutral');
  const [memoryAnchor, setMemoryAnchor] = React.useState(player?.memoryAnchor || '');
  const [specialAbility, setSpecialAbility] = React.useState(player?.specialAbility || '');

  const handleNext = () => {
    setPlayer({
      ...player!,
      form: form as any,
      factionStance: factionStance as any,
      memoryAnchor,
      specialAbility,
    } as any);
    
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  if (!player) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-game-text border-b border-game-border pb-2">
        核心属性
      </h2>

      <Panel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="生存形态"
            value={form}
            onChange={(e) => setForm(e.target.value as 'carbon' | 'silicon' | 'hybrid' | 'unknown')}
            options={FORMS.map(f => ({
              value: f.id,
              label: f.name,
            }))}
          />

          <Select
            label="派系立场"
            value={factionStance}
            onChange={(e) => setFactionStance(e.target.value as 'cloud' | 'edge' | 'neutral' | 'undecided')}
            options={FACTION_STANCES.map(f => ({
              value: f.id,
              label: f.name,
            }))}
          />
        </div>
      </Panel>

      <Panel title="记忆锚点">
        <TextArea
          placeholder="描述你的角色与哪个时代/人物/事件有深厚连结...（例如：我在节点47度过了最初的十年）"
          value={memoryAnchor}
          onChange={(e) => setMemoryAnchor(e.target.value)}
          rows={3}
        />
        <div className="text-game-text-dim text-xs mt-2">
          记忆锚点可能影响维多利亚对你的初始态度
        </div>
      </Panel>

      <Panel title="特殊能力">
        <TextArea
          placeholder="描述一项你的角色特有的能力...（DM会酌情在叙事中采纳，不保证生效）"
          value={specialAbility}
          onChange={(e) => setSpecialAbility(e.target.value)}
          rows={2}
        />
      </Panel>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={handleBack}>
          ← 返回
        </Button>
        <Button onClick={handleNext}>
          下一步 →
        </Button>
      </div>
    </div>
  );
};
