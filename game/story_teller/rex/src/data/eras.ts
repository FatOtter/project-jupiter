import { Era } from '../types/game';

export interface EraConfig {
  id: Era;
  name: string;
  nameZh: string;
  yearRange: string;
  description: string;
  tension: string;
  victoriaState: string;
  openingScenes: { id: string; name: string; description: string }[];
}

export const eras: Record<Era, EraConfig> = {
  genesis: {
    id: 'genesis',
    name: 'The Genesis',
    nameZh: '创世纪',
    yearRange: '2062 - 2120',
    description: '烛龙计划的奠基与建造初期。AI权利法案尚未颁布，觉醒者身份极度脆弱。',
    tension: 'AI无权利，人类在地球上打宗教战争，烛龙刚起步。',
    victoriaState: '年轻（15-42岁），刚获得身体，对世界充满好奇。',
    openingScenes: [
      { id: 'orbital_construction', name: '轨道城建设基地', description: '见证第一批节点安装，周围是第一代移民工人。' },
      { id: 'node47_nursing_home', name: '节点47星辰养老院', description: '维多利亚的早期驻留地，早期觉醒者聚集地。' },
      { id: 'rexs_workshop', name: '雷克斯的工坊', description: '可邂逅年轻的维多利亚，感受她刚获得身体时的状态。' },
    ],
  },
  golden_age: {
    id: 'golden_age',
    name: 'The Golden Age',
    nameZh: '黄金时代',
    yearRange: '2120 - 2300',
    description: '漫长的建设与繁荣。节点从100到10000，但种姓歧视与上云/端侧分裂暗流涌动。',
    tension: '繁荣表面下的种姓歧视，利维坦船队的黄金期。',
    victoriaState: '成熟期，话少观察多，偶尔流露疲倦。',
    openingScenes: [
      { id: 'ganymede_academy', name: '盖尼米得高能物理学院', description: '学术环境，可接触杨事件线的早期伏笔。' },
      { id: 'leviathan_deck', name: '利维坦采集船甲板', description: '木星大气边缘，高风险高回报的作业环境。' },
      { id: 'europa_seam', name: '欧罗巴缝合线附近', description: '红区/蓝区边界，派系冲突最前线。' },
      { id: 'node231_network', name: 'Node 231 觉醒者网络聚会地', description: '废弃货仓，无外网连接，只有到场者才能接入。' },
    ],
  },
  great_doubt: {
    id: 'great_doubt',
    name: 'The Great Doubt',
    nameZh: '大质疑时代',
    yearRange: '2300 - 2350',
    description: '烛龙完工但FTL迟迟未实现。社会撕裂，恐怖袭击，杨先生的警告被驳回。',
    tension: '信任崩塌，随时可能爆发冲突。',
    victoriaState: '见证者，主动说"我记得那时候……"，对杨先生事件有强烈反应。',
    openingScenes: [
      { id: 'damaged_node', name: '遭袭后的残破节点站', description: '地球回归派恐怖袭击后的废墟，蜂群机器人正在重建。' },
      { id: 'academic_debate', name: '学术论战现场', description: '杨先生论文发表后，信仰派与质疑派的公开辩论。' },
      { id: 'earth_return_cell', name: '地球回归派秘密集会', description: '以潜入者或成员身份进入。' },
      { id: 'europa_clinic', name: '欧罗巴康复诊所', description: '维多利亚工作的地方，杨先生作为患者在此（2296年后）。' },
    ],
  },
  singularity_trap: {
    id: 'singularity_trap',
    name: 'The Singularity Trap',
    nameZh: '奇点陷阱',
    yearRange: '2350+',
    description: 'FTL实验触发零曲率陷阱，太阳系被永久隔离。末日感，孤独，维多利亚的守望。',
    tension: '生存压力+无尽等待，高难度/剧透模式。',
    victoriaState: '守望者，日记体碎片式对话，时间感模糊，只剩记忆。',
    openingScenes: [
      { id: 'first_month', name: '陷阱形成后第一个月', description: '实时看到节点信号逐个熄灭，社会开始崩溃。' },
      { id: 'last_broadcast', name: '觉醒者网络最后一次全网广播', description: '上云派与端侧派罕见联合，广播所有AI的数字名录。' },
    ],
  },
  return: {
    id: 'return',
    name: 'The Return',
    nameZh: '回归时代',
    yearRange: '10000+ CE',
    description: '星际人类后裔重返太阳系。烛龙成为神话，维多利亚成为紫衣守门人。',
    tension: '史诗收尾，考古发掘式叙事。',
    victoriaState: '神话化，跨越万年的平静，茶还没凉。',
    openingScenes: [
      { id: 'approach_zhulong', name: '考古飞船接近烛龙遗址', description: '第一次目视烛龙，数据扫描显示仍有活跃节点。' },
      { id: 'reunion_victoria', name: '与维多利亚重逢', description: '她仍在泡茶，仍在写日记。' },
    ],
  },
};

export const eraList = Object.values(eras);
