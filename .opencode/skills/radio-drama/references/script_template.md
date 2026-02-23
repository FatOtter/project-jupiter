# 广播剧剧本模板

## 文件头

```markdown
# 广播剧剧本：{标题}
## 《{作品名}》{章节}改编
### {年份}，{地点}

---

## 角色设定

| 角色 | 声线标签 | Segment缩写 | 特征 |
|------|---------|------------|------|
| **旁白** | `[narrator_zh]` | `NR` | 克制、旁观、叙事感 |
| **{角色名}** | `[tag_name]` | `XX` | 性格特征简述 |

---

## 制作注记

### 声线说明
- 旁白：`[narrator_zh]`，Segment缩写 `NR`
- 主角：`[victoria_custom]`，Segment缩写 `VI`

### BGM 说明
- 第N幕：`bgm-{scene}.mp3`，风格描述

### 分段生产
- 按角色批次生成，段间用 `[pause:3.0]` 分隔
- 用 `split_segments.py` 自动切割
- 用 `mix_from_segments.py` 拼接混音

### 混音指引
- BGM音量：`vol=0.18`（约-15dB）
- 段间停顿：角色切换 0.5s，情绪转折 0.8s，幕间 1.5s
- 音效 Reverb：太空港 room=0.40，室内 room=0.18，密闭 room=0.12
- 低频男声段落 +4dB 补偿（调酒师、铁叔等）

---

## 剧本正文
```

---

## 幕次模板

```markdown
### 第N幕：{幕名}

**【BGM: bgm-scene.mp3 淡入3s 起始:幕开场】**

**【SFX: #类别 #描述词 @ 幕开场后Xs】**

【停顿 0.8秒】

[narrator_zh] 旁白内容，描述场景。[pause:0.8] 继续旁白。

【停顿 0.4秒】

[character_tag]（情绪说明）台词内容。[pause:0.6] 续台词。

【停顿 0.5秒】

[another_character] 回应台词。[pause:0.4] 继续说话。

**【BGM: bgm-scene.mp3 淡出3s】**
```

---

## 标注格式速查

### BGM 标注
```
【BGM: bgm-filename.mp3 淡入Xs 起始:幕开场】
【BGM: bgm-filename.mp3 淡出Xs】
```

### SFX 标注（优先用标签检索）
```
【SFX: #door #metal #open @ 00:05】
【SFX: scanner_beep.mp3 @ 00:35】     ← 文件名直接引用
【SFX: #bone #crack @ BA_006 开始后0.5s】  ← 分段模式下的相对位置
```

常用标签组合：
- 开门：`#door #metal #open #heavy`
- 关门：`#door #close #slam`
- 金属脚步：`#footstep #metal #grate`
- 外骨骼：`#footstep #exoskeleton #sci-fi`
- 扫描：`#scanner #beep #confirm`
- 气闸：`#airlock #pressure #sci-fi`
- 酒吧底噪：`#ambience #bar #crowd #jazz`
- 太空港人群：`#ambience #spaceport #crowd`
- 骨骼断裂：`#bone #crack`

### Pause Tag（嵌入台词文本）

```
[character_tag] 说完第一句。[pause:0.6] 然后说第二句。
[character_tag] 这里有长停顿。[pause:1.5] 情绪转折后继续。
```

| 场景 | 推荐值 |
|------|--------|
| 句内短停顿 | `[pause:0.4]` ~ `[pause:0.6]` |
| 角色切换前 | `[pause:0.5]` ~ `[pause:0.8]` |
| 情绪重要时刻 | `[pause:1.0]` ~ `[pause:1.5]` |
| 幕间过渡 | `[pause:2.0]` ~ `[pause:2.5]` |
| 极度震撼/沉默 | `[pause:3.0]` |
| 分段切割标记 | `[pause:3.0]`（批次TTS中段与段之间）|

**不要低于 0.4s**，否则导致吞音（上一句末字与下一句粘连）。

---

## SCRIPT_ORDER 模板（mix_from_segments.py 用）

```python
SCRIPT_ORDER = [
    # 第一幕
    # (segment_id, gap_after_s)
    # gap = 该段结束后到下一段开始的静默时长
    ("NR_001", 0.6),   # 旁白开场
    ("VI_001", 1.0),   # 主角第一句（情绪转折后留更长）
    ("BA_001", 0.5),   # 调酒师回应

    # 第二幕（幕间留1.5s）
    ("NR_002", 1.5),   # 旁白引入新幕
    ("SH_001", 0.5),   # 希瓦入场
    ...
    ("NR_014", 0.0),   # 结尾段不需要 gap
]
```

段间停顿原则：
- 旁白→角色：`0.4s`
- 角色→旁白：`0.6s`
- 角色→角色（同幕）：`0.5s`
- 情绪转折后：`0.8s` ~ `1.0s`
- 幕间：`1.5s`
- 段尾（最后一个）：`0.0`

---

## SFX_CUES_REL 模板（分段模式下的音效定位）

```python
SFX_CUES_REL = [
    # (sfx相对路径, 对齐segment, segment内偏移秒, vol_db, room_size, wet_level)
    ("sci-fi/engine_rumble.mp3",       "NR_001",  0.0,  -11, 0.40, 0.25),
    ("sci-fi/scanner_beep.mp3",        "NR_003", 18.0,   -8, 0.35, 0.20),
    ("foley/bone_hollow_hit.mp3",      "NR_006",  0.2,   -9, 0.18, 0.15),
    ("ambience/bar_crowd_jazz.mp3",    "NR_006",  0.8,  -18, 0.18, 0.15),
    # 负偏移：在该段开始前就插入（如开门声在角色入场前）
    ("foley/door_heavy_metal_open.mp3","SH_001", -2.0,  -10, 0.18, 0.15),
]
```

---

## 完整示例片段

```markdown
### 第一幕：塔尔西斯太空港

**【BGM: bgm-spaceport.mp3 淡入3s 起始:幕开场】**
**【SFX: sci-fi/engine_rumble.mp3 @ NR_001 开场后0s】**
**【SFX: sci-fi/scanner_beep.mp3 @ NR_003 开场后18s】**

[narrator_zh] 2125年。[pause:0.8] 维多利亚第一次踏上火星的土地。[pause:0.8]
塔尔西斯太空港，奥林帕斯山脚下。

[victoria_custom]（轻声自语）这就是大小姐生活的地方吗？

[augmented_man]（克制，疲惫）我是公民。[pause:0.6] 我有碳基通道的通行资格。

[staff_voice]（职业化）先生，我们的系统显示您的生物特征中超过40%为非有机材质——

[augmented_man]（更重）我是公民。[pause:0.5] 我是飞升者，不是批产机器人。

[narrator_zh] 没有人去帮他。[pause:0.8] 争执还在继续，低声的，疲惫的，
像是已经发生过很多次了。

**【BGM: bgm-spaceport.mp3 淡出3s】**
```

---

## 两段TTS模式（特殊场景）

当故事中有角色音色突变（飞升、意识转移等）：

```markdown
### ══ PART A ══
（飞升前，使用 [qiang_human]）

### ══ PART B ══
（飞升后，使用 [qiang_mech]）
```

混音拼接：
```
Part A 末尾淡出1.5s
→ 静默 2s
→ neural_transfer音效（4s）
→ Part B 淡入1.5s
```
