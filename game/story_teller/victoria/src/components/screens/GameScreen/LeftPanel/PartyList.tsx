import React from 'react';
import { useGameStore } from '../../../../store/gameStore';
import type { PartyMember } from '../../../../types/game';
import { PARTY_TYPE_ICONS, PARTY_TYPE_NAMES, FORM_NAMES } from '../../../../data/party';
import { Panel } from '../../../ui';

const MemberTypeIcon: React.FC<{ member: PartyMember }> = ({ member }) => {
  if (member.status !== 'active') {
    return <span className="text-game-text-dim">[{member.status}]</span>;
  }
  
  if (member.isRevealed && member.revealedStance) {
    return <span className="text-game-text">{PARTY_TYPE_ICONS[member.revealedStance]}</span>;
  }
  
  const colorClass = 
    member.declaredType === 'companion' ? 'text-companion' :
    member.declaredType === 'antagonist' ? 'text-antagonist' :
    'text-wildcard';
  
  return <span className={colorClass}>{PARTY_TYPE_ICONS[member.declaredType]}</span>;
};

export const PartyList: React.FC = () => {
  const { party } = useGameStore();
  const [expandedMember, setExpandedMember] = React.useState<string | null>(null);

  if (party.length === 0) {
    return (
      <Panel title="同行者">
        <div className="text-game-text-dim text-sm text-center py-2">
          暂无同行者
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="同行者">
      <div className="space-y-1">
        {party.map((member) => (
          <div key={member.id}>
            <button
              onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
              className={`w-full text-left p-2 border transition-all ${
                member.status !== 'active' 
                  ? 'border-game-border opacity-50' 
                  : 'border-game-border hover:border-game-text-dim'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MemberTypeIcon member={member} />
                  <span className={`text-sm ${
                    member.status !== 'active' ? 'text-game-text-dim line-through' : 'text-game-text'
                  }`}>
                    {member.name}
                  </span>
                </div>
                <span className="text-game-text-dim text-xs">
                  {PARTY_TYPE_NAMES[member.declaredType]}
                </span>
              </div>
            </button>
            
            {expandedMember === member.id && (
              <div className="p-2 border border-game-border border-t-0 bg-black/30 text-xs">
                <div className="text-game-text-dim mb-1">
                  {member.identity} · {FORM_NAMES[member.form]}
                </div>
                {member.knownInfo && (
                  <div className="text-game-text">
                    {member.knownInfo}
                  </div>
                )}
                {member.statusNote && (
                  <div className="text-antagonist mt-1">
                    {member.statusNote}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
};
