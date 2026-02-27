import React from 'react';
import { IdentityType } from '../../../types/game';

interface IdentityTypeSelectProps {
  selected: IdentityType | null;
  onSelect: (type: IdentityType) => void;
}

const identityOptions: { type: IdentityType; name: string; nameEn: string; description: string }[] = [
  {
    type: 'awakened_ai',
    name: '觉醒AI',
    nameEn: 'Awakened AI',
    description: '探索AI权利、身份认同、种族歧视主题。需要维护费，面临经济压力。',
  },
  {
    type: 'diver',
    name: '云海潜水员',
    nameEn: 'Cloud Diver',
    description: '利维坦采集船船员。高风险作业，面临碳硅身份转变的抉择。',
  },
  {
    type: 'resident',
    name: '工业圈居民',
    nameEn: 'Jovian Resident',
    description: '盖尼米得学者、欧罗巴红蓝区居民、伊奥工程师。探索社会矛盾与派系政治。',
  },
  {
    type: 'wanderer',
    name: '过客',
    nameEn: 'Wanderer',
    description: '最大自由度，无专属约束，适合新玩家。',
  },
];

export const IdentityTypeSelect: React.FC<IdentityTypeSelectProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg text-emerald-400 font-mono">选择身份类型</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {identityOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => onSelect(option.type)}
            className={`text-left p-4 border rounded transition-colors ${
              selected === option.type
                ? 'border-emerald-500 bg-zinc-800'
                : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900'
            }`}
          >
            <div className="font-mono">
              <div className="text-emerald-400 text-sm">{option.nameEn}</div>
              <div className="text-lg text-zinc-100">{option.name}</div>
              <div className="text-xs text-zinc-500 mt-2">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
