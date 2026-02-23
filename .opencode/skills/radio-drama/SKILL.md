---
name: radio-drama
description: End-to-end workflow for producing multi-character Chinese radio dramas using ComfyUI TTS, a character library, and an SFX asset library. Use this skill when the user asks to produce, mix, or modify a radio drama (广播剧). Covers script formatting, character voice lookup, SFX retrieval, TTS generation, segment-based production, and mixing.
---

# Radio Drama Production Skill

Full pipeline: script → voice design → segment TTS → split → mix → final MP3.

Two production modes depending on complexity:
- **Simple (single TTS)**: small cast, no major reshoots expected → one full-script TTS call
- **Segment-based (recommended)**: larger cast, expected iterations → per-character batch TTS + auto-split → assemble with `mix_from_segments.py`

---

## 1. Project Layout

```
project-root/
├── characters/
│   ├── _npcs/                    # 通用NPC声线库
│   └── {character}/
│       ├── profile.md            # 声线标签、提示词、出演记录
│       └── voice/voice_prompt.md
├── sfx_library/
│   ├── catalog.md                # 音效索引
│   └── assets/{category}/
└── radio_drama/
    └── {world}/{chapter}/
        ├── script.md             # 剧本（含BGM/SFX标注）
        ├── split_segments.py     # 批次切割工具（每剧一份）
        ├── mix_from_segments.py  # 分段组装混音脚本（每剧一份）
        └── audio/
            ├── segments/         # 切割后的单角色单段MP3
            │   ├── NR_001.mp3
            │   ├── VI_001.mp3
            │   └── ...
            ├── batch_NR.mp3      # 批次TTS原始输出（临时，可删）
            ├── bgm-{scene}.mp3
            └── radio-drama-{world}-{ch}-vN.mp3
```

---

## 2. 角色声线速查（所有已有声线）

| 角色 | 标签 | 文件 | 备注 |
|------|------|------|------|
| 维多利亚 | `[victoria_custom]` | `voices/victoria_custom.wav` | 温柔年轻，气息感，中低音 |
| 希瓦·林 | `[shiva_lin]` | `voices/shiva_lin.wav` | 成熟女性，工程师气质，**必须强调女性音域** |
| 三手调酒师 | `[bartender_mars]` | `voices/bartender_mars.wav` | 粗哑金属共鸣，口语快节奏 |
| 旁白（中文） | `[narrator_zh]` | `voices/narrator_zh.wav` | 沉稳低沉，叙事感，语速极慢 |
| 飞升者 | `[augmented_man]` | `voices/augmented_man.wav` | 克制疲惫，金属共鸣 |
| 地勤职员 | `[staff_voice]` | `voices/staff_voice.wav` | 职业化，平板疏离 |
| 阿强（人类） | `[qiang_human]` | `voices/qiang_human.wav` | 年轻，肾上腺素，口语化 |
| 阿强（飞升） | `[qiang_mech]` | `voices/qiang_mech.wav` | 同人格，深沉金属共鸣 |
| 铁叔 | `[iron_uncle]` | `voices/iron_uncle.wav` | 极低沉，研磨齿轮，权威感 |
| 艾娃AI | `[ava_ai]` | `voices/ava_ai.wav` | 平静合成，完全无情感 |
| 路人年轻男 | `[passerby_male_young]` | `voices/passerby_male_young.wav` | |
| 路人中年男 | `[passerby_male_mid]` | `voices/passerby_male_mid.wav` | |
| 路人老年男 | `[passerby_male_old]` | `voices/passerby_male_old.wav` | |
| 路人年轻女 | `[passerby_female_young]` | `voices/passerby_female_young.wav` | |
| 路人中年女 | `[passerby_female_mid]` | `voices/passerby_female_mid.wav` | |
| 路人老年女 | `[passerby_female_old]` | `voices/passerby_female_old.wav` | |
| 官方播报男 | `[official_male]` | `voices/official_male.wav` | |
| 官方播报女 | `[official_female]` | `voices/official_female.wav` | |

---

## 3. 可用 Workflows

| Workflow ID | 用途 | 最多 VoiceDesign 角色数 |
|-------------|------|------------------------|
| `radio_drama_ch3` | 火星红茶剧组（6角色）| 6（victoria/narrator/bartender/shiva/augmented/staff）|
| `radio_drama_abyss` | 锈鲸号剧组（6角色）| 6（qiang_human/qiang_mech/iron_uncle/ava_ai/narrator/official）|
| `generate_npc_voice` | 单角色声线生成/覆盖 | 1（通用，任意 character_name）|

**新建剧的 workflow 创建规则：**
- 复制 `radio_drama_ch3.json` → 修改 `character_name` 字段
- 每个 VoiceDesignerNode 对应一个角色，最多6个
- 串联顺序：所有 VoiceDesignerNode → 链式 RefreshVoiceCacheNode → UnifiedTTSTextNode

---

## 4. VoiceDesigner 关键经验

### 性别混乱问题（重要）

Qwen3-TTS VoiceDesigner 在以下情况会生成错误性别声线：
- 提示词写了"中低音域"但没有明确性别
- 提示词包含年龄数字（如"60岁"）时模型倾向于男声

**女性角色声线提示词规范：**
```
成熟女性，女性声线，女性音域，不要低于女性音域范围。
四五十岁的女性声音，有力量感……
普通话，女性，中音偏低但绝对不能是男声，必须是女性音色。
```
关键：**"女性"在提示词中出现至少3次**，明确排除"不能是男声"。

### NPC 批量生成覆盖问题（重要）

`radio_drama_ch3` 的6个 VoiceDesignerNode 的 `character_name` 是**硬编码**的。
若用该 workflow 批量生成 NPC 台词时传入 NPC 的 `voice_desc`，会覆盖对应的角色声线文件。

**正确做法：**
- NPC 声线生成/覆盖用 `generate_npc_voice` workflow（`character_name` 参数化）
- 每次只生成一个角色，逐个 poll 完成

### TTS 质量参数

`radio_drama_ch3.json` / `radio_drama_abyss.json` 中已设置：
```json
"temperature": 0.75,         // 降低随机性，语速更稳定（默认0.9太快）
"repetition_penalty": 1.02   // 轻微防重复
```
不要把 temperature 调回 0.9，否则语速偏快、节奏不稳。

---

## 5. 剧本格式规范

```markdown
### 第N幕：幕名

【BGM: bgm-scene.mp3 淡入3s 起始:幕开场】
【SFX: #door #metal #open @ 00:05】

[narrator_zh] 旁白内容。[pause:0.8] 继续旁白。

[character_tag]（情绪说明）台词内容。[pause:0.6] 续台词。

【BGM: bgm-scene.mp3 淡出3s】
```

### Pause tag 数值参考

| 场景 | 推荐值 |
|------|--------|
| 角色切换 | `[pause:0.5]` ~ `[pause:0.8]` |
| 句内短停顿 | `[pause:0.4]` ~ `[pause:0.6]` |
| 情绪转折 | `[pause:1.0]` ~ `[pause:1.5]` |
| 幕间过渡 | `[pause:2.0]` ~ `[pause:2.5]` |
| 极度震撼 | `[pause:3.0]` |

**段落间停顿原则：** 旁白→角色 `0.4s`，角色→角色 `0.5s`，情绪重的转折 `0.8s`，幕间 `1.5s`。过短会导致吞音，**不要低于 0.4s**。

---

## 6. 分段 TTS 生产方式（推荐）

适用场景：角色 ≥4个、预期需要局部重录、多次迭代的项目。

### 分段命名规范

```
{角色缩写}_{序号:03d}.mp3
```

| 角色 | 缩写 |
|------|------|
| 旁白 | `NR` |
| 维多利亚 | `VI` |
| 调酒师 | `BA` |
| 希瓦 | `SH` |
| 飞升者 | `AU` |
| 地勤 | `ST` |
| 阿强人类 | `QH` |
| 阿强机械 | `QM` |
| 铁叔 | `IU` |
| 艾娃 | `AV` |
| 新角色 | 取角色名前2字母大写 |

### 生产流程

**Step 1：按角色批次生成**

在 TTS 文本中，同一角色的多段台词合并为一次调用，段间用 `[pause:3.0]` 分隔（作为切割标记）：

```python
result = run_workflow(
    workflow_id="radio_drama_ch3",
    overrides={
        # 所有 voice_desc 必须填写（即使该批次不用那个角色）
        "victoria_voice_desc": "...",
        "narrator_voice_desc": "...",
        # ... 其他角色保持 profile.md 中的描述
        "text": "[narrator_zh] 第一段旁白内容。[pause:3.0] [narrator_zh] 第二段旁白。[pause:3.0] [narrator_zh] 第三段旁白。",
        "seed": 3888
    }
)
```

**Step 2：自动切割**

```bash
/home/avic/ai_tools/ComfyUI/.venv/bin/python3 split_segments.py \
  audio/batch_NR.mp3 \
  NR_001 NR_002 NR_003 ...
```

`split_segments.py` 通过 ffmpeg silencedetect（阈值 -38dB，最小时长 2.5s）自动定位切割点。
检测到的切割点数量应等于段数 - 1，否则会输出警告。

**Step 3：拼接混音**

编辑 `mix_from_segments.py` 中的 `SCRIPT_ORDER` 列表，指定每个 segment 的播放顺序和间隔：

```python
SCRIPT_ORDER = [
    # (segment_id, gap_after_s)  # gap = 下一段开始前的静默时长
    ("NR_001", 0.6),   # 旁白→下一段
    ("VI_001", 1.0),   # 维多利亚→下一段（情绪转折后）
    ("BA_001", 0.5),   # 调酒师→下一段
    ...
]
```

运行：
```bash
/home/avic/ai_tools/ComfyUI/.venv/bin/python3 mix_from_segments.py
```

### 局部重录工作流

只需重录单个 segment：

```bash
# 1. 单独生成目标 segment（用 generate_npc_voice 或 radio_drama_ch3）
# 2. 切割后替换 audio/segments/XX_NNN.mp3
# 3. 重跑 mix_from_segments.py
```

不需要重新生成整个 TTS，也不影响其他角色的声线。

---

## 7. 特殊制作场景

### 场景A：两段 TTS 拼接（意识转移/身份转变）

适用于角色在故事中发生音色突变的场景（如飞升后声线变化）。

```python
# Part A：变化前，使用原声线
text_A = "[qiang_human] 给老子上去啊！"
# Part B：变化后，使用新声线
text_B = "[qiang_mech] 我们拿到同位素了吗？"

# 混音时：Part A 末尾淡出 → 静默 2s → neural_transfer 音效 → Part B 淡入
PART_B_OFFSET = len_partA + 1.5 + 2.0 + 4.0  # 淡出 + 静默 + 过渡音
```

`neural_transfer.mp3` 合成方式：`cryo_freeze.mp3`（降调4半音）+ `digital_glitch.mp3` 叠加。

### 场景B：AI 崩坏音效处理（pedalboard）

对 AI 角色的台词在混音阶段做分级处理：

```python
from pedalboard import Pedalboard, Bitcrush, PitchShift, Chorus, Reverb

# 正常监控段：轻微合成感
normal = Pedalboard([Bitcrush(bit_depth=14)])

# 故障段：pitch降调 + 8bit + 合唱效果
glitch = Pedalboard([
    PitchShift(semitones=-3),
    Bitcrush(bit_depth=8),
    Chorus(rate_hz=1.5, depth=0.4, centre_delay_ms=7.0, mix=0.3),
])

# 崩坏/摇篮曲段：更深的pitch + 空洞混响
lullaby = Pedalboard([
    PitchShift(semitones=-2),
    Bitcrush(bit_depth=6),
    Reverb(room_size=0.8, wet_level=0.5, dry_level=0.5),
])
```

处理时对目标时段的音频做渐变融合（前后各 0.3s）避免突变。

---

## 8. 混音参数规范

### BGM 音量
- 对话期间：`vol = 0.18`（约 -15dB），不遮盖台词
- BGM 淡入：3~4s；淡出：3~6s（结尾淡出用 6~8s）

### SFX Reverb 分区

| 场景类型 | room_size | wet_level | 代表场景 |
|----------|-----------|-----------|---------|
| 大型开放空间 | 0.40 | 0.25 | 太空港大厅、飞船引擎 |
| 小型室内 | 0.18 | 0.15 | 酒吧、飞船驾驶舱 |
| 密闭空间 | 0.12 | 0.10 | 宿舍、医疗舱 |

### 低频男声补偿

调酒师/铁叔等低沉男声与 BGM 低频重叠，对该角色集中的段落整体 **+4dB**：

```python
gain = db2lin(4.0)
FADE = int(0.5 * SR)
buf[seg_start + FADE: seg_end - FADE] *= gain
buf[seg_start: seg_start + FADE] *= np.linspace(1.0, gain, FADE)
buf[seg_end - FADE: seg_end] *= np.linspace(gain, 1.0, FADE)
```

### 运行环境

混音脚本必须用 ComfyUI venv 运行（含 pedalboard、soundfile、numpy）：

```bash
/home/avic/ai_tools/ComfyUI/.venv/bin/python3 mix_from_segments.py
```

---

## 9. 音效检索

```bash
python3 .opencode/skills/radio-drama/scripts/sfx_lookup.py --tags "door metal heavy"
```

或查阅 `sfx_library/catalog.md`。常用标签：

| 场景 | 标签 |
|------|------|
| 厚重铁门开 | `#door #metal #open #heavy` |
| 铁门关闭 | `#door #close #slam` |
| 金属脚步 | `#footstep #metal #grate` |
| 外骨骼脚步 | `#footstep #exoskeleton #sci-fi` |
| 扫描哔声 | `#scanner #beep #confirm` |
| 气闸 | `#airlock #pressure #sci-fi` |
| 引擎嗡鸣 | `#engine #rumble #sci-fi` |
| 太空港人群 | `#ambience #spaceport #crowd` |
| 酒吧底噪 | `#ambience #bar #crowd #jazz` |
| 骨骼断裂 | `#bone #crack` |
| 意识转移 | `sci-fi/neural_transfer.mp3`（合成素材）|

---

## 10. BGM 生成

用 `generate_song` workflow，关键参数：

```python
run_workflow("generate_song", overrides={
    "tags": "dark ambient sci-fi, low frequency drone, industrial, no melody, no vocals",
    "lyrics": "[instrumental]",
    "negative": "melody, vocals, singing, drums, guitar, piano",
    "seconds": 90,    # 长度：环境底噪 60~120s，过渡音效 60~80s
    "steps": 60,      # 不低于 60
    "seed": 5001
})
```

BGM 风格参考（已制作的可直接复用）：

| 文件 | 位置 | 风格 |
|------|------|------|
| `bgm-spaceport.mp3` | ch3 | 低频机械嗡鸣，广播提示音 |
| `bgm-bar.mp3` | ch3 | 低沉环境噪声，合成电子音 |
| `bgm-dorm.mp3` | ch3 | 沙尘暴低吼 |
| `bgm-descent.mp3` | ch1 | 深渊下潜，低频压迫 |
| `bgm-struggle.mp3` | ch1 | 心跳+工业噪音，极度紧张 |
| `bgm-crossover.mp3` | ch1 | 混沌→清澈，意识重生 |
| `bgm-epilogue.mp3` | ch1 | 安静忧伤，带一丝希望 |

---

## 11. 输出与发布规范

```
audio/
├── segments/          # 分段原始 MP3（按需替换单段重录）
├── batch_*.mp3        # 批次TTS原始输出（可在验收后删除）
├── tts-full-vN.mp3    # 单次TTS模式的完整输出（可选）
├── bgm-{scene}.mp3    # BGM
└── radio-drama-{world}-{ch}-vN.mp3   # 成品（版本号递增）
```

发布试听：
```bash
cp audio/radio-drama-*-vN.mp3 /home/avic/ai_tools/comfyui-mcp-server/public/gen/
# 访问：http://localhost/gen/radio-drama-*-vN.mp3
```
