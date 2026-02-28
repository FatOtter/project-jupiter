import React from 'react';
import { useGameStore } from '../../../../store/gameStore';
import { FORMS } from '../../../../types/game';
import { Panel } from '../../../ui';

const IDENTITY_NAMES: Record<string, string> = {
  awakened_ai: '觉醒AI',
  diver: '云海潜水员',
  resident: '木星居民',
  wanderer: '过客',
};

const FACTION_NAMES: Record<string, string> = {
  cloud: '上云派',
  edge: '端侧派',
  neutral: '中立',
  undecided: '未表态',
};

const ERA_NAMES: Record<string, string> = {
  genesis: '创世纪',
  golden_age: '黄金时代',
  great_doubt: '大质疑时代',
  singularity_trap: '奇点陷阱',
  return: '回归时代',
};

export const PlayerStatus: React.FC = () => {
  const { player, victoria, characterCreation } = useGameStore();

  if (!player && !characterCreation.isComplete) {
    const hasAnyInfo = characterCreation.name || characterCreation.identityType || characterCreation.form || characterCreation.era;
    
    return (
      <Panel title="身份核实中...">
        <div className="space-y-3 text-sm">
          <div className="text-game-text-dim italic">
            正在通过对话确认你的身份...
          </div>
          
          {hasAnyInfo && (
            <div className="space-y-1 border-t border-game-border pt-2 mt-2">
              {characterCreation.name && (
                <div className="text-game-text">
                  <span className="text-game-text-dim">名字：</span>
                  {characterCreation.name}
                </div>
              )}
              {characterCreation.identityType && (
                <div className="text-game-text">
                  <span className="text-game-text-dim">身份：</span>
                  {IDENTITY_NAMES[characterCreation.identityType] || characterCreation.identityType}
                </div>
              )}
              {characterCreation.form && (
                <div className="text-game-text">
                  <span className="text-game-text-dim">形态：</span>
                  {FORMS.find(f => f.id === characterCreation.form)?.name || characterCreation.form}
                </div>
              )}
              {characterCreation.factionStance && (
                <div className="text-game-text">
                  <span className="text-game-text-dim">派系：</span>
                  {FACTION_NAMES[characterCreation.factionStance] || characterCreation.factionStance}
                </div>
              )}
              {characterCreation.era && (
                <div className="text-game-text">
                  <span className="text-game-text-dim">时代：</span>
                  {ERA_NAMES[characterCreation.era] || characterCreation.era}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-3 pt-2 border-t border-game-border">
            <div className="flex items-center gap-2">
              <span className="text-victoria">V.</span>
              <span className="text-game-text-dim text-xs">信任值:</span>
              <span className="text-game-text text-xs">{victoria.trustLevel}/100</span>
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  if (!player) return null;

  const formName = FORMS.find(f => f.id === player.form)?.name || player.form;
  const factionName = FACTION_NAMES[player.factionStance] || player.factionStance;

  return (
    <Panel title="角色状态">
      <div className="space-y-2 text-sm">
        <div className="text-game-text font-bold text-base">{player.name}</div>
        <div className="text-game-text-dim">
          {IDENTITY_NAMES[player.identityType] || player.identityType}
          {' · '}{formName}
        </div>
        <div className="text-game-text-dim">派系: {factionName}</div>
        
        {player.identityType === 'awakened_ai' && (
          <div className="mt-2 pt-2 border-t border-game-border">
            <div className="flex items-center gap-2">
              <span className="text-game-text-dim">维护费:</span>
              <div className="flex-1 h-2 bg-game-border rounded overflow-hidden">
                <div 
                  className={`h-full ${
                    player.maintenanceLevel === 'sufficient' ? 'bg-companion' :
                    player.maintenanceLevel === 'tight' ? 'bg-wildcard' : 'bg-antagonist'
                  }`}
                  style={{ 
                    width: player.maintenanceLevel === 'sufficient' ? '70%' :
                           player.maintenanceLevel === 'tight' ? '40%' : '15%' 
                  }}
                />
              </div>
              <span className="text-xs text-game-text-dim">
                {player.maintenanceLevel === 'sufficient' && '充足'}
                {player.maintenanceLevel === 'tight' && '紧张'}
                {player.maintenanceLevel === 'critical' && '濒危'}
              </span>
            </div>
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-game-border">
          <div className="flex items-center gap-2">
            <span className="text-victoria">V.</span>
            <span className="text-game-text-dim text-xs">信任值:</span>
            <span className="text-game-text text-xs">{victoria.trustLevel}/100</span>
          </div>
        </div>
      </div>
    </Panel>
  );
};
