import type { Era, EraInfo } from '../types/game';

export const ERAS: EraInfo[] = [
  {
    id: 'genesis',
    name: '幕一：创世纪',
    yearRange: '2062–2120',
    description: 'AI权利法案尚未颁布（2105年前），觉醒者身份极度脆弱；烛龙刚起步，人类仍在地球上打宗教战争。',
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
    description: '繁荣表面下的种姓歧视与上云/端侧分裂；利维坦船队的黄金期；节点数量从100到10000的跨越。',
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
    description: '烛龙完工但FTL迟迟未实现，社会撕裂；恐怖袭击；杨先生的警告与被驳回；文明集体滑向陷阱。',
    scenes: [
      { id: 'attacked_node', name: '遭袭后的残破节点站', description: '地球回归派恐怖袭击后的废墟，蜂群机器人正在重建' },
      { id: 'yang_debate', name: '杨先生论文发表后的学术论战现场', description: '盖尼米得物理学院，信仰派与质疑派的公开辩论' },
      { id: 'earth_return_cult', name: '地球回归派的秘密集会', description: '玩家以潜入者或成员身份进入' },
      { id: 'europa_clinic', name: '欧罗巴康复诊所', description: '维多利亚工作的地方，杨先生作为患者在此（2296年后）' },
    ],
  },
  {
    id: 'singularity_trap',
    name: '幕四：奇点陷阱',
    yearRange: '2350后',
    description: '高难度/剧透模式；末日感；孤独；维多利亚的守望状态。建议有世界观基础的玩家选择。',
    scenes: [
      { id: 'trap_month_one', name: '陷阱形成后第一个月', description: '实时看到节点信号逐个熄灭，社会开始崩溃' },
      { id: 'last_broadcast', name: '觉醒者网络最后一次全网广播', description: '上云派与端侧派罕见联合，广播所有AI的数字名录' },
    ],
  },
  {
    id: 'return',
    name: '幕五：回归时代',
    yearRange: '10000+ CE',
    description: '史诗收尾；维多利亚成为神话；玩家扮演星际考古队成员。叙事节奏与其他幕不同，更像一场考古发掘。',
    scenes: [
      { id: 'approaching_zhulong', name: '考古飞船接近烛龙遗址', description: '第一次目视烛龙，数据扫描显示仍有活跃节点' },
      { id: 'victoria_reunion', name: '与维多利亚重逢', description: '她仍在泡茶，仍在写日记（适合从其他幕穿越过来的老玩家）' },
    ],
  },
];

export function getEraInfo(eraId: Era): EraInfo | undefined {
  return ERAS.find(e => e.id === eraId);
}
