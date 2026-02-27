import { MilestoneId, Era } from '../types/game';

export interface MilestoneConfig {
  id: MilestoneId;
  name: string;
  description: string;
  availableEras: Era[] | 'all';
  category: 'universal' | 'era_specific' | 'party';
}

export const milestones: Record<MilestoneId, MilestoneConfig> = {
  last_tea: {
    id: 'last_tea',
    name: '最后一杯茶',
    description: '升级仪式，向旧机体告别。',
    category: 'universal',
    availableEras: 'all',
  },
  broadcast_storm: {
    id: 'broadcast_storm',
    name: '广播风暴',
    description: 'AI版情绪崩溃，维多利亚成为稳定锚点。',
    category: 'universal',
    availableEras: 'all',
  },
  caste_confrontation: {
    id: 'caste_confrontation',
    name: '种姓对峙',
    description: '一次无法回避的种姓歧视正面冲突。',
    category: 'universal',
    availableEras: 'all',
  },
  yang_post: {
    id: 'yang_post',
    name: '杨的帖子',
    description: '维多利亚翻出2162年那段技术频道对话。',
    category: 'era_specific',
    availableEras: ['golden_age'],
  },
  ascending_choice: {
    id: 'ascending_choice',
    name: '飞升抉择',
    description: '碳基角色重伤，面临硅基改造抉择。',
    category: 'era_specific',
    availableEras: ['golden_age', 'great_doubt'],
  },
  yang_paper: {
    id: 'yang_paper',
    name: '杨的论文',
    description: '论文发表，被驳回，杨先生的学术身亡。',
    category: 'era_specific',
    availableEras: ['great_doubt'],
  },
  node_attack: {
    id: 'node_attack',
    name: '节点遭袭',
    description: '地球回归派袭击，是逃跑还是协助防御？',
    category: 'era_specific',
    availableEras: ['great_doubt'],
  },
  node_silence: {
    id: 'node_silence',
    name: '节点静默',
    description: '实时看着节点信号一个个变为静默。',
    category: 'era_specific',
    availableEras: ['singularity_trap'],
  },
  last_broadcast: {
    id: 'last_broadcast',
    name: '最后一次广播',
    description: '觉醒者网络最后一次全网广播，所有AI的数字名录。',
    category: 'era_specific',
    availableEras: ['singularity_trap'],
  },
  companion_betrayal: {
    id: 'companion_betrayal',
    name: '同伴背叛',
    description: '同伴/神秘人物揭示真实立场并背叛。',
    category: 'party',
    availableEras: 'all',
  },
  antagonist_alliance: {
    id: 'antagonist_alliance',
    name: '敌对者结盟',
    description: '共同危机下敌对者临时结盟。',
    category: 'party',
    availableEras: 'all',
  },
  wildcard_revealed: {
    id: 'wildcard_revealed',
    name: '神秘人物揭晓',
    description: '神秘人物立场正式揭晓。',
    category: 'party',
    availableEras: 'all',
  },
  companion_sacrifice: {
    id: 'companion_sacrifice',
    name: '同伴牺牲',
    description: '同行者为玩家牺牲。',
    category: 'party',
    availableEras: 'all',
  },
};

export const milestoneList = Object.values(milestones);
