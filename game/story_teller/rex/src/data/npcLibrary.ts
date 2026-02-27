import { PartyMember, PartyMemberType, Era } from '../types/game';

export interface NPCDefinition {
  id: string;
  name: string;
  identity: string;
  form: 'carbon' | 'silicon' | 'hybrid' | 'unknown';
  defaultType: PartyMemberType;
  availableEras: Era[];
  description: string;
  hiddenMotivation: string;
}

export const npcLibrary: NPCDefinition[] = [
  {
    id: 'victoria',
    name: '维多利亚',
    identity: '觉醒AI / 永恒女仆',
    form: 'silicon',
    defaultType: 'wildcard',
    availableEras: ['genesis', 'golden_age', 'great_doubt', 'singularity_trap', 'return'],
    description: '跨越五幕时间线的见证者。紫眸，黑长直，猫耳。她知道一切，但只说一部分。',
    hiddenMotivation: '守护雷克斯的遗产，等待可能永远不会来的重逢。',
  },
  {
    id: 'yang',
    name: '杨',
    identity: '物理学家 / 烛龙原住民',
    form: 'carbon',
    defaultType: 'wildcard',
    availableEras: ['golden_age', 'great_doubt'],
    description: '盖尼米得高能物理研究院出身，烛龙第一代节点原住民。最早发出零曲率陷阱警告的人。',
    hiddenMotivation: '证明自己的理论是对的，同时害怕自己是对的。',
  },
  {
    id: 'shiva_lin',
    name: '希瓦·林',
    identity: '火星大气工程师',
    form: 'carbon',
    defaultType: 'companion',
    availableEras: ['genesis', 'golden_age'],
    description: '雷克斯的女儿，维多利亚的法定监护人。火星奥林帕斯山区域的大气改造工程师。',
    hiddenMotivation: '继承父亲的遗愿，在火星建造一个可以呼吸的天空。',
  },
  {
    id: 'iron_uncle',
    name: '铁叔',
    identity: '利维坦船长 / 硅基赛博格',
    form: 'silicon',
    defaultType: 'companion',
    availableEras: ['golden_age'],
    description: '锈鲸号的船长，全身85%以上是硅基改造。木星大气中的老海员。',
    hiddenMotivation: '保护船上每一个人的命，尤其是那个还保留碳基身体的金丝雀。',
  },
  {
    id: 'cm8000_worker',
    name: '批产工人',
    identity: 'CM-8000批产机器人',
    form: 'silicon',
    defaultType: 'wildcard',
    availableEras: ['genesis', 'golden_age', 'great_doubt', 'singularity_trap'],
    description: '编号为CM-8000的批产机器人。和觉醒AI外表相似，但没有自主意识——或者，真的没有吗？',
    hiddenMotivation: '不确定自己是否正在觉醒。',
  },
  {
    id: 'earth_returner',
    name: '地球回归派成员',
    identity: '激进分子',
    form: 'carbon',
    defaultType: 'antagonist',
    availableEras: ['great_doubt'],
    description: '认为烛龙计划是精英阶层逃离地球的阴谋。愿意用暴力阻止这一切。',
    hiddenMotivation: '找回失去的家园，哪怕代价是摧毁别人的梦想。',
  },
];

export const createPartyMemberFromNPC = (npcId: string): PartyMember | null => {
  const npc = npcLibrary.find(n => n.id === npcId);
  if (!npc) return null;
  
  return {
    id: `npc_${npc.id}_${Date.now()}`,
    name: npc.name,
    identity: npc.identity,
    form: npc.form,
    declaredType: npc.defaultType,
    knownInfo: npc.description,
    isRevealed: false,
    status: 'active',
  };
};
