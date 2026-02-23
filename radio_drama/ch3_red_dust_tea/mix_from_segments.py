#!/usr/bin/env python3
"""
mix_from_segments.py
从 segments/ 目录的分段 TTS 按剧本顺序拼接主轨，再混入 BGM + SFX

用法（ComfyUI venv）:
  /home/avic/ai_tools/ComfyUI/.venv/bin/python3 mix_from_segments.py
"""

import os, subprocess, tempfile
import numpy as np
import soundfile as sf
from pedalboard import Pedalboard, Reverb

BASE = os.path.dirname(__file__)
SEGS = os.path.join(BASE, "audio/segments")
AUDIO = os.path.join(BASE, "audio")
SFX_LIB = "/home/avic/dev/project-jupiter/sfx_library/assets"
OUTPUT = os.path.join(AUDIO, "radio-drama-ch3-v7.mp3")
SR = 44100

# ── 剧本顺序（segment 文件名 + 角色间停顿秒数）──────────────────────────────
# 格式：(segment_id, gap_after_s)
# gap_after_s: 这个 segment 说完后，下一个 segment 开始前的静默时长
# 旁白→角色：0.4s；角色→角色：0.5s；情绪转折：0.8s；幕间：1.5s

SCRIPT_ORDER = [
    # ── 第一幕：塔尔西斯太空港 ──
    ("NR_001", 0.6),  # 2125年。维多利亚第一次踏上火星…
    ("NR_002", 0.6),  # 空气里弥漫着铁锈的味道…
    ("VI_001", 1.0),  # 这就是大小姐生活的地方吗？
    ("NR_003", 0.5),  # 通关大厅有两条通道…维多利亚走向蓝色通道…
    ("NR_004", 0.4),  # 就在她通过的时候…
    ("AU_001", 0.5),  # 我是公民。我有碳基通道的通行资格。
    ("ST_001", 0.4),  # 先生，我们的系统显示…
    ("AU_002", 1.5),  # 我是公民。我是飞升者，不是批产机器人。
    ("NR_005", 1.5),  # 没有人去帮他…然后她走进了城市里。
    # ── 第二幕：锈红酒吧 ──
    ("NR_006", 0.6),  # 距离约定的见面时间…吧台后面的那个男人…
    ("BA_001", 0.5),  # 要点什么，小姐？
    ("VI_002", 0.8),  # 大吉岭红茶，谢谢。要热的。
    ("BA_002", 0.6),  # 地球佬的饮料？你是个机器人…
    ("VI_003", 1.0),  # 我有钱。
    ("BA_003", 0.5),  # 拿这玩意儿买茶，你还真够疯的…
    ("VI_004", 1.5),  # 没关系。有点咸味的茶，才像火星的味道。
    # ── 第三幕：故事的交换 ──
    ("NR_007", 0.6),  # 茶端上来了…维多利亚端起杯子…
    ("VI_005", 0.8),  # 很独特。像……眼泪的味道。
    ("BA_004", 0.6),  # 眼泪？在火星，流泪是浪费水分…
    ("VI_006", 1.5),  # 也许吧。但这杯水，曾经也是某块冰…
    ("NR_008", 0.5),  # 调酒师沉默了…
    ("BA_005", 0.8),  # 你知道这玩意儿是怎么来的吗？
    ("VI_007", 0.8),  # 愿闻其详。
    ("BA_006", 0.8),  # 五年前，水手谷大塌方…（核心故事段）
    ("VI_008", 0.5),  # 所以你就把它装在了身上…
    ("BA_007", 1.5),  # 提醒我，有时候，活下去不需要希望。只需要一直挖。
    ("VI_009", 1.5),  # 这是一个很好的故事。比茶好喝。
    ("NR_009", 0.5),  # 沉默了一会儿…
    ("VI_010", 0.6),  # 那次塌方，下面还有其他人吗？
    ("BA_008", 0.6),  # 有。十几个工人…
    ("VI_011", 0.6),  # AI工人先被救出来了吗？
    ("BA_009", 1.5),  # 不。先救人类…
    ("VI_012", 1.8),  # 那些AI里……有觉醒的吗？
    ("BA_010", 1.8),  # 我不知道。没有人问过这个问题。
    ("NR_010", 1.0),  # 那个问题在维多利亚的处理器里转了几圈…
    ("BA_011", 0.6),  # 那你呢？像你这么高级的型号…
    ("VI_013", 0.5),  # 我来找家人。
    ("BA_012", 0.4),  # 家人？
    ("VI_014", 0.6),  # 她是我的监护人，也是我的妹妹…
    ("BA_013", 0.6),  # 种树？在火星种树？那是疯子才干的事。
    ("VI_015", 1.8),  # 也许吧。但如果没人当疯子…
    # ── 第四幕：重逢 ──
    ("SH_001", 0.5),  # 天哪——维多利亚！…我找了半个太空港！
    ("VI_016", 0.4),  # 大小姐。
    ("SH_002", 0.8),  # 别叫我大小姐，叫我希瓦。
    ("SH_003", 0.6),  # 老天，见到你真好…我需要一点别的颜色。
    ("VI_017", 0.6),  # 我给您带了礼物。木卫三温室培育的蓝纹甜橙。
    ("SH_004", 1.5),  # 快走，回宿舍！…合成营养膏我已经吃吐了！
    ("NR_011", 0.5),  # 临走前，维多利亚转过身…
    ("VI_018", 2.0),  # 谢谢款待。这确实是……眼泪的味道。但这眼泪里，有生命。
    # ── 第五幕：火星的夜 ──
    ("NR_012", 0.8),  # 那天晚上，在希瓦的宿舍里…
    ("SH_005", 0.6),  # 你知道吗，维多利亚…我看不到那天了。
    ("VI_019", 0.4),  # 您会看到的。
    ("SH_006", 0.4),  # 怎么看？变成鬼吗？
    ("VI_020", 1.5),  # 我会替您看…存进我的硬盘里…
    ("SH_007", 0.6),  # 说起来，你们那边现在怎么样？…觉醒者…
    ("VI_021", 0.6),  # 还在讨论。有些人在讨论，有些人已经走了。
    ("SH_008", 0.8),  # 你呢？
    ("VI_022", 1.5),  # 我还在这里。字面意义上——在火星，在这个宿舍里，剥甜橙。
    ("SH_009", 0.8),  # 火星这边AI劳工的比例已经超过90%了…
    ("NR_013", 1.0),  # 她停了一下。
    ("SH_010", 1.5),  # 我有时候觉得……那些在工地上挖土的AI…
    ("VI_023", 1.5),  # 也许有一天会有的。名字。
    ("SH_011", 2.0),  # 也许。那就拜托你了，我的……发条记录员。
    ("NR_014", 0.0),  # 维多利亚没有说话…（结尾无需gap）
]


# ── BGM 配置（时间将在主轨拼完后确定） ─────────────────────────────────────
# 关键幕次分界 segment 索引（从0开始）
# 第一幕结束：NR_005 后 → 进入第二幕 NR_006
# 第五幕开始：NR_012 处
# 以下在拼接后根据累计时间计算

# BGM 参数（start/end 在主轨拼接后填入）
BGM_SEGS_MARK = {
    "spaceport_start": 0,  # 从头开始
    "spaceport_end_after": "NR_005",  # 第一幕结束后
    "bar_start_from": "NR_006",  # 第二幕开始
    "bar_end_after": "SH_004",  # 希瓦入场段结束
    "dorm_start_from": "NR_012",  # 第五幕开始
    "dorm_end": -1,  # 结尾
}
BGM_VOL = 0.18

# SFX 配置：(file, after_segment, offset_s, vol_db, room, wet)
# after_segment: 在该 segment 开始后 offset_s 秒插入
SFX_CUES_REL = [
    ("sci-fi/engine_rumble.mp3", "NR_001", 0.0, -11, 0.40, 0.25),
    ("sci-fi/airlock_open.mp3", "NR_001", 6.5, -10, 0.40, 0.25),
    ("ambience/crowd_indoor.mp3", "NR_001", 9.0, -16, 0.40, 0.25),
    ("sci-fi/scanner_beep.mp3", "NR_003", 18.0, -8, 0.35, 0.20),
    ("foley/bone_hollow_hit.mp3", "NR_006", 0.2, -9, 0.18, 0.15),
    ("ambience/bar_crowd_jazz.mp3", "NR_006", 0.8, -18, 0.18, 0.15),
    ("foley/glass_on_counter.mp3", "VI_003", 0.5, -8, 0.18, 0.15),
    ("foley/liquid_pour.mp3", "NR_007", 8.0, -11, 0.18, 0.15),
    ("foley/drink_sip.mp3", "NR_007", 12.5, -11, 0.18, 0.15),
    ("foley/glass_clink.mp3", "NR_007", 13.8, -13, 0.18, 0.15),
    ("sci-fi/exoskeleton_footsteps.mp3", "VI_015", 3.0, -10, 0.18, 0.15),
    ("nature/wind_storm.mp3", "SH_001", -2.5, -8, 0.18, 0.15),
    ("foley/door_heavy_metal_open.mp3", "SH_001", -2.0, -10, 0.18, 0.15),
    ("foley/door_close.mp3", "SH_001", 0.8, -9, 0.18, 0.15),
    ("sci-fi/robot_mechanism.mp3", "VI_018", 2.0, -12, 0.18, 0.15),
    ("ambience/mars_wind_sand.mp3", "NR_012", 0.5, -18, 0.12, 0.10),
    ("foley/liquid_pour_tea.mp3", "NR_012", 9.0, -16, 0.12, 0.10),
]


def load_mono(path, sr=SR, max_dur=None):
    tmp = tempfile.mktemp(suffix=".wav")
    cmd = ["ffmpeg", "-y", "-i", path, "-ar", str(sr), "-ac", "1", "-f", "wav"]
    if max_dur:
        cmd += ["-t", str(max_dur)]
    cmd.append(tmp)
    subprocess.run(cmd, capture_output=True)
    data, _ = sf.read(tmp, dtype="float32")
    os.unlink(tmp)
    return data


def add_reverb(audio, room=0.2, wet=0.15):
    board = Pedalboard(
        [Reverb(room_size=room, wet_level=wet, dry_level=1.0 - wet * 0.3, damping=0.5)]
    )
    return board(audio.reshape(1, -1), SR).reshape(-1)


def db2lin(db):
    return 10 ** (db / 20.0)


def mix():
    # ── 1. 拼接主轨 ──────────────────────────────────────────────────────────
    print("拼接分段主轨...")
    segments_audio = []
    seg_start_times = {}  # segment_id → 在主轨中的起始秒数
    cursor = 0.0

    for seg_id, gap in SCRIPT_ORDER:
        seg_path = os.path.join(SEGS, f"{seg_id}.mp3")
        if not os.path.exists(seg_path):
            print(f"  ✗ 缺失: {seg_id}.mp3")
            continue
        audio = load_mono(seg_path)
        dur = len(audio) / SR
        seg_start_times[seg_id] = cursor
        segments_audio.append(audio)
        cursor += dur + gap
        # 静默填充
        if gap > 0:
            silence = np.zeros(int(gap * SR), dtype="float32")
            segments_audio.append(silence)

    total_dur = cursor
    print(
        f"  主轨总时长: {total_dur:.1f}s ({int(total_dur // 60)}m{total_dur % 60:.1f}s)"
    )

    # 拼接为单个数组
    tts_buf = np.concatenate(segments_audio).astype("float32")
    buf = np.zeros(len(tts_buf) + SR, dtype="float32")
    buf[: len(tts_buf)] = tts_buf

    # ── 2. 计算 BGM 切点 ──────────────────────────────────────────────────────
    sp_start = 0.0
    sp_end = seg_start_times.get("NR_005", 0) + get_seg_dur("NR_005") + 1.5
    bar_start = seg_start_times.get("NR_006", sp_end) - 1.5
    bar_end = seg_start_times.get("SH_004", 0) + get_seg_dur("SH_004") + 1.0
    dorm_start = seg_start_times.get("NR_012", 0) - 1.0
    dorm_end = total_dur

    print(f"  BGM spaceport: {sp_start:.1f}s ~ {sp_end:.1f}s")
    print(f"  BGM bar:       {bar_start:.1f}s ~ {bar_end:.1f}s")
    print(f"  BGM dorm:      {dorm_start:.1f}s ~ {dorm_end:.1f}s")

    # ── 3. 混入 BGM ───────────────────────────────────────────────────────────
    print("混入 BGM...")
    BGM_CONFIGS = [
        (os.path.join(AUDIO, "bgm-spaceport.mp3"), sp_start, sp_end, 3, 4, BGM_VOL),
        (os.path.join(AUDIO, "bgm-bar.mp3"), bar_start, bar_end, 3, 3, BGM_VOL),
        (os.path.join(AUDIO, "bgm-dorm.mp3"), dorm_start, dorm_end, 4, 6, BGM_VOL),
    ]
    for bgm_path, start, end, fi, fo, vol in BGM_CONFIGS:
        if not os.path.exists(bgm_path):
            print(f"  ✗ 未找到: {bgm_path}")
            continue
        dur = end - start
        raw = load_mono(bgm_path)
        need = int(dur * SR)
        reps = (need // len(raw)) + 2
        loop = np.tile(raw, reps)[:need].copy()
        fi_s, fo_s = int(fi * SR), int(fo * SR)
        loop[:fi_s] *= np.linspace(0, 1, fi_s)
        loop[-fo_s:] *= np.linspace(1, 0, fo_s)
        loop *= vol
        s2 = int(start * SR)
        e2 = min(s2 + len(loop), len(buf))
        buf[s2:e2] += loop[: e2 - s2]
        m, s = divmod(start, 60)
        print(f"  ✓ {os.path.basename(bgm_path)} @ {int(m):02d}:{s:04.1f}")

    # ── 4. 混入 SFX ───────────────────────────────────────────────────────────
    print("混入音效...")
    for sfx_rel, after_seg, offset_s, vol_db, room, wet in SFX_CUES_REL:
        sfx_path = os.path.join(SFX_LIB, sfx_rel)
        if not os.path.exists(sfx_path):
            print(f"  ✗ 未找到: {sfx_path}")
            continue
        seg_t = seg_start_times.get(after_seg)
        if seg_t is None:
            print(f"  ✗ segment 未找到: {after_seg}")
            continue
        cue_t = seg_t + offset_s
        if cue_t < 0:
            cue_t = 0

        max_dur = (
            30 if any(x in sfx_path for x in ["crowd", "jazz", "mars_wind"]) else None
        )
        raw = load_mono(sfx_path, max_dur=max_dur)
        rev = add_reverb(raw, room=room, wet=wet)
        rev *= db2lin(vol_db)
        s2 = int(cue_t * SR)
        e2 = min(s2 + len(rev), len(buf))
        buf[s2:e2] += rev[: e2 - s2]
        m, s = divmod(cue_t, 60)
        print(f"  ✓ {os.path.basename(sfx_path)} @ {int(m):02d}:{s:04.1f}")

    # ── 5. 酒吧段 +4dB 增益（调酒师低频补偿）────────────────────────────────
    FADE = int(0.5 * SR)
    bar_gain_s = int(bar_start * SR)
    bar_gain_e = min(int(bar_end * SR), len(buf))
    gain = db2lin(4.0)
    buf[bar_gain_s + FADE : bar_gain_e - FADE] *= gain
    if FADE > 0:
        buf[bar_gain_s : bar_gain_s + FADE] *= np.linspace(1.0, gain, FADE)
        buf[bar_gain_e - FADE : bar_gain_e] *= np.linspace(gain, 1.0, FADE)
    print(f"  酒吧段 {bar_start:.0f}~{bar_end:.0f}s 提升 +4dB")

    # ── 6. 归一化 + 输出 ──────────────────────────────────────────────────────
    peak = np.max(np.abs(buf))
    if peak > 0.95:
        buf = buf * (0.93 / peak)
        print(f"  归一化: {peak:.3f} → 0.93")

    tmp_wav = tempfile.mktemp(suffix=".wav")
    sf.write(tmp_wav, buf, SR)
    subprocess.run(
        ["ffmpeg", "-y", "-i", tmp_wav, "-codec:a", "libmp3lame", "-q:a", "2", OUTPUT],
        capture_output=True,
    )
    os.unlink(tmp_wav)

    out_dur = float(
        subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "quiet",
                "-show_entries",
                "format=duration",
                "-of",
                "csv=p=0",
                OUTPUT,
            ]
        )
        .decode()
        .strip()
    )
    m, s = divmod(out_dur, 60)
    size = os.path.getsize(OUTPUT) / 1024 / 1024
    print(f"\n✓ 完成: {OUTPUT}")
    print(f"  时长: {int(m)}m{s:.1f}s  |  大小: {size:.1f}MB")

    # 打印 segment 时间轴供参考
    print(f"\n  Segment 时间轴：")
    for seg_id, _ in SCRIPT_ORDER[:10]:
        t = seg_start_times.get(seg_id, -1)
        m2, s2 = divmod(t, 60)
        print(f"    {seg_id}: {t:.1f}s ({int(m2):02d}:{s2:04.1f})")
    print("    ...")


def get_seg_dur(seg_id):
    p = os.path.join(SEGS, f"{seg_id}.mp3")
    if not os.path.exists(p):
        return 0.0
    out = (
        subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "quiet",
                "-show_entries",
                "format=duration",
                "-of",
                "csv=p=0",
                p,
            ]
        )
        .decode()
        .strip()
    )
    return float(out)


if __name__ == "__main__":
    mix()
