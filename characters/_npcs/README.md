# NPC 声线库

本目录维护跨世界观通用的 NPC 声线，可在任何广播剧中直接引用。

## 现有 NPC 列表

| 目录 | TTS 标签 | 描述 | 状态 |
|------|---------|------|------|
| `narrator/` | `[narrator_zh]` | 中文旁白，成熟女声，叙事感 | ✅ 可用 |
| `passerby_male_young/` | `[passerby_male_young]` | 年轻男路人，自然随意 | ✅ 可用 |
| `passerby_male_mid/` | `[passerby_male_mid]` | 中年男路人，平稳厚实 | ✅ 可用 |
| `passerby_male_old/` | `[passerby_male_old]` | 老年男路人，沙哑低沉 | ✅ 可用 |
| `passerby_female_young/` | `[passerby_female_young]` | 年轻女路人，自然活泼 | ✅ 可用 |
| `passerby_female_mid/` | `[passerby_female_mid]` | 中年女路人，温和平稳 | ✅ 可用 |
| `passerby_female_old/` | `[passerby_female_old]` | 老年女路人，慈祥偏软 | ✅ 可用 |
| `official_male/` | `[official_male]` | 官方/播报男声，标准中性 | ✅ 可用 |
| `official_female/` | `[official_female]` | 官方/播报女声，标准中性 | ✅ 可用 |

## 使用规范

在广播剧 TTS 文本中直接引用标签：

```
[narrator_zh] 2125年，塔尔西斯太空港。
[passerby_male_young] 哎，那边排队呢！
[official_female] 请注意，碳基通道即将关闭。
```

在 radio_drama workflow 中，所有 NPC 声线均已通过 VoiceDesigner 预生成并缓存，
不需要在每次制作时重新生成。
