import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { FORMS, PARTY_MEMBER_TYPES } from '../../../types/game';
import type { Form, PartyMemberType } from '../../../types/game';
import { FORM_NAMES, PARTY_TYPE_NAMES } from '../../../data/party';
import { Button, Input, Select, Panel } from '../../ui';

export const PartyCreation: React.FC = () => {
  const { party, addPartyMember, removePartyMember, setCurrentStep } = useGameStore();
  
  const [showForm, setShowForm] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newIdentity, setNewIdentity] = React.useState('');
  const [newForm, setNewForm] = React.useState<Form>('silicon');
  const [newType, setNewType] = React.useState<PartyMemberType>('companion');
  const [newBackground, setNewBackground] = React.useState('');

  const handleAddMember = () => {
    if (!newName.trim() || !newIdentity.trim()) return;
    
    if (party.length >= 3) return;

    const newMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName.trim(),
      identity: newIdentity.trim(),
      form: newForm,
      declaredType: newType,
      knownInfo: newBackground.trim(),
      isRevealed: false,
      status: 'active' as const,
    };
    
    addPartyMember(newMember);
    setNewName('');
    setNewIdentity('');
    setNewBackground('');
    setShowForm(false);
  };

  const handleNext = () => {
    setCurrentStep(4);
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-game-text border-b border-game-border pb-2">
        同行者创建（可选）
      </h2>

      <div className="text-game-text-dim text-sm">
        你可以创建最多3名同行者。同行者由AI DM自主驱动，有自己的动机和秘密。
      </div>

      <Panel title={`同行者列表 (${party.length}/3)`}>
        {party.length === 0 ? (
          <div className="text-game-text-dim text-center py-4">
            暂无同行者
          </div>
        ) : (
          <div className="space-y-2">
            {party.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 border border-game-border"
              >
                <div>
                  <span className="text-game-text font-bold">{member.name}</span>
                  <span className="text-game-text-dim ml-2">
                    {member.identity} · {FORM_NAMES[member.form]} · {PARTY_TYPE_NAMES[member.declaredType]}
                  </span>
                </div>
                <button
                  onClick={() => removePartyMember(member.id)}
                  className="text-antagonist hover:underline text-sm"
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {party.length < 3 && !showForm && (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          + 添加同行者
        </Button>
      )}

      {showForm && (
        <Panel title="新建同行者">
          <div className="space-y-4">
            <Input
              label="名称"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="同行者名称..."
            />

            <Input
              label="身份/职业"
              value={newIdentity}
              onChange={(e) => setNewIdentity(e.target.value)}
              placeholder="一行描述..."
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="形态"
                value={newForm}
                onChange={(e) => setNewForm(e.target.value as Form)}
                options={FORMS.map(f => ({ value: f.id, label: f.name }))}
              />

              <Select
                label="类型"
                value={newType}
                onChange={(e) => setNewType(e.target.value as PartyMemberType)}
                options={PARTY_MEMBER_TYPES.map(t => ({ value: t.id, label: `${t.icon} ${t.name}` }))}
              />
            </div>

            <Input
              label="一句话背景（选填）"
              value={newBackground}
              onChange={(e) => setNewBackground(e.target.value)}
              placeholder="DM将以此为基础扩展隐藏设定..."
            />

            <div className="flex gap-2">
              <Button onClick={handleAddMember} disabled={!newName.trim() || !newIdentity.trim()}>
                确认添加
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                取消
              </Button>
            </div>
          </div>
        </Panel>
      )}

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
