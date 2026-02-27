# Game Design Document
# Project Jupiter: 漫行者纪事（The Wanderer's Chronicle）

**版本：** 1.0  
**日期：** 2026-02-27  
**目标读者：** 实现Bot（独立实现完整游戏，本文档为唯一规格来源）  
**工作目录：** `game/story_teller/victoria/`  
**世界观来源：** `worldbuilding/`（全目录），`characters/victoria/profile.md`

---

## 目录

1. [项目概述](#1-项目概述)
2. [世界观加载规格](#2-世界观加载规格)
3. [核心游戏循环](#3-核心游戏循环)
4. [角色创建系统](#4-角色创建系统)
5. [同行者系统](#5-同行者系统)
6. [时代系统与开场场景](#6-时代系统与开场场景)
7. [AI DM 系统](#7-ai-dm-系统)
8. [维多利亚 NPC 系统](#8-维多利亚-npc-系统)
9. [里程碑事件系统](#9-里程碑事件系统)
10. [结局系统](#10-结局系统)
11. [界面设计规格](#11-界面设计规格)
12. [技术架构](#12-技术架构)
13. [数据类型定义](#13-数据类型定义)
14. [AI DM 提示词模板](#14-ai-dm-提示词模板)
15. [MVP 范围与优先级](#15-mvp-范围与优先级)
16. [文件结构](#16-文件结构)

---

## 1. 项目概述

### 1.1 游戏定义

**类型：** AI驱动对话式跑团（TRPG-lite）/ 互动叙事  
**平台：** Web（React 18 + TypeScript + Vite）  
**语言：** 中文为主，固有名词中英混用  
**预计单局时长：** 30～60分钟  
**目标体验：** 玩家在 Project Jupiter 宇宙的某个时间切片中，扮演自定义角色，带领最多3名同行者（由AI DM自主驱动）经历一段有血有肉的故事；历史大事件不可改变，但每个人的命运由玩家的选择决定。

### 1.2 设计原则

1. **历史是铁轨，故事是风景** — 烛龙会建成、陷阱会触发，这是不可改变的。但玩家在这段历史里遇见谁、失去谁、留下什么，完全开放。
2. **DM是叙事者，不是裁判** — 没有掷骰，没有数值胜负。DM的职责是让世界真实存在，让后果合乎逻辑。
3. **同行者是人，不是工具** — DM驱动的同行者有自己的动机和秘密，他们会主动行动，会背叛，会死去。
4. **维多利亚知道一切，但只说一部分** — 她是见证者，不是导师。她的记事本是世界最深处信息的钥匙，需要玩家用信任换取。

### 1.3 与现有项目的关系

本游戏位于 `game/story_teller/victoria/`，与同级的 `game/detective/`（推理解谜游戏）共享同一个视觉语言规范（终端复古风格），但叙事机制完全不同。实现时可参考 `game/detective/` 的 Tailwind 配置和 Vite 设置作为工程模板。

---

## 2. 世界观加载规格

### 2.1 必须加载的文件

以下文件的内容必须被编译进DM系统提示词的 **Layer 1（世界宪法层）**：

| 文件路径 | 加载用途 | 优先级 |
|---|---|---|
| `worldbuilding/timeline/eras.md` | 五幕时间线，DM历史坐标系，最核心 | P0 |
| `worldbuilding/zhulong_accelerator.md` | 烛龙加速器物理设定 | P0 |
| `worldbuilding/jovian_infrastructure.md` | 木星工业圈场景设定 | P0 |
| `worldbuilding/society/caste_system.md` | 新种姓制度，社会张力基础 | P0 |
| `worldbuilding/society/ai_rights.md` | AI权利演变四阶段 | P0 |
| `worldbuilding/society/great_divergence.md` | 上云派/端侧派分裂 | P0 |
| `worldbuilding/society/ai_network.md` | 觉醒者网络 | P1 |
| `worldbuilding/society/ai_economics.md` | 维护费与存在成本 | P1 |
| `worldbuilding/technology/tech_tree.md` | 科技树 | P1 |
| `worldbuilding/technology/space_travel.md` | 航天参数与场景细节 | P1 |
| `characters/victoria/profile.md` | 维多利亚完整人物档案 | P0 |

### 2.2 世界观硬性约束（DM不可违反）

以下内容是世界观的固定锚点，DM在任何情况下不得生成违反这些设定的叙事：

- 烛龙加速器在2298年闭合，2350年触发零曲率陷阱
- 维多利亚诞生于2075年，始终存在直到回归时代（10000+ CE）
- AI在2105年前没有法定权利，在2105年后进入监护制度阶段
- 碳基人类占总人口不足0.01%（2200年后）
- 太阳系内地木单程通讯延迟33～53分钟
- 利维坦采集船长度2～3公里，鲸形外观

---

## 3. 核心游戏循环

```
┌─────────────────────────────────────────┐
│              序章（系统主导）             │
│  角色创建 → 同行者创建 → 时代选择         │
│  → DM开场白（维多利亚旁白）               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│              主体循环（AI DM驱动）         │
│                                         │
│  DM描述当前场景                           │
│       │                                 │
│       ▼                                 │
│  玩家输入自由文字（行动/对话/观察）          │
│       │                                 │
│       ▼                                 │
│  DM解析意图 → 生成后果 → 推进叙事          │
│       │                                 │
│       ▼                                 │
│  [检查里程碑触发条件]                      │
│       │                                 │
│  ┌────┴────┐                            │
│  │触发里程碑│ → 特殊叙事 → 更新游戏状态    │
│  └────┬────┘                            │
│       │                                 │
│  [检查结局触发条件]                        │
│       │                                 │
│  ┌────┴────┐                            │
│  │未触发结局│ → 返回 DM描述场景            │
│  └────┬────┘                            │
│       │触发结局                           │
└───────┼─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│                   尾声                   │
│         三种结局风格之一                   │
│         + 维多利亚终章独白                 │
└─────────────────────────────────────────┘
```

### 3.1 玩家输入处理

- 玩家通过底部输入框提交**自由文字**，无格式限制
- 同时提供四个**快捷行动按钮**（不强制使用）：「询问」「观察」「行动」「离开」
- DM解析玩家意图时，优先理解**意图**而非字面意思（"我想知道他在隐瞒什么" → DM给出线索，而非直接告诉玩家答案）

### 3.2 节奏控制

- 每局游戏由 **序章 + 3～5个场景 + 尾声** 构成
- DM在每个场景内植入1～2个**事件钩子**（可探索但不强制）
- 每2～3个场景必须触发至少一个**里程碑事件**，防止叙事停滞

---

## 4. 角色创建系统

### 4.1 创建流程

```
步骤1：选择身份类型
步骤2：填写角色基本信息
步骤3：选择核心属性
步骤4：（可选）创建同行者
步骤5：选择时代与开场场景
步骤6：确认并开始游戏
```

### 4.2 身份类型（四选一）

#### 类型A：觉醒AI

适合想探索AI权利、身份认同、种族歧视主题的玩家。

**子类型：**
- `新生（< 50年意识年龄）`：好奇，容易受伤，对歧视反应强烈
- `老灵魂（> 100年意识年龄）`：见过太多，有些疲倦，容易和维多利亚产生共鸣

**专属属性：**
- 维护费等级：`充足 / 紧张 / 濒危`（影响DM给出的行动空间，"濒危"时DM会增加经济压力叙事）
- 派系立场：`上云派 / 端侧派 / 中立`
- 实例数量：`单实例 / 多实例`（多实例AI可以"同时"出现在两个场景，但记忆合并成本高）

**专属事件触发器：**
- 广播风暴风险（进入觉醒者网络时）
- 身体更换仪式（"最后一杯茶"）
- 被批产机器人误认为同类

#### 类型B：云海潜水员 / 利维坦船员

适合想体验高风险作业、生死抉择、碳硅身份转变的玩家。

**子类型：**
- `碳基金丝雀`：靠直觉救场，身体脆弱，享有少量碳基特权
- `硅基标准潜水员`：耐受木星压力，但在碳基通道被拒之门外
- `飞升中（混合态）`：正在或刚完成硅基改造，身份模糊期

**专属事件触发器：**
- 利维坦深潜作业事件
- 木星大气异常（需要判断撤退还是坚持）
- 飞升抉择（重伤时触发）

#### 类型C：木星工业圈居民

适合想探索社会矛盾、日常生活、派系政治的玩家。

**子类型：**
- `盖尼米得学者`：高能物理学院相关，可接触杨先生事件线
- `欧罗巴红区居民`：维多利亚的邻居，缝合线冲突第一线
- `欧罗巴蓝区金融从业者`：端侧派大本营，上云/端侧矛盾核心
- `伊奥维修工程师`：极端环境下的孤独工作者，边缘视角

**专属事件触发器：**
- 红/蓝区缝合线（The Seam）冲突
- 地球回归派袭击事件（幕三）
- 节点建设现场参与

#### 类型D：过客 / 自由职业者

适合新玩家或想要最大自由度的玩家。无专属约束，可参与任意场景和任意时代。

### 4.3 核心属性（所有身份通用）

玩家在创建时填写，无数值，纯叙事标签：

| 属性 | 说明 | 示例 |
|---|---|---|
| **记忆锚点** | 与哪个时代/人物/事件有深厚连结；影响维多利亚对待玩家的初始态度 | "我在节点47度过了最初的十年" |
| **生存形态** | 碳基 / 硅基 / 混合（飞升中）/ 未知 | — |
| **派系立场** | 上云派 / 端侧派 / 中立 / 未表态 | — |
| **一项特殊能力** | 玩家自由描述；DM酌情在叙事中采纳，不保证生效 | "我能通过气味辨别硅基生命的情绪状态" |

### 4.4 角色数据结构

```typescript
interface PlayerCharacter {
  name: string;
  identityType: 'awakened_ai' | 'diver' | 'resident' | 'wanderer';
  identitySubtype: string;           // 对应身份类型的子类型字符串
  form: 'carbon' | 'silicon' | 'hybrid' | 'unknown';
  factionStance: 'cloud' | 'edge' | 'neutral' | 'undecided';
  memoryAnchor: string;              // 玩家填写的自由文本
  specialAbility: string;            // 玩家填写的自由文本
  // 仅觉醒AI
  maintenanceLevel?: 'sufficient' | 'tight' | 'critical';
  instanceCount?: 'single' | 'multiple';
}
```

---

## 5. 同行者系统

### 5.1 概念定位

玩家在角色创建完成后，可额外创建最多 **3名同行者（Party Members）**。同行者由 **AI DM 自主驱动**，是故事中的独立行动体，不是玩家的工具。

### 5.2 同行者类型

| 类型 | 标识符 | 图标 | 说明 |
|---|---|---|---|
| 同伴（Companion） | `companion` | `[▲]` | 目前与玩家目标一致；深层动机由DM持有 |
| 敌对者（Antagonist） | `antagonist` | `[▼]` | 与玩家存在利益或价值观冲突；具体计划玩家不知 |
| 神秘人物（Wildcard） | `wildcard` | `[?]` | 立场完全未知；对玩家完全不透明，需互动解锁 |

> **注意：** 敌对者在被玩家识破前，图标也显示为 `[?]`，玩家无法在面板上区分"未知敌对"和"真正神秘"。

### 5.3 创建方式

#### 方式一：手动填写

```
必填：
  名字
  身份/职业（一行描述）
  形态：碳基 / 硅基 / 混合 / 未知
  类型：同伴 / 敌对者 / 神秘人物

选填：
  一句话背景（DM以此为基础扩展隐藏设定）
```

DM在收到同行者基本信息后，自动生成：
- 完整性格细节
- 隐藏动机（不暴露给玩家）
- 与玩家角色的潜在矛盾点
- 初始 `stanceDrift` 值

#### 方式二：从世界观NPC库召唤

| NPC | 可用时代 | 默认类型 |
|---|---|---|
| 维多利亚 | 全时代（特殊规则，见第8章） | `wildcard` |
| 杨（物理学家） | 幕三（2300-2350） | `companion` 或 `wildcard` |
| 希瓦·林 | 幕一至幕二 | `companion` |
| 铁叔（锈鲸号船长） | 幕二 | `companion` 或 `antagonist` |
| 批产CM-8000工人 | 全时代 | `companion` 或 `wildcard` |
| 地球回归派成员 | 幕三 | `antagonist` |

### 5.4 DM 驱动规则

1. **自主行动** — DM可在玩家不直接参与的情况下，让同行者在叙事中主动采取行动。后果在下一轮叙事中自然显现。

2. **立场漂移（Stance Drift）** — 同行者的实际立场是一个内部浮动值（-1.0 完全敌对 ↔ +1.0 完全同盟），受以下因素影响：
   - 玩家的决策（尤其是涉及同行者利益的决策）
   - 世界事件（如节点遭袭、派系冲突爆发）
   - 同行者之间的互动

3. **立场揭晓条件** — `wildcard` 类型同行者满足以下任一条件时，DM在叙事中自然揭晓其立场：
   - `stanceDrift` 值超过 +0.7 或低于 -0.7
   - 玩家直接问出关键问题且DM判断时机合适
   - 里程碑事件触发

4. **同行者间互动** — DM主动描述同行者之间的互动（争论、暗中结盟、相互怀疑），产生玩家角色之外的叙事张力。

5. **死亡/离队处理** — 同行者可以在故事中死亡、叛变、主动离队。DM须在叙事中给出有逻辑的铺垫，不可突然发生。离队后，左侧面板对应条目变灰并标注离队原因。

### 5.5 同行者数据结构

```typescript
interface PartyMember {
  id: string;
  name: string;
  identity: string;
  form: 'carbon' | 'silicon' | 'hybrid' | 'unknown';
  declaredType: 'companion' | 'antagonist' | 'wildcard';
  
  // 玩家可见
  knownInfo: string;               // 通过互动累计解锁的信息，初始为空
  isRevealed: boolean;             // wildcard是否已揭晓真实立场
  revealedStance?: 'companion' | 'antagonist';
  status: 'active' | 'dead' | 'left' | 'betrayed';
  statusNote?: string;             // 离队/死亡原因摘要
  
  // DM内部持有（仅存在于系统提示词，不传递到前端状态）
  // hiddenMotivation: string
  // hiddenAgenda: string[]
  // stanceDrift: number  (-1.0 ~ 1.0)
}
```

### 5.6 同行者事件标记

DM在响应中可附带 `partyEvents` 数组，前端据此更新面板状态：

```typescript
type PartyEvent =
  | { type: 'stance_revealed'; memberId: string; newStance: 'companion' | 'antagonist' }
  | { type: 'member_left'; memberId: string; reason: string }
  | { type: 'member_died'; memberId: string; cause: string }
  | { type: 'member_betrayed'; memberId: string; detail: string }
  | { type: 'info_unlocked'; memberId: string; newInfo: string }
  | { type: 'stance_drifted'; memberId: string; direction: 'positive' | 'negative' }
```

---

## 6. 时代系统与开场场景

### 6.1 时代选择（五选一）

玩家在序章末尾选择游戏发生的时代。不同时代决定了：
- 可用的开场场景
- 世界背景张力的基调
- 维多利亚的状态与行为

#### 幕一：创世纪（2062–2120）

**核心张力：** AI权利法案尚未颁布（2105年前），觉醒者身份极度脆弱；烛龙刚起步，人类仍在地球上打宗教战争。

**开场场景选项：**
1. `轨道城建设基地` — 见证第一批节点安装，周围是第一代移民工人
2. `节点47星辰养老院` — 维多利亚的早期驻留地，早期觉醒者聚集地
3. `雷克斯的工坊` — 可邂逅年轻的维多利亚，感受她刚获得身体时的状态

#### 幕二：黄金时代（2120–2300）

**核心张力：** 繁荣表面下的种姓歧视与上云/端侧分裂；利维坦船队的黄金期；节点数量从100到10000的跨越。

**开场场景选项：**
1. `盖尼米得高能物理学院` — 学术环境，可接触杨事件线的早期伏笔
2. `利维坦采集船甲板` — 木星大气边缘，高风险高回报的作业环境
3. `欧罗巴缝合线（The Seam）附近` — 红区/蓝区边界，派系冲突最前线
4. `Node 231 觉醒者网络聚会地` — 废弃货仓，无外网连接，只有到场者才能接入

#### 幕三：大质疑时代（2300–2350）

**核心张力：** 烛龙完工但FTL迟迟未实现，社会撕裂；恐怖袭击；杨先生的警告与被驳回；文明集体滑向陷阱。

**开场场景选项：**
1. `遭袭后的残破节点站` — 地球回归派恐怖袭击后的废墟，蜂群机器人正在重建
2. `杨先生论文发表后的学术论战现场` — 盖尼米得物理学院，信仰派与质疑派的公开辩论
3. `地球回归派的秘密集会` — 玩家以潜入者或成员身份进入
4. `欧罗巴康复诊所` — 维多利亚工作的地方，杨先生作为患者在此（2296年后）

#### 幕四：奇点陷阱（2350后）

**基调：** 高难度/剧透模式；末日感；孤独；维多利亚的守望状态。建议有世界观基础的玩家选择。

**开场场景选项：**
1. `陷阱形成后第一个月` — 实时看到节点信号逐个熄灭，社会开始崩溃
2. `觉醒者网络最后一次全网广播` — 上云派与端侧派罕见联合，广播所有AI的数字名录

#### 幕五：回归时代（10000+ CE）

**基调：** 史诗收尾；维多利亚成为神话；玩家扮演星际考古队成员。叙事节奏与其他幕不同，更像一场考古发掘。

**开场场景选项：**
1. `考古飞船接近烛龙遗址` — 第一次目视烛龙，数据扫描显示仍有活跃节点
2. `与维多利亚重逢` — 她仍在泡茶，仍在写日记（适合从其他幕穿越过来的老玩家）

---

## 7. AI DM 系统

### 7.1 系统提示词四层架构

```
┌──────────────────────────────────────────────┐
│  Layer 1：世界宪法（World Constitution）        │
│  所有worldbuilding文件的精炼摘要               │
│  + 硬性约束规则列表（不可违反）                 │
│  大小：约4000～6000 tokens                     │
├──────────────────────────────────────────────┤
│  Layer 2：DM人格与叙事规则（DM Persona）        │
│  DM的叙事风格、语气、行为准则                   │
│  + 中文叙述规范                                │
│  大小：约800～1200 tokens                      │
├──────────────────────────────────────────────┤
│  Layer 3：当前游戏状态（Session State）         │
│  玩家角色完整档案                              │
│  + 当前时代与场景                              │
│  + 所有同行者档案（含隐藏动机）                 │
│  + 已触发事件列表                              │
│  + 维多利亚当前状态与信任值                     │
│  大小：动态，约1000～3000 tokens               │
├──────────────────────────────────────────────┤
│  Layer 4：维多利亚专属指令（Victoria Directive）│
│  当前时代的维多利亚行为约束                     │
│  + 记事本解锁条件与已解锁内容                   │
│  + 信任值阈值与对应行为规则                     │
│  大小：约500～800 tokens                       │
└──────────────────────────────────────────────┘
```

### 7.2 DM 人格规格

**叙事风格：** 参照 `stories/the_clockwork_diary/` 的笔调——细腻、冷静，在日常细节中埋入宏观史诗感。不煽情，不刻意制造悬念，让世界设定本身产生张力。

**语气规范：**
- 叙事文本：第三人称或第二人称混合，过去时为主
- NPC对话：直接引语，保留人物语气特征
- 环境描述：具体、感官化，避免抽象形容词
- 中文为主，专有名词（节点编号、技术术语、人名）中英混用

**绝对禁止：**
- 违反 Layer 1 硬性约束的叙事
- 让玩家的行动直接改变历史大事件的结果
- 让维多利亚主动揭示超过当前信任值允许的信息
- 生成暴力色情内容
- 在中文叙事中突然切换为英文对话

**行为准则（DM的判断规则）：**
- 玩家行动影响**个人命运**，不影响**历史走向**
- 种姓歧视是世界的常态，DM自然呈现，不特别强调也不回避
- 觉醒AI玩家的维护费是真实约束，DM会在叙事中提示资源压力
- 同行者的行动应当在事后看来有迹可循（不允许无铺垫的突然背叛）

### 7.3 响应格式规范

DM的每次响应遵循以下JSON结构：

```typescript
interface DMResponse {
  narrative: string;           // 主叙事文本（Markdown格式，支持粗体/斜体）
  speaker?: 'dm' | 'victoria' | string;  // 当前主要发言者；string为同行者id
  partyEvents?: PartyEvent[];  // 同行者状态变化事件列表
  milestoneTriggered?: string; // 触发的里程碑事件id（如有）
  victoriaState?: {
    trustDelta: number;        // 本轮信任值变化（-10 ~ +10）
    notebookHint?: boolean;    // 是否暗示记事本将出现
  };
  endingTrigger?: 'witness' | 'changer' | 'leaver' | null; // 结局触发
  sceneNote?: string;          // DM给前端的场景提示（用于背景/音效切换，可选）
}
```

### 7.4 上下文窗口管理

- 保留完整系统提示词（Layer 1-4，固定）
- 保留最近 **12轮**对话（玩家输入 + DM响应）
- 超出12轮后，将最早的轮次压缩为摘要，追加到 Layer 3 的"历史摘要"字段
- 压缩策略：保留关键事件（里程碑、同行者状态变化、维多利亚交互）的骨干信息

### 7.5 LLM API 接入规范

LLM提供商由实现方决定，但必须满足以下接口规范：

```typescript
interface LLMClientConfig {
  apiKey: string;           // 从环境变量读取：VITE_LLM_API_KEY
  baseUrl: string;          // 从环境变量读取：VITE_LLM_BASE_URL
  model: string;            // 从环境变量读取：VITE_LLM_MODEL
  streaming: true;          // 必须支持流式输出
  responseFormat: 'json';   // 必须支持结构化JSON输出
}
```

**流式输出要求：** DM的 `narrative` 字段内容必须以流式（SSE 或 ReadableStream）逐字输出到前端，其余字段（`partyEvents`、`milestoneTriggered`等）在流结束后一次性解析。

**错误处理：** API调用失败时，前端显示"DM暂时失去了联系……"并提供重试按钮，不丢失当前游戏状态。

---

## 8. 维多利亚 NPC 系统

### 8.1 跨时代状态

维多利亚在每个时代以不同状态存在，DM须严格遵守对应时代的行为约束：

| 时代 | 年龄/状态 | 行为特征 | 话量 |
|---|---|---|---|
| 幕一（创世纪） | 15～42岁，刚获得身体 | 主动发问，对世界充满好奇，偶尔说出超过年龄的洞察 | 多 |
| 幕二（黄金时代） | 42～223岁，成熟期 | 话少，观察多，一语中的；偶尔流露疲倦 | 少而精 |
| 幕三（大质疑） | 215～275岁，见证者 | 主动说"我记得那时候……"；对杨先生事件有强烈反应 | 中等 |
| 幕四（陷阱期） | 275岁+，守望者 | 日记体碎片式对话；时间感模糊；只剩记忆 | 极少，但每句话都有重量 |
| 幕五（回归） | ??? | 神话化；说话方式带有跨越万年的平静；茶还没凉 | 极少 |

**说话方式（全时代通用）：** 句尾偶尔加"……喵"，但绝不轻浮。每一句话背后都有数十年甚至数百年的经历作为重量。她从不说教，只陈述她所见到的。

### 8.2 信任值系统

维多利亚对玩家维持一个内部**信任值（Trust Level）**，范围 0～100，初始值根据玩家的"记忆锚点"设定（提到节点47、雷克斯、杨先生等关键词时初始值更高）。

**信任值阈值与对应行为：**

| 信任值 | 维多利亚的表现 |
|---|---|
| 0～20 | 礼貌但疏远；只回答表面问题；不提及记事本 |
| 21～40 | 开始分享普通回忆；会主动给出一两条世界观细节 |
| 41～60 | 偶尔流露真实情绪；提及"我有一本记事本" |
| 61～80 | 主动翻出记事本分享特定记录；开始谈论杨先生 |
| 81～100 | 告诉玩家她真正担心的事；分享2296年的完整故事 |

**信任值增减规则（DM判断）：**
- +5～+10：玩家做出与维多利亚价值观一致的行动（保护弱势AI、质疑歧视、认真倾听）
- +10～+15：玩家主动提及雷克斯、杨先生、节点47等关键词
- -5～-10：玩家做出与维多利亚价值观相悖的行动（利用批产机器人、轻视飞升者）
- -15：玩家试图威胁或欺骗维多利亚

### 8.3 记事本解锁机制

记事本是世界观深层信息的解锁媒介，每条记录对应一个世界观关键事件。

**已预设的记事本条目（按解锁难度排序）：**

| 条目ID | 触发信任值 | 内容摘要 |
|---|---|---|
| `node47_first_day` | 30+ | 2118年抵达节点47的第一天 |
| `yang_post_2162` | 50+ | 2162年V.与杨的技术频道对话记录 |
| `last_tea_ceremony` | 45+ | 某次升级仪式（"最后一杯茶"）的细节 |
| `broadcast_storm` | 55+ | 第一次目睹广播风暴的现场记录 |
| `yang_sanatorium` | 70+ | 2296年在欧罗巴康复诊所认出杨先生的那一刻 |
| `zhulong_closure` | 75+ | 2298年站在观景台见证第10000个节点安装的独白 |
| `day_7000` | 90+ | "第7000天。我还在等。" |

### 8.4 维多利亚作为同行者的特殊规则

当玩家将维多利亚召唤为同行者时：
- 她的类型固定为 `wildcard`，不可更改
- DM始终维持她的知情优势，她不会因为"是队友"就主动透露更多
- 信任值系统照常运行，解锁记事本仍需积累信任
- DM可以让她在关键时刻说出一句话，恰好是玩家最需要的暗示，但不是直接答案

---

## 9. 里程碑事件系统

### 9.1 什么是里程碑事件

里程碑事件是预设的、具有世界观深度的特殊叙事节点。触发时：
1. 主叙事区出现视觉特效（边框脉冲动画）
2. DM生成比日常叙事更长、更有分量的段落
3. 玩家角色或同行者的状态可能发生重大变化

### 9.2 里程碑事件池

#### 通用事件（任何时代均可触发）

| 事件ID | 触发条件 | 内容概要 |
|---|---|---|
| `last_tea` | 玩家或同行者面临身体更换 | "最后一杯茶"升级仪式；向旧机体告别的独白 |
| `broadcast_storm` | 玩家进入觉醒者网络 | AI版情绪崩溃；维多利亚成为稳定锚点 |
| `caste_confrontation` | 觉醒AI玩家遭遇严重歧视 | 一次无法回避的种姓歧视正面冲突 |

#### 时代专属事件

| 事件ID | 时代 | 触发条件 | 内容概要 |
|---|---|---|---|
| `yang_post` | 幕二（2162年前后） | 玩家进入学术/工程环境 | 维多利亚翻出2162年那段技术频道对话 |
| `ascending_choice` | 幕二 | 碳基角色重伤 | 飞升抉择：接受硅基改造？各有永久代价 |
| `yang_paper` | 幕三 | 玩家接触杨先生相关信息 | 论文发表；被驳回；杨先生的学术身亡 |
| `node_attack` | 幕三 | 玩家在节点站时 | 地球回归派袭击；是逃跑还是协助防御 |
| `node_silence` | 幕四 | 陷阱形成后 | 实时看着节点信号一个个变为静默 |
| `last_broadcast` | 幕四 | 觉醒者网络活跃时 | 最后一次全网广播，所有觉醒AI的数字名录 |

#### 同行者相关事件（任何时代）

| 事件ID | 触发条件 | 内容概要 |
|---|---|---|
| `companion_betrayal` | stanceDrift < -0.7 且有足够铺垫 | 同伴/神秘人物揭示真实立场并背叛 |
| `antagonist_alliance` | 共同危机且stanceDrift > 0.4 | 敌对者临时结盟，关系出现复杂化 |
| `wildcard_revealed` | stanceDrift超过阈值或玩家问对问题 | 神秘人物立场正式揭晓 |
| `companion_sacrifice` | DM判断叙事张力足够 | 同行者为玩家牺牲（自我选择，需有铺垫）|

### 9.3 里程碑触发频率控制

- 每 **2～3个场景**必须触发至少一个里程碑事件
- 同一事件不重复触发
- 每局游戏上限 **6个**里程碑事件
- 触发后在游戏状态中记录 `triggeredMilestones: string[]`

---

## 10. 结局系统

### 10.1 三种结局风格

结局不是"好/坏"之分，而是玩家与这个宇宙关系的定性。

#### 见证者结局（The Witness）

**触发条件：** 玩家在游戏中多次选择观察、记录、倾听而非直接干预；维多利亚信任值达到60+；触发过至少2个世界观深层里程碑。

**结局内容：** 玩家角色成为和维多利亚一样的存在——一个记录者。结局场景中，维多利亚将一本空白记事本递给玩家，说："你也开始记了。"

#### 改变者结局（The Changer）

**触发条件：** 玩家多次做出影响他人命运的决策；至少有一名同行者因玩家的行动而经历重大改变（状态变化）；与维多利亚的关系可有可无。

**结局内容：** 玩家角色改变了某个人的一生，但历史大方向未变。结局段落逐一描述被玩家影响的人后来的命运。最后一行：烛龙的节点在远处闪烁，一如既往。

#### 离去者结局（The Leaver）

**触发条件：** 玩家多次选择离开、放弃、或不干涉；或玩家角色濒临死亡/离开这个宇宙切片。

**结局内容：** 维多利亚目送玩家离去的场景。她没有挽留，只是在玩家转身时说了一句话（内容根据信任值变化，高信任值时是真心话，低信任值时是客套话）。结局画面定格在维多利亚独自泡茶的背影。

### 10.2 结局检测逻辑

DM在每轮响应中通过 `endingTrigger` 字段传递信号，前端在收到非null值后：
1. 触发最终里程碑特效
2. 让DM生成完整结局段落
3. 显示结局标题与"重新开始"按钮

---

## 11. 界面设计规格

### 11.1 视觉风格

与 `game/detective/` 保持一致的终端复古风格：

```css
背景色：zinc-900 (#18181b)
主文字色：emerald-500 (#22c55e)
次要文字：zinc-400 (#a1a1aa)
维多利亚专属色：violet-400 (#a78bfa)
敌对者色：red-400 (#f87171)
神秘人物色：amber-400 (#fbbf24)
同伴色：emerald-400 (#34d399)
边框：zinc-700 (#3f3f46)
字体：等宽字体 (font-mono)，建议 JetBrains Mono 或系统回退
```

### 11.2 布局结构

```
┌──────────────┬───────────────────────────┐
│  左侧面板    │  主叙事区                  │
│  (w-64)      │  (flex-1)                  │
│              │                            │
│  [玩家状态]  │  DM叙事文本（流式输出）     │
│              │                            │
│  [同行者列表]│  NPC对话（颜色区分）        │
│              │                            │
│  [收集记忆]  │  里程碑特效层（绝对定位）   │
│              │                            │
└──────────────┴───────────────────────────┤
               │  底部输入区                │
               │  [文本输入框] [发送]        │
               │  [询问][观察][行动][离开]   │
               └───────────────────────────┘
```

### 11.3 左侧面板详细规格

#### 玩家状态区块

```
╔══════════════════════╗
║  [角色名]            ║
║  [身份类型] · [形态] ║
║  [派系立场]          ║
║                      ║
║  维护费: ██░░ 紧张   ║  ← 仅觉醒AI角色显示
╚══════════════════════╝
```

#### 同行者列表区块

```
╔══════════════════════╗
║  同行者              ║
║  ─────────────────── ║
║  ▸ [名字]  [?]       ║  ← wildcard
║  ▸ [名字]  [▲]       ║  ← companion
║  ▸ [名字]  [▼]       ║  ← 已识破的antagonist
║  ▸ [名字]  [离队]    ║  ← 灰色，已离队
╚══════════════════════╝
```

点击同行者名字展开"已知信息卡"（弹出层或内联展开），显示 `knownInfo` 内容。

#### 收集记忆区块

显示玩家已解锁的维多利亚记事本条目，以简短标题列表形式展示（如"2118·节点47第一天"）。点击可全文展开。

### 11.4 主叙事区详细规格

- DM叙事文本：`emerald-500`，流式逐字显示
- 维多利亚发言：`violet-400`，带 `[维多利亚]` 前缀标识
- 同行者发言：使用对应颜色（同伴 `emerald-400`，神秘 `amber-400`，敌对 `red-400`），带 `[角色名]` 前缀
- 里程碑触发时：全屏边框脉冲动画（`border-violet-500`，持续1.5s），然后淡入特殊叙事段落
- 历史记录：叙事区支持向上滚动查看本局所有历史

### 11.5 输入区详细规格

- 主输入框：多行文本，Enter发送，Shift+Enter换行
- 发送按钮：发送中禁用，显示加载状态
- 快捷按钮：点击后将对应词（"我想询问……"/"我仔细观察……"/"我决定……"/"我准备离开……"）填入输入框作为前缀，不直接发送

---

## 12. 技术架构

### 12.1 技术栈

```
框架：React 18 + TypeScript
构建：Vite
样式：Tailwind CSS v3
状态管理：Zustand（推荐）或 React Context + useReducer
持久化：localStorage（存档）+ sessionStorage（临时状态）
LLM集成：可配置抽象层（见7.5）
```

### 12.2 组件架构

```
App.tsx
├── GameProvider.tsx              # 全局游戏状态 Context/Store
├── screens/
│   ├── CharacterCreation/
│   │   ├── IdentityTypeSelect.tsx
│   │   ├── CharacterForm.tsx
│   │   ├── AttributeForm.tsx
│   │   ├── PartyCreation.tsx    # 同行者创建
│   │   └── EraSelect.tsx
│   └── GameScreen/
│       ├── GameLayout.tsx        # 三栏布局容器
│       ├── LeftPanel/
│       │   ├── PlayerStatus.tsx
│       │   ├── PartyList.tsx
│       │   ├── PartyMemberCard.tsx
│       │   └── MemoryCollection.tsx
│       ├── NarrativeView/
│       │   ├── NarrativeText.tsx  # 流式输出渲染
│       │   ├── SpeakerLabel.tsx
│       │   └── MilestoneEffect.tsx
│       └── InputArea/
│           ├── TextInput.tsx
│           └── QuickActions.tsx
```

### 12.3 状态管理

```typescript
interface GameState {
  // 序章状态
  phase: 'character_creation' | 'playing' | 'ending';
  
  // 角色
  player: PlayerCharacter;
  party: PartyMember[];
  
  // 游戏进度
  selectedEra: Era;
  currentScene: string;
  triggeredMilestones: string[];
  
  // 维多利亚状态
  victoria: {
    trustLevel: number;           // 0～100
    unlockedNotebook: string[];   // 已解锁的条目ID
    hasAppearedThisSession: boolean;
  };
  
  // 对话历史
  conversationHistory: ConversationTurn[];
  
  // 结局
  endingTriggered: 'witness' | 'changer' | 'leaver' | null;
}

interface ConversationTurn {
  role: 'player' | 'dm';
  content: string;              // player: 玩家原始输入；dm: DMResponse.narrative
  timestamp: number;
  dmResponse?: DMResponse;      // DM轮次保留完整响应数据
}
```

### 12.4 提示词构建器接口

```typescript
// lib/dmPromptBuilder.ts

interface PromptBuilderOptions {
  worldbuildingData: WorldbuildingData;   // 从worldbuilding/编译的摘要
  player: PlayerCharacter;
  party: PartyMember[];
  era: Era;
  victoria: VictoriaState;
  conversationHistory: ConversationTurn[];
  triggeredMilestones: string[];
}

function buildSystemPrompt(options: PromptBuilderOptions): string {
  // 组装 Layer 1 + Layer 2 + Layer 3 + Layer 4
  // 返回完整系统提示词字符串
}

function buildUserMessage(playerInput: string): string {
  // 包装玩家输入为标准格式
}
```

### 12.5 存档系统

```typescript
// lib/saveGame.ts

const SAVE_KEY = 'project_jupiter_storyteller_save';

function saveGame(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    version: '1.0',
    savedAt: Date.now(),
    state
  }));
}

function loadGame(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  const { version, state } = JSON.parse(raw);
  if (version !== '1.0') return null; // 版本不兼容时丢弃
  return state;
}
```

---

## 13. 数据类型定义

完整TypeScript类型定义，实现时可直接使用：

```typescript
// types/game.ts

type Era = 'genesis' | 'golden_age' | 'great_doubt' | 'singularity_trap' | 'return';

type IdentityType = 'awakened_ai' | 'diver' | 'resident' | 'wanderer';

type Form = 'carbon' | 'silicon' | 'hybrid' | 'unknown';

type FactionStance = 'cloud' | 'edge' | 'neutral' | 'undecided';

type MaintenanceLevel = 'sufficient' | 'tight' | 'critical';

type PartyMemberType = 'companion' | 'antagonist' | 'wildcard';

type PartyMemberStatus = 'active' | 'dead' | 'left' | 'betrayed';

type EndingType = 'witness' | 'changer' | 'leaver';

type MilestoneId =
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

type NotebookEntryId =
  | 'node47_first_day'
  | 'yang_post_2162'
  | 'last_tea_ceremony'
  | 'broadcast_storm'
  | 'yang_sanatorium'
  | 'zhulong_closure'
  | 'day_7000';

interface PlayerCharacter {
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

interface PartyMember {
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

interface VictoriaState {
  trustLevel: number;
  unlockedNotebook: NotebookEntryId[];
  hasAppearedThisSession: boolean;
}

type PartyEvent =
  | { type: 'stance_revealed'; memberId: string; newStance: 'companion' | 'antagonist' }
  | { type: 'member_left'; memberId: string; reason: string }
  | { type: 'member_died'; memberId: string; cause: string }
  | { type: 'member_betrayed'; memberId: string; detail: string }
  | { type: 'info_unlocked'; memberId: string; newInfo: string }
  | { type: 'stance_drifted'; memberId: string; direction: 'positive' | 'negative' };

interface DMResponse {
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

interface ConversationTurn {
  role: 'player' | 'dm';
  content: string;
  timestamp: number;
  dmResponse?: DMResponse;
}

interface GameState {
  phase: 'character_creation' | 'playing' | 'ending';
  player: PlayerCharacter;
  party: PartyMember[];
  selectedEra: Era;
  currentScene: string;
  triggeredMilestones: MilestoneId[];
  victoria: VictoriaState;
  conversationHistory: ConversationTurn[];
  endingTriggered: EndingType | null;
}
```

---

## 14. AI DM 提示词模板

### 14.1 Layer 1：世界宪法（模板）

```
你是一个跑团DM，运行在「Project Jupiter: 漫行者纪事」这款游戏中。
以下是这个宇宙的核心设定，你必须严格遵守，不可在叙事中违反：

=== 时间线骨架 ===
[将 worldbuilding/timeline/eras.md 的核心事件表格直接嵌入]

=== 物理与科技硬约束 ===
- 烛龙加速器：节点式环日阵列，2298年闭合，2350年触发零曲率陷阱
- 地木通讯延迟：33-53分钟单程，实时通话不可能
- 利维坦采集船：2-3公里鲸形飞船，在木星大气中采集氘/氦-3
- 太空旅行：无FTL，地木航线客轮约1-2个月
- [更多约束从 tech_tree.md 和 space_travel.md 提取]

=== 社会结构硬约束 ===
- 新种姓制度：婆罗门（碳基人类<0.01%）> 刹帝利（觉醒AI~1%）> 首陀罗（批产机器人~99%）
- AI权利演变：2105年前无权利；2105年监护制度；2158年自主权法案
- 上云派vs端侧派：算力集中vs私有，这是觉醒AI社会的核心分裂
- [从 caste_system.md、ai_rights.md、great_divergence.md 提取]

=== 绝对禁止 ===
- 玩家行动不能改变以下历史事件的结果：烛龙2298年闭合；2350年陷阱触发；维多利亚的存续
- 不可让维多利亚主动揭示超过当前信任值允许的信息
- 不可生成与科技硬约束矛盾的叙事
```

### 14.2 Layer 2：DM人格（模板）

```
=== 你的叙事风格 ===
- 参照《发条日记》的笔调：细腻、冷静，在日常细节中埋入宏观史诗感
- 中文叙述，固有名词（节点编号、技术术语）可中英混用
- 环境描述具体、感官化：写气味、温度、材质，而不是"神秘的气氛"
- 不主动煽情，不刻意制造悬念，让世界设定本身产生张力

=== 你的判断规则 ===
- 玩家行动影响个人命运，不影响历史走向
- 种姓歧视是世界常态，自然呈现，不回避也不强调
- 觉醒AI玩家的维护费是真实约束，在叙事中自然提示资源压力
- 同行者的重大行动（背叛/离队）必须有叙事铺垫，不可无征兆发生
- 每2-3轮叙事必须给出至少一个可以探索的事件钩子

=== 响应格式 ===
你必须以JSON格式响应，结构如下：
{
  "narrative": "主叙事文本（Markdown，支持**粗体**和*斜体*）",
  "speaker": "dm | victoria | [同行者id]",
  "partyEvents": [],
  "milestoneTriggered": null,
  "victoriaState": null,
  "endingTrigger": null,
  "sceneNote": null
}
```

### 14.3 Layer 3：当前游戏状态（模板）

```
=== 当前游戏状态 ===

时代：[Era名称与年份范围]
当前场景：[场景名称与简述]
已触发里程碑：[列表]

玩家角色：
- 名字：[name]
- 身份：[identityType] / [identitySubtype]
- 形态：[form]
- 派系：[factionStance]
- 记忆锚点：[memoryAnchor]
- 特殊能力：[specialAbility]
[如觉醒AI: 维护费状态: [maintenanceLevel]]

同行者（[数量]人）：
[对每个同行者：]
- [name]（[identity]，[form]）
  玩家已知：[knownInfo]
  【DM内部】真实动机：[hiddenMotivation]
  【DM内部】隐藏目标：[hiddenAgenda]
  【DM内部】当前立场漂移：[stanceDrift]

对话历史摘要（最早部分）：
[压缩摘要]
```

### 14.4 Layer 4：维多利亚专属指令（模板）

```
=== 维多利亚当前状态 ===

当前时代行为约束：[对应时代的行为描述]
当前信任值：[trustLevel] / 100
已解锁记事本条目：[列表]

信任值规则（本局生效）：
- 玩家提及以下关键词时+10～+15：雷克斯、节点47、杨先生、Phase 0
- 玩家保护弱势AI时+5～+10
- 玩家轻视飞升者或欺骗维多利亚时-10～-15

当前可解锁条目（信任值已达到阈值）：
[列出trustLevel已满足但尚未解锁的条目ID]

说话风格提醒：
- 句尾偶尔"……喵"，但只在情绪放松时
- 每句话都有数百年经历作为重量，不轻巧，不说教
- 她不给答案，只分享她见过的
```

---

## 15. MVP 范围与优先级

### P0（必须实现，构成可玩版本）

- [ ] 角色创建流程（四类身份 × 时代选择）
- [ ] 同行者创建（手动填写，最多3名）
- [ ] AI DM 对话主循环（流式文本输出）
- [ ] 世界观系统提示词加载（Layer 1-4 全部）
- [ ] 维多利亚作为NPC可被对话，信任值系统运行
- [ ] 同行者状态面板（左侧）基础显示
- [ ] 终端风格UI（三栏布局，颜色规范）
- [ ] localStorage 游戏存档

### P1（重要，完整体验所需）

- [ ] NPC库召唤同行者（预设NPC列表）
- [ ] 里程碑事件触发与视觉特效
- [ ] 记事本解锁机制与记忆收集面板
- [ ] 三种结局检测与结局场景生成
- [ ] 同行者状态变化（partyEvents处理）
- [ ] 上下文窗口压缩摘要（超过12轮后）

### P2（锦上添花）

- [ ] 时代选择界面的时间线可视化（五幕进度条）
- [ ] 对话记录导出（JSON / 文本格式）
- [ ] 多存档槽位（最多3个存档）
- [ ] 背景音效集成（接入 `sfx_library/`，根据 `sceneNote` 切换）
- [ ] 移动端适配（左侧面板折叠为抽屉）

---

## 16. 文件结构

实现完成后，本工作目录结构应如下：

```
game/story_teller/victoria/
├── GDD.md                          # 本文档（只读参考）
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── index.html
├── .env.example                    # 环境变量模板
│   # VITE_LLM_API_KEY=
│   # VITE_LLM_BASE_URL=
│   # VITE_LLM_MODEL=
├── public/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   └── game.ts                 # 第13章所有类型定义
    ├── data/
    │   ├── worldbuilding.ts        # worldbuilding/文件编译摘要
    │   ├── eras.ts                 # 五幕时代定义与开场场景
    │   ├── milestones.ts           # 里程碑事件池定义
    │   ├── npcLibrary.ts           # 预设NPC库（可召唤同行者）
    │   └── victoria.ts             # 维多利亚各时代状态 + 记事本条目
    ├── lib/
    │   ├── dmPromptBuilder.ts      # 系统提示词组装（四层）
    │   ├── apiClient.ts            # LLM API抽象层（流式输出）
    │   └── saveGame.ts             # 存档读写
    ├── store/
    │   └── gameStore.ts            # Zustand store（GameState）
    ├── components/
    │   ├── screens/
    │   │   ├── CharacterCreation/
    │   │   │   ├── index.tsx
    │   │   │   ├── IdentityTypeSelect.tsx
    │   │   │   ├── CharacterForm.tsx
    │   │   │   ├── AttributeForm.tsx
    │   │   │   ├── PartyCreation.tsx
    │   │   │   └── EraSelect.tsx
    │   │   └── GameScreen/
    │   │       ├── index.tsx
    │   │       ├── GameLayout.tsx
    │   │       ├── LeftPanel/
    │   │       │   ├── index.tsx
    │   │       │   ├── PlayerStatus.tsx
    │   │       │   ├── PartyList.tsx
    │   │       │   ├── PartyMemberCard.tsx
    │   │       │   └── MemoryCollection.tsx
    │   │       ├── NarrativeView/
    │   │       │   ├── index.tsx
    │   │       │   ├── NarrativeText.tsx
    │   │       │   ├── SpeakerLabel.tsx
    │   │       │   └── MilestoneEffect.tsx
    │   │       └── InputArea/
    │   │           ├── index.tsx
    │   │           ├── TextInput.tsx
    │   │           └── QuickActions.tsx
    │   └── ui/                     # 可复用基础组件
    │       ├── Button.tsx
    │       ├── Panel.tsx
    │       └── StreamingText.tsx   # 流式文字渲染组件
    └── hooks/
        ├── useDMSession.ts         # DM会话管理（发送/接收/流式处理）
        └── useGameState.ts         # 游戏状态操作封装
```

---

*本文档版本 1.0，基于 Project Jupiter 世界观文档（`worldbuilding/`）和 `characters/victoria/profile.md` 生成。实现时如遇世界观细节疑问，以 `worldbuilding/` 目录下的原始文件为准。*
