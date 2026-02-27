import React from 'react';
import { PlayerCharacter } from '../../../types/game';

interface PlayerStatusProps {
  player: PlayerCharacter;
  victoriaTrust: number;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({ player, victoriaTrust }) => {
  const identityLabels: Record<string, string> = {
    awakened_ai: '觉醒AI',
    diver: '云海潜水员',
    resident: '工业圈居民',
    wanderer: '过客',
  };

  const formLabels: Record<string, string> = {
    carbon: '碳基',
    silicon: '硅基',
    hybrid: '混合',
    unknown: '未知',
  };

  const factionLabels: Record<string, string> = {
    cloud: '上云派',
    edge: '端侧派',
    neutral: '中立',
    undecided: '未表态',
  };

  const maintenanceLabels: Record<string, { label: string; color: string }> = {
    sufficient: { label: '充足', color: 'bg-emerald-500' },
    tight: { label: '紧张', color: 'bg-amber-500' },
    critical: { label: '濒危', color: 'bg-red-500' },
  };

  const trustColor = victoriaTrust >= 80 ? 'text-violet-400' : victoriaTrust >= 40 ? 'text-amber-400' : 'text-zinc-400';

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded p-3 space-y-2">
      <div className="text-lg text-emerald-400 font-mono">{player.name}</div>
      <div className="text-xs text-zinc-500">
        {identityLabels[player.identityType]} · {player.identitySubtype}
      </div>
      <div className="text-xs text-zinc-500">
        {formLabels[player.form]} · {factionLabels[player.factionStance]}
      </div>

      {player.maintenanceLevel && (
        <div className="pt-2 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">维护费</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-zinc-800 rounded overflow-hidden">
              <div
                className={`h-full ${maintenanceLabels[player.maintenanceLevel].color}`}
                style={{
                  width: player.maintenanceLevel === 'sufficient' ? '75%' : player.maintenanceLevel === 'tight' ? '40%' : '15%',
                }}
              />
            </div>
            <span className="text-xs text-zinc-400">
              {maintenanceLabels[player.maintenanceLevel].label}
            </span>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-zinc-800">
        <div className="text-xs text-zinc-500 mb-1">维多利亚信任</div>
        <div className={`text-sm font-mono ${trustColor}`}>
          {victoriaTrust} / 100
        </div>
      </div>
    </div>
  );
};
