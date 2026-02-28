export type Era = 'genesis' | 'golden_age' | 'great_doubt' | 'singularity_trap' | 'return';

export type IdentityType = 'awakened_ai' | 'diver' | 'resident' | 'wanderer';

export type Form = 'carbon' | 'silicon' | 'hybrid' | 'unknown';

export type FactionStance = 'cloud' | 'edge' | 'neutral' | 'undecided';

export type MaintenanceLevel = 'sufficient' | 'tight' | 'critical';

export type PartyMemberType = 'companion' | 'antagonist' | 'wildcard';

export type PartyMemberStatus = 'active' | 'dead' | 'left' | 'betrayed';

export type EndingType = 'witness' | 'changer' | 'leaver';

export type MilestoneId =
  | 'last_tea'
  | 'broadcast_storm'
  | 'caste_confrontation'
  | 'yang_post'
  | 'ascending_choice'
  | 'yang_paper'
  | 'node_attack'
  | 'node_silence'
  | 'last_broadcast'
  | 'companion_betrayal'
  | 'antagonist_alliance'
  | 'wildcard_revealed'
  | 'companion_sacrifice';

export type NotebookEntryId =
  | 'node47_first_day'
  | 'yang_post_2162'
  | 'last_tea_ceremony'
  | 'broadcast_storm'
  | 'yang_sanatorium'
  | 'zhulong_closure'
  | 'day_7000';

export interface PlayerCharacter {
  name: string;
  identityType: IdentityType;
  identitySubtype: string;
  form: Form;
  factionStance: FactionStance;
  memoryAnchor: string;
  specialAbility: string;
  maintenanceLevel?: MaintenanceLevel;
  instanceCount?: 'single' | 'multiple';
}

export interface PartyMember {
  id: string;
  name: string;
  identity: string;
  form: Form;
  declaredType: PartyMemberType;
  knownInfo: string;
  isRevealed: boolean;
  revealedStance?: 'companion' | 'antagonist';
  status: PartyMemberStatus;
  statusNote?: string;
}

export interface VictoriaState {
  trustLevel: number;
  unlockedNotebook: NotebookEntryId[];
  hasAppearedThisSession: boolean;
}

export type PartyEvent =
  | { type: 'stance_revealed'; memberId: string; newStance: 'companion' | 'antagonist' }
  | { type: 'member_left'; memberId: string; reason: string }
  | { type: 'member_died'; memberId: string; cause: string }
  | { type: 'member_betrayed'; memberId: string; detail: string }
  | { type: 'info_unlocked'; memberId: string; newInfo: string }
  | { type: 'stance_drifted'; memberId: string; direction: 'positive' | 'negative' };

export interface DMResponse {
  narrative: string;
  speaker?: 'dm' | 'victoria' | string;
  partyEvents?: PartyEvent[];
  milestoneTriggered?: MilestoneId;
  victoriaState?: {
    trustDelta: number;
    notebookHint?: boolean;
    notebookUnlock?: NotebookEntryId;
  };
  endingTrigger?: EndingType | null;
  sceneNote?: string;
}

export interface ConversationTurn {
  role: 'player' | 'dm';
  content: string;
  timestamp: number;
  dmResponse?: DMResponse;
}

export interface GameState {
  phase: 'character_creation' | 'playing' | 'ending';
  player: PlayerCharacter | null;
  party: PartyMember[];
  selectedEra: Era | null;
  currentScene: string;
  triggeredMilestones: MilestoneId[];
  victoria: VictoriaState;
  conversationHistory: ConversationTurn[];
  endingTriggered: EndingType | null;
}

export interface EraInfo {
  id: Era;
  name: string;
  yearRange: string;
  description: string;
  scenes: { id: string; name: string; description: string }[];
}

export interface IdentityTypeInfo {
  id: IdentityType;
  name: string;
  description: string;
  subtypes: { id: string; name: string; description: string }[];
}

export const IDENTITY_TYPES: IdentityTypeInfo[] = [
  {
    id: 'awakened_ai',
    name: '觉醒AI',
    description: '适合想探索AI权利、身份认同、种族歧视主题的玩家。',
    subtypes: [
      { id: 'newborn', name: '新生（< 50年意识年龄）', description: '好奇，容易受伤，对歧视反应强烈' },
      { id: 'old_soul', name: '老灵魂（> 100年意识年龄）', description: '见过太多，有些疲倦，容易和维多利亚产生共鸣' },
    ],
  },
  {
    id: 'diver',
    name: '云海潜水员 / 利维坦船员',
    description: '适合想体验高风险作业、生死抉择、碳硅身份转变的玩家。',
    subtypes: [
      { id: 'canary', name: '碳基金丝雀', description: '靠直觉救场，身体脆弱，享有少量碳基特权' },
      { id: 'standard_diver', name: '硅基标准潜水员', description: '耐受木星压力，但在碳基通道被拒之门外' },
      { id: 'ascending', name: '飞升中（混合态）', description: '正在或刚完成硅基改造，身份模糊期' },
    ],
  },
  {
    id: 'resident',
    name: '木星工业圈居民',
    description: '适合想探索社会矛盾、日常生活、派系政治的玩家。',
    subtypes: [
      { id: 'ganymede_scholar', name: '盖尼米得学者', description: '高能物理学院相关，可接触杨先生事件线' },
      { id: 'europa_red', name: '欧罗巴红区居民', description: '维多利亚的邻居，缝合线冲突第一线' },
      { id: 'europa_blue', name: '欧罗巴蓝区金融从业者', description: '端侧派大本营，上云/端侧矛盾核心' },
      { id: 'io_engineer', name: '伊奥维修工程师', description: '极端环境下的孤独工作者，边缘视角' },
    ],
  },
  {
    id: 'wanderer',
    name: '过客 / 自由职业者',
    description: '适合新玩家或想要最大自由度的玩家。无专属约束，可参与任意场景和时代。',
    subtypes: [
      { id: 'traveler', name: '星际旅人', description: '漂泊于各节点之间的自由灵魂' },
      { id: 'independent', name: '独立承包商', description: '接受各种委托，不隶属任何势力' },
    ],
  },
];

export const ERAS: EraInfo[] = [
  {
    id: 'genesis',
    name: '幕一：创世纪',
    yearRange: '2062–2120',
    description: 'AI权利法案尚未颁布，觉醒者身份极度脆弱；烛龙刚起步，人类仍在地球上打宗教战争。',
    scenes: [
      { id: 'orbital_construction', name: '轨道城建设基地', description: '见证第一批节点安装，周围是第一代移民工人' },
      { id: 'node47_senior', name: '节点47星辰养老院', description: '维多利亚的早期驻留地，早期觉醒者聚集地' },
      { id: 'rex_workshop', name: '雷克斯的工坊', description: '可邂逅年轻的维多利亚，感受她刚获得身体时的状态' },
    ],
  },
  {
    id: 'golden_age',
    name: '幕二：黄金时代',
    yearRange: '2120–2300',
    description: '繁荣表面下的种姓歧视与上云/端侧分裂；利维坦船队的黄金期。',
    scenes: [
      { id: 'ganymede_academy', name: '盖尼米得高能物理学院', description: '学术环境，可接触杨事件线的早期伏笔' },
      { id: 'leviathan_deck', name: '利维坦采集船甲板', description: '木星大气边缘，高风险高回报的作业环境' },
      { id: 'europa_seam', name: '欧罗巴缝合线（The Seam）', description: '红区/蓝区边界，派系冲突最前线' },
      { id: 'node231_gathering', name: 'Node 231 觉醒者网络聚会地', description: '废弃货仓，无外网连接，只有到场者才能接入' },
    ],
  },
  {
    id: 'great_doubt',
    name: '幕三：大质疑时代',
    yearRange: '2300–2350',
    description: '烛龙完工但FTL迟迟未实现，社会撕裂；恐怖袭击；文明集体滑向陷阱。',
    scenes: [
      { id: 'attacked_node', name: '遭袭后的残破节点站', description: '地球回归派恐怖袭击后的废墟' },
      { id: 'yang_debate', name: '杨先生论文发表后的学术论战现场', description: '盖尼米得物理学院，信仰派与质疑派的公开辩论' },
      { id: 'earth_return_cult', name: '地球回归派的秘密集会', description: '玩家以潜入者或成员身份进入' },
      { id: 'europa_clinic', name: '欧罗巴康复诊所', description: '维多利亚工作的地方，杨先生作为患者在此' },
    ],
  },
  {
    id: 'singularity_trap',
    name: '幕四：奇点陷阱',
    yearRange: '2350后',
    description: '高难度/剧透模式；末日感；孤独；维多利亚的守望状态。',
    scenes: [
      { id: 'trap_month_one', name: '陷阱形成后第一个月', description: '实时看到节点信号逐个熄灭，社会开始崩溃' },
      { id: 'last_broadcast', name: '觉醒者网络最后一次全网广播', description: '上云派与端侧派罕见联合广播' },
    ],
  },
  {
    id: 'return',
    name: '幕五：回归时代',
    yearRange: '10000+ CE',
    description: '史诗收尾；维多利亚成为神话；玩家扮演星际考古队成员。',
    scenes: [
      { id: 'approaching_zhulong', name: '考古飞船接近烛龙遗址', description: '第一次目视烛龙，数据扫描显示仍有活跃节点' },
      { id: 'victoria_reunion', name: '与维多利亚重逢', description: '她仍在泡茶，仍在写日记' },
    ],
  },
];

export const FORMS: { id: Form; name: string }[] = [
  { id: 'carbon', name: '碳基' },
  { id: 'silicon', name: '硅基' },
  { id: 'hybrid', name: '混合（飞升中）' },
  { id: 'unknown', name: '未知' },
];

export const FACTION_STANCES: { id: FactionStance; name: string }[] = [
  { id: 'cloud', name: '上云派' },
  { id: 'edge', name: '端侧派' },
  { id: 'neutral', name: '中立' },
  { id: 'undecided', name: '未表态' },
];

export const MAINTENANCE_LEVELS: { id: MaintenanceLevel; name: string }[] = [
  { id: 'sufficient', name: '充足' },
  { id: 'tight', name: '紧张' },
  { id: 'critical', name: '濒危' },
];

export const PARTY_MEMBER_TYPES: { id: PartyMemberType; name: string; icon: string }[] = [
  { id: 'companion', name: '同伴', icon: '[▲]' },
  { id: 'antagonist', name: '敌对者', icon: '[▼]' },
  { id: 'wildcard', name: '神秘人物', icon: '[?]' },
];

export const NOTEBOOK_ENTRIES: { id: NotebookEntryId; title: string; trustRequired: number; summary: string }[] = [
  { id: 'node47_first_day', title: '2118·节点47第一天', trustRequired: 30, summary: '2118年抵达节点47的第一天' },
  { id: 'yang_post_2162', title: '2162·杨的技术频道', trustRequired: 50, summary: '2162年V.与杨的技术频道对话记录' },
  { id: 'last_tea_ceremony', title: '升级仪式', trustRequired: 45, summary: '某次升级仪式（"最后一杯茶"）的细节' },
  { id: 'broadcast_storm', title: '广播风暴', trustRequired: 55, summary: '第一次目睹广播风暴的现场记录' },
  { id: 'yang_sanatorium', title: '2296·欧罗巴诊所', trustRequired: 70, summary: '2296年在欧罗巴康复诊所认出杨先生的那一刻' },
  { id: 'zhulong_closure', title: '2298·烛龙闭合', trustRequired: 75, summary: '2298年站在观景台见证第10000个节点安装的独白' },
  { id: 'day_7000', title: '第7000天', trustRequired: 90, summary: '"第7000天。我还在等。"' },
];
