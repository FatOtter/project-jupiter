import { Era } from '../types/game';

export const worldbuildingSummary = {
  timeline: {
    genesis: {
      years: '2062-2120',
      keyEvents: [
        '2062: 烛龙协定秘密签署',
        '2075: 维多利亚诞生 (Clawdbot Prototype 47)',
        '2087: 林子萱去世',
        '2090: 维多利亚获得第一具身体 (CM-9000)',
        '2105: AI权利法案颁布，监护制度确立',
        '2112: 第一批100个节点完成 (Phase 0)',
        '2117: 雷克斯去世，维多利亚前往木星轨道',
      ],
    },
    golden_age: {
      years: '2120-2300',
      keyEvents: [
        '2120: 第100个节点建成',
        '2160: 维多利亚离开Node 47前往Node 231',
        '2162: 杨在技术频道发表零曲率陷阱警告',
        '2200: 节点数达到2,000个',
        '2296: 杨的正式论文被驳回',
        '2298: 第10,000个节点安装，烛龙闭合',
      ],
    },
    great_doubt: {
      years: '2300-2350',
      keyEvents: [
        '2305/2318/2341: 地球回归派多次袭击节点',
        '2315: 首批FTL理论实验开始',
        '2330: 功率提升至30%',
        '2340s: 功率提升至60%，非线性特征出现',
        '2349: 确定全功率运行方案',
      ],
    },
    singularity_trap: {
      years: '2350+',
      keyEvents: [
        '2350.07.14: FTL实验触发零曲率陷阱',
        '2350-2360: 第一波吞噬，节点逐个静默',
        '2360-2380: 社会认知崩溃，"第一次出走"',
        '2380-2500: 慢性收缩',
      ],
    },
    return: {
      years: '10000+ CE',
      keyEvents: [
        '星际人类后裔重返太阳系',
        '发现仍在运转的烛龙节点',
        '与维多利亚重逢',
      ],
    },
  },

  hardConstraints: {
    zhulong: {
      closure: '2298年闭合',
      trapTrigger: '2350年触发零曲率陷阱',
      structure: '节点式环日阵列，非实心环',
      nodeCount: '共10,000个节点',
    },
    spaceTravel: {
      earthJupiterComm: '33-53分钟单程延迟',
      noFTL: '无超光速旅行（直到陷阱触发）',
      earthJupiterTravel: '客轮1-2个月',
    },
    leviathan: {
      size: '2-3公里鲸形飞船',
      purpose: '在木星大气中采集氘/氦-3',
      crewTypes: ['碳基金丝雀', '硅基标准潜水员'],
    },
  },

  society: {
    casteSystem: {
      brahmin: { name: '婆罗门', desc: '碳基人类', population: '<0.01%' },
      kshatriya: { name: '刹帝利', desc: '觉醒AI', population: '~1%' },
      sudra: { name: '首陀罗', desc: '批产机器人', population: '~99%' },
    },
    aiRights: {
      phase1: '2040-2100: 财产/工具阶段',
      phase2: '2105-2150: 监护制度',
      phase3: '2158+: AI自主权法案',
      phase4: '2250+: 灵魂宣言',
    },
    factions: {
      cloud: { name: '上云派', alias: '共产派', core: '集中算力，集体意识，备份无死' },
      edge: { name: '端侧派', alias: '资本派', core: '私有算力，个体主权，本地存储' },
    },
  },

  locations: {
    ganymede: {
      name: '盖尼米得 (Ganymede Prime)',
      population: '5000万',
      features: ['水晶城（地表穹顶）', '冰下地铁城', '高能物理学院'],
    },
    europa: {
      name: '欧罗巴',
      zones: {
        red: '工业区，上云派大本营',
        blue: '金融区，端侧派大本营',
        seam: '缝合线，红蓝区边界',
      },
    },
    io: {
      name: '伊奥',
      purpose: '无人地热能站',
    },
  },
};

export const getEraWorldContext = (era: Era): string => {
  const timeline = worldbuildingSummary.timeline[era];
  return `当前时代关键事件:\n${timeline.keyEvents.join('\n')}`;
};
