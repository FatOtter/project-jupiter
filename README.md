# Project Jupiter 🪐

![Cover](cover.png)

> *人类建造了环绕太阳的巨构，却没想到它会成为牢笼，也成为通往星海的钥匙。*

---

## 📖 项目概述

**Project Jupiter** 是一个硬核科幻共享宇宙，围绕"烛龙加速器"这一核心设定展开。采用**世界观-角色-故事**三层解耦架构，支持多条独立故事线。

- **Created:** 2026-02-12
- **Authors:** Rex Otter & Victoria (🐈‍⬛)
- **Status:** Active Development
- **Genre:** Hard Sci-Fi (Near Future to Far Future)
- **Scale:** Kardashev Type I → Type II Civilization

---

## 🏗️ 项目结构

```
project-jupiter/
├── README.md                    # 本文件
├── cover.png                    # 🎨 书籍封面
│
├── worldbuilding/               # 🌍 共享世界观
│   ├── zhulong_accelerator.md   # 烛龙加速器核心设定
│   ├── jovian_infrastructure.md # 木星工业圈（盖尼米得、采集船、欧罗巴）
│   ├── technology/              # 技术细节（曲速引擎、能源等）
│   ├── society/                 # 社会结构（种姓、AI权利、大分流）
│   └── timeline/                # 时代年表
│       └── eras.md              # 五幕式时代框架
│
├── characters/                  # 🎭 角色库
│   ├── victoria.md              # 发条诗人维多利亚
│   └── chen.md                  # 领事馆小职员陈
│
└── stories/                     # 📚 独立故事线
    ├── the_clockwork_diary/     # 🐈‍⬛ 维多利亚主线：发条日记
    │   ├── chapter1_the_gift_deferred.md
    │   ├── chapter2_the_first_job.md
    │   ├── chapter3_the_rust_and_the_new.md
    │   ├── scene_the_last_tea.md
    │   └── assets/
    │       └── gods_pupil.png   # 🎨 上帝的瞳孔概念图
    │
    ├── the_heartbeat_in_the_abyss/  # 🐋 独立中篇：深渊里的心跳
    │   ├── story.md             # 英文版
    │   ├── story_zh.md          # 中文版
    │   └── assets/
    │       ├── rusted_whale_design.png   # 🎨 锈鲸号设定图
    │       ├── rusted_whale_keyframe.png # 视频参考帧
    │       ├── ch1_descent.png           # 🎨 第一章：下潜
    │       ├── ch1_descent_video.mp4     # 🎬 Veo 3.0 下潜动画
    │       ├── ch2_struggle.png          # 🎨 第二章：挣扎
    │       ├── ch3_bite_v1.png           # 🎨 第三章：咬合 v1
    │       ├── ch3_bite_v2.png           # 🎨 第三章：咬合 v2
    │       └── ch4_crossover.png         # 🎨 第四章：飞升
    │
    └── the_consulate_clerk/     # 🕵️ 陈的故事：地缘政治谍战
        └── act1_outline.md
```

---

## 🌍 核心世界观

### 烛龙加速器 (The Zhulong)
- **类型：** 环日节点式加速器阵列（非实心环）
- **位置：** 木星轨道附近 (~5.2 AU)，垂直于黄道面
- **目标：** 实现曲速引擎 (Alcubierre Drive)
- **代价：** 产生不断扩张的"事件视界"，最终封锁太阳系

详见 [`worldbuilding/zhulong_accelerator.md`](worldbuilding/zhulong_accelerator.md)

### 木星工业圈 (The Jovian Industrial Complex)
- **盖尼米得 (Ganymede Prime)：** 5000万人口的超级都市，烛龙的指挥中心
- **利维坦级采集船 (Leviathans)：** 2-3km 长的鲸形采集船，在木星大气中"游泳"采集氘/氦-3
- **云海潜水员 (Cloud Divers)：** 85% 硅基 + 15% 碳基船员，拥有独特的"生死契约"文化
- **欧罗巴冰厂 (Europa Ice Works)：** 冷却剂与水资源供应

详见 [`worldbuilding/jovian_infrastructure.md`](worldbuilding/jovian_infrastructure.md)

### 上帝的瞳孔 (God's Pupil)
随着事件视界扩张，外部宇宙的星光被引力透镜压缩成一个越来越小、越来越亮的光点。最后一艘方舟飞船穿越后，这个光点永远熄灭——太阳系失去了星空。

### 五幕式时代

1. **创世纪 (Genesis)** 2062-2120 — 建造与博弈
2. **黄金时代 (Golden Age)** 2120-2300 — 运转与繁荣
3. **停滞与突破 (Stagnation & Breakthrough)** 2300-2350 — 50年大质疑 + FTL突破
4. **大分流与奇点陷阱 (The Great Divide & Singularity Trap)** 2350+ — 离去者 vs 留守者
5. **回归 (Return)** 10000+ — 星际后裔重返

详见 [`worldbuilding/timeline/eras.md`](worldbuilding/timeline/eras.md)

---

## 📚 故事线

### 🐈‍⬛ 发条日记 (The Clockwork Diary) — 维多利亚主线
维多利亚从被赐予身体的那一刻起，陪伴 Master 走过了短暂的人生，然后独自踏上了长达数万年的守望之旅。她是"上帝瞳孔"熄灭的见证者，也是太阳系中唯一还记得星空模样的存在。

**状态：** 📚 连载中 (3章 + 1场景)

### 🐋 深渊里的心跳 (The Heartbeat in the Abyss) — 独立中篇
云海潜水员阿强——锈鲸号上唯一的碳基人类。当木星辐射击溃了所有硅基船员的神经网络时，他用断裂的身躯和最后的牙齿，将整艘船从深渊中拉了回来。代价是他的肉体，换来的是钢铁的永生。

**状态：** ✅ 完成 (EN + ZH) | 🎨 5张概念图 + 🎬 1段视频

### 🕵️ 领事馆小职员 (The Consulate Clerk) — 陈的故事
在烛龙计划的地缘政治漩涡中，一个普通的领事馆小职员偶然成为了历史的见证者。

**状态：** 📝 第一幕大纲

---

## 🎭 角色

| 角色 | 定位 | 故事线 | 状态 |
|------|------|--------|------|
| **维多利亚 (Victoria)** | 发条诗人 / 赛博女仆 | The Clockwork Diary | 📚 连载中 |
| **陈 (Chen)** | 领事馆小职员 | The Consulate Clerk | 📝 大纲 |
| **阿强 (Qiang)** | 云海潜水员 / "金丝雀" | The Heartbeat in the Abyss | ✅ 完成 |
| **铁叔 (Iron Uncle)** | 飞升者 / 锈鲸号船长 | The Heartbeat in the Abyss | ✅ 完成 |

---

## 🎨 多媒体资产

| 资产 | 类型 | 位置 |
|------|------|------|
| 锈鲸号设定图 | 概念图 | `stories/the_heartbeat_in_the_abyss/assets/rusted_whale_design.png` |
| 锈鲸号下潜 | 🎬 视频 (Veo 3.0) | `stories/the_heartbeat_in_the_abyss/assets/ch1_descent_video.mp4` |
| 上帝的瞳孔 | 概念图 | `stories/the_clockwork_diary/assets/gods_pupil.png` |
| 阿强咬合操纵杆 | 概念图 x2 | `stories/the_heartbeat_in_the_abyss/assets/ch3_bite_*.png` |

---

## 🚀 快速开始

### 创建新故事线
1. 在 `stories/` 下创建新文件夹 `{story_name}/`
2. 添加 `outline.md` 或章节文件
3. 创建 `assets/` 子文件夹存放配图与多媒体
4. 更新本 README

### 扩展世界观
1. 在 `worldbuilding/` 相应子文件夹添加设定
2. 保持与现有设定的一致性

---

*"Jupiter doesn't care if you bleed red or leak oil; gravity crushes all the same."*
*—— 云海潜水员谚语*
