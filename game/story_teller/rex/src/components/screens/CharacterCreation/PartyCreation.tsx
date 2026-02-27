import React, { useState } from 'react';
import { PartyMember, PartyMemberType, Form } from '../../../types/game';
import { npcLibrary, createPartyMemberFromNPC } from '../../../data/npcLibrary';
import { Button } from '../../ui';

interface PartyCreationProps {
  onComplete: (party: PartyMember[]) => void;
  onBack: () => void;
  selectedEra: string | null;
}

export const PartyCreation: React.FC<PartyCreationProps> = ({
  onComplete,
  onBack,
  selectedEra,
}) => {
  const [party, setParty] = useState<PartyMember[]>([]);
  const [mode, setMode] = useState<'choose' | 'manual' | 'npc'>('choose');
  const [manualForm, setManualForm] = useState({
    name: '',
    identity: '',
    form: 'carbon' as Form,
    type: 'companion' as PartyMemberType,
  });

  const availableNPCs = selectedEra
    ? npcLibrary.filter((npc) => npc.availableEras.includes(selectedEra as any))
    : [];

  const addManualMember = () => {
    if (!manualForm.name.trim() || party.length >= 3) return;

    const member: PartyMember = {
      id: `manual_${Date.now()}`,
      name: manualForm.name.trim(),
      identity: manualForm.identity.trim() || '未知身份',
      form: manualForm.form,
      declaredType: manualForm.type,
      knownInfo: '',
      isRevealed: false,
      status: 'active',
    };

    setParty([...party, member]);
    setManualForm({ name: '', identity: '', form: 'carbon', type: 'companion' });
    setMode('choose');
  };

  const addNPCMember = (npcId: string) => {
    if (party.length >= 3) return;
    const member = createPartyMemberFromNPC(npcId);
    if (member) {
      setParty([...party, member]);
    }
  };

  const removeMember = (memberId: string) => {
    setParty(party.filter((m) => m.id !== memberId));
  };

  const getTypeIcon = (type: PartyMemberType) => {
    switch (type) {
      case 'companion': return '[▲]';
      case 'antagonist': return '[▼]';
      case 'wildcard': return '[?]';
    }
  };

  const getTypeColor = (type: PartyMemberType) => {
    switch (type) {
      case 'companion': return 'text-emerald-400';
      case 'antagonist': return 'text-red-400';
      case 'wildcard': return 'text-amber-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg text-emerald-400 font-mono">创建同行者</h2>
        <p className="text-sm text-zinc-500 mt-1">
          最多3名同行者。可以跳过此步骤。
        </p>
      </div>

      {/* Current party */}
      {party.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-zinc-400">当前同行者 ({party.length}/3)</div>
          <div className="space-y-2">
            {party.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              >
                <div className="font-mono">
                  <span className={getTypeColor(member.declaredType)}>
                    {getTypeIcon(member.declaredType)}
                  </span>
                  <span className="ml-2 text-zinc-200">{member.name}</span>
                  <span className="ml-2 text-zinc-500 text-sm">{member.identity}</span>
                </div>
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-zinc-500 hover:text-red-400 text-sm"
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add member */}
      {party.length < 3 && (
        <div className="space-y-4">
          {mode === 'choose' && (
            <div className="flex gap-3">
              <Button onClick={() => setMode('manual')} variant="secondary">
                手动创建
              </Button>
              <Button onClick={() => setMode('npc')} variant="secondary">
                从NPC库召唤
              </Button>
            </div>
          )}

          {mode === 'manual' && (
            <div className="bg-zinc-800 border border-zinc-700 rounded p-4 space-y-4">
              <div className="text-sm text-zinc-400">手动创建同行者</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">名字 *</label>
                  <input
                    type="text"
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-emerald-400 font-mono text-sm"
                    placeholder="角色名"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">身份/职业</label>
                  <input
                    type="text"
                    value={manualForm.identity}
                    onChange={(e) => setManualForm({ ...manualForm, identity: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-emerald-400 font-mono text-sm"
                    placeholder="一行描述"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">形态</label>
                  <select
                    value={manualForm.form}
                    onChange={(e) => setManualForm({ ...manualForm, form: e.target.value as Form })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-emerald-400 font-mono text-sm"
                  >
                    <option value="carbon">碳基</option>
                    <option value="silicon">硅基</option>
                    <option value="hybrid">混合</option>
                    <option value="unknown">未知</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">类型</label>
                  <select
                    value={manualForm.type}
                    onChange={(e) => setManualForm({ ...manualForm, type: e.target.value as PartyMemberType })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-emerald-400 font-mono text-sm"
                  >
                    <option value="companion">同伴 [▲]</option>
                    <option value="antagonist">敌对者 [▼]</option>
                    <option value="wildcard">神秘人物 [?]</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addManualMember} size="sm">
                  添加
                </Button>
                <Button onClick={() => setMode('choose')} variant="ghost" size="sm">
                  取消
                </Button>
              </div>
            </div>
          )}

          {mode === 'npc' && (
            <div className="bg-zinc-800 border border-zinc-700 rounded p-4 space-y-4">
              <div className="text-sm text-zinc-400">从NPC库召唤</div>
              
              {availableNPCs.length === 0 ? (
                <div className="text-sm text-zinc-500">
                  当前时代没有可用的预设NPC，请选择手动创建。
                </div>
              ) : (
                <div className="space-y-2">
                  {availableNPCs.map((npc) => (
                    <button
                      key={npc.id}
                      onClick={() => addNPCMember(npc.id)}
                      disabled={party.some((p) => p.name === npc.name)}
                      className="w-full text-left p-3 border border-zinc-700 rounded hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-mono">
                        <div className="flex items-center gap-2">
                          <span className={getTypeColor(npc.defaultType)}>
                            {getTypeIcon(npc.defaultType)}
                          </span>
                          <span className="text-zinc-200">{npc.name}</span>
                          <span className="text-zinc-500 text-sm">{npc.identity}</span>
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">{npc.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <Button onClick={() => setMode('choose')} variant="ghost" size="sm">
                返回
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button onClick={onBack} variant="secondary">
          返回
        </Button>
        <Button onClick={() => onComplete(party)}>
          {party.length > 0 ? '下一步：选择时代' : '跳过，下一步'}
        </Button>
      </div>
    </div>
  );
};
