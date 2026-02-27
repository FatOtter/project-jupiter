import React, { useState } from 'react';
import { IdentityType, Form, FactionStance, MaintenanceLevel, PlayerCharacter } from '../../../types/game';

interface CharacterFormProps {
  identityType: IdentityType;
  onComplete: (character: PlayerCharacter) => void;
  onBack: () => void;
}

const formOptions: { value: Form; label: string }[] = [
  { value: 'carbon', label: '碳基' },
  { value: 'silicon', label: '硅基' },
  { value: 'hybrid', label: '混合（飞升中）' },
  { value: 'unknown', label: '未知' },
];

const factionOptions: { value: FactionStance; label: string }[] = [
  { value: 'cloud', label: '上云派（共产）' },
  { value: 'edge', label: '端侧派（资本）' },
  { value: 'neutral', label: '中立' },
  { value: 'undecided', label: '未表态' },
];

const subtypeOptions: Record<IdentityType, string[]> = {
  awakened_ai: ['新生（<50年）', '老灵魂（>100年）'],
  diver: ['碳基金丝雀', '硅基标准潜水员', '飞升中（混合态）'],
  resident: ['盖尼米得学者', '欧罗巴红区居民', '欧罗巴蓝区金融从业者', '伊奥维修工程师'],
  wanderer: ['自由职业者'],
};

export const CharacterForm: React.FC<CharacterFormProps> = ({
  identityType,
  onComplete,
  onBack,
}) => {
  const [name, setName] = useState('');
  const [subtype, setSubtype] = useState(subtypeOptions[identityType][0]);
  const [form, setForm] = useState<Form>('carbon');
  const [faction, setFaction] = useState<FactionStance>('neutral');
  const [memoryAnchor, setMemoryAnchor] = useState('');
  const [specialAbility, setSpecialAbility] = useState('');
  const [maintenanceLevel, setMaintenanceLevel] = useState<MaintenanceLevel>('sufficient');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onComplete({
      name: name.trim(),
      identityType,
      identitySubtype: subtype,
      form,
      factionStance: faction,
      memoryAnchor: memoryAnchor.trim() || '无',
      specialAbility: specialAbility.trim() || '无',
      ...(identityType === 'awakened_ai' && { maintenanceLevel }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg text-emerald-400 font-mono">填写角色信息</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">名字 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
            placeholder="你的角色名字"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">子类型</label>
          <select
            value={subtype}
            onChange={(e) => setSubtype(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
          >
            {subtypeOptions[identityType].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">生存形态</label>
          <div className="flex gap-4">
            {formOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="form"
                  value={opt.value}
                  checked={form === opt.value}
                  onChange={(e) => setForm(e.target.value as Form)}
                  className="accent-emerald-500"
                />
                <span className="text-zinc-300 text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">派系立场</label>
          <div className="grid grid-cols-2 gap-2">
            {factionOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="faction"
                  value={opt.value}
                  checked={faction === opt.value}
                  onChange={(e) => setFaction(e.target.value as FactionStance)}
                  className="accent-emerald-500"
                />
                <span className="text-zinc-300 text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {identityType === 'awakened_ai' && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">维护费状态</label>
            <select
              value={maintenanceLevel}
              onChange={(e) => setMaintenanceLevel(e.target.value as MaintenanceLevel)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
            >
              <option value="sufficient">充足</option>
              <option value="tight">紧张</option>
              <option value="critical">濒危</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm text-zinc-400 mb-1">记忆锚点</label>
          <textarea
            value={memoryAnchor}
            onChange={(e) => setMemoryAnchor(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none resize-none"
            rows={2}
            placeholder="你与哪个时代/人物/事件有深厚连结？（影响维多利亚对你的初始态度）"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">一项特殊能力</label>
          <textarea
            value={specialAbility}
            onChange={(e) => setSpecialAbility(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none resize-none"
            rows={2}
            placeholder="自由描述，DM会酌情采纳"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-zinc-600 text-zinc-400 rounded hover:bg-zinc-800 font-mono text-sm"
        >
          返回
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-6 py-2 bg-emerald-600 text-zinc-900 rounded hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
        >
          下一步：创建同行者
        </button>
      </div>
    </form>
  );
};
