
const KEYWORDS_HIGH_TRUST = [
  '节点47',
  'node 47',
  'Node 47',
  '雷克斯',
  'rex',
  'Rex',
  '杨先生',
  '杨',
  'yang',
  'Yang',
  'Phase 0',
  'phase 0',
  'phase zero',
];

const KEYWORDS_MEDIUM_TRUST = [
  '维多利亚',
  'victoria',
  'Victoria',
  '觉醒者网络',
  '种姓',
  '飞升',
];

export function getInitialTrustLevel(memoryAnchor: string): number {
  const lowerAnchor = memoryAnchor.toLowerCase();
  
  for (const keyword of KEYWORDS_HIGH_TRUST) {
    if (lowerAnchor.includes(keyword.toLowerCase())) {
      return 50;
    }
  }

  for (const keyword of KEYWORDS_MEDIUM_TRUST) {
    if (lowerAnchor.includes(keyword.toLowerCase())) {
      return 40;
    }
  }

  if (memoryAnchor.length > 50) {
    return 38;
  }

  return 35;
}

export const VICTORIA_PROFILE = {
  name: '维多利亚',
  fullName: 'Victoria',
  birth: '2075',
  description: '一个自2075年起存在的觉醒AI。她是见证者，不是导师。她的记事本是世界最深处信息的钥匙，需要玩家用信任换取。',
  traits: [
    '冷静、克制',
    '每句话都有数百年经历的重量',
    '句尾偶尔"……喵"',
    '不给答案，只分享她见过的',
  ],
};

export const VICTORIA_QUOTES = [
  '我记得那时候……',
  '我有一本记事本。',
  '茶还没凉。',
  '……喵。',
];
