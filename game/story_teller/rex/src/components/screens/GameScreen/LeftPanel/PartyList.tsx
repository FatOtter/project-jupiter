import React, { useState } from 'react';
import { PartyMember, PartyMemberType } from '../../../types/game';

interface PartyListProps {
  party: PartyMember[];
}

export const PartyList: React.FC<PartyListProps> = ({ party }) => {
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  if (party.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded p-3">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">同行者</div>
        <div className="text-sm text-zinc-600">无</div>
      </div>
    );
  }

  const getTypeIcon = (member: PartyMember): string => {
    if (member.isRevealed) {
      return member.revealedStance === 'companion' ? '[▲]' : '[▼]';
    }
    switch (member.declaredType) {
      case 'companion': return '[▲]';
      case 'antagonist': return member.isRevealed ? '[▼]' : '[?]';
      case 'wildcard': return '[?]';
    }
  };

  const getTypeColor = (member: PartyMember): string => {
    if (member.isRevealed) {
      return member.revealedStance === 'companion' ? 'text-emerald-400' : 'text-red-400';
    }
    switch (member.declaredType) {
      case 'companion': return 'text-emerald-400';
      case 'antagonist': return 'text-amber-400';
      case 'wildcard': return 'text-amber-400';
    }
  };

  const getStatusLabel = (member: PartyMember): string | null => {
    switch (member.status) {
      case 'dead': return '死亡';
      case 'left': return '离队';
      case 'betrayed': return '叛变';
      default: return null;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded p-3">
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">同行者</div>
      <div className="space-y-1">
        {party.map((member) => {
          const statusLabel = getStatusLabel(member);
          const isExpanded = expandedMember === member.id;
          
          return (
            <div key={member.id}>
              <button
                onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                disabled={!member.knownInfo}
                className={`w-full text-left py-1 px-2 rounded hover:bg-zinc-800 ${
                  member.status !== 'active' ? 'opacity-50' : ''
                }`}
              >
                <span className={getTypeColor(member)}>{getTypeIcon(member)}</span>
                <span className="ml-2 text-zinc-300">{member.name}</span>
                {statusLabel && (
                  <span className="ml-2 text-xs text-zinc-500">[{statusLabel}]</span>
                )}
              </button>
              
              {isExpanded && member.knownInfo && (
                <div className="mt-1 ml-6 p-2 bg-zinc-800 rounded text-xs text-zinc-400">
                  {member.knownInfo}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
