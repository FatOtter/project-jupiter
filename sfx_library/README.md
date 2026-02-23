# SFX Library — 广播剧音效素材库

本目录维护 Project Jupiter 及其他广播剧制作所需的音效素材。

## 授权要求

**本库仅收录 CC0（公共领域）授权的音效**，可自由用于任何目的，无需标注来源。

推荐来源：
- [Freesound.org](https://freesound.org) — 搜索时勾选 "Creative Commons 0"，登录后可下载完整文件
- [OpenGameArt.org](https://opengameart.org) — 过滤 CC0 分类
- [Sonniss GDC Bundle](https://sonniss.com/gameaudiogdc) — 每年发布的免费游戏音效包（商用免费）

## 目录结构

```
assets/
├── ambience/        环境底噪（人群、酒吧背景、风声等）
├── foley/           拟音动作（脚步、开门、倒酒、物件碰撞等）
├── sci-fi/          科幻特效（扫描音、气压平衡、飞船引擎等）
└── nature/          自然环境（风、雨、沙漠等）
```

## 添加新音效

1. 下载文件，放入对应子目录
2. 在 `catalog.md` 中添加一行记录（文件名、时长、标签、来源）
3. 标签用 `#` 前缀，多标签空格分隔，供 `sfx_lookup.py` 检索

## 在广播剧剧本中引用音效

剧本中使用如下格式引用：

```
【SFX: #door #metal #open @ 台词结束后0.5s】
【SFX: scanner_beep.mp3 @ 00:35】
```

- `#标签` 检索方式：混音脚本从 catalog.md 自动匹配第一个符合所有标签的文件
- 文件名方式：直接指定文件名，优先级更高

## 当前收录情况

见 `catalog.md`。
