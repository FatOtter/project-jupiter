#!/usr/bin/env python3
"""
Radio Drama Mixer — 参数化广播剧混音脚本

从剧本自动解析 BGM 和 SFX 标注，与 TTS 主轨进行混音。

用法:
    python3 mix.py \\
        --tts   path/to/tts-full.mp3 \\
        --script path/to/script.md \\
        --sfx-lib path/to/sfx_library/ \\
        --bgm-dir path/to/audio/ \\
        --output  path/to/output.mp3

依赖（ComfyUI venv）:
    /home/avic/ai_tools/ComfyUI/.venv/bin/python3

内部依赖: numpy, soundfile, pedalboard, ffmpeg
"""

import argparse
import os
import re
import subprocess
import sys
import tempfile

# ── 常量 ──────────────────────────────────────────────────────────────────────

BGM_VOLUME = 0.18  # BGM 混入音量（约 -15dB）
SFX_VOLUME = 0.35  # SFX 默认混入音量（约 -9dB）
SR = 44100  # 目标采样率


# ── 工具函数 ──────────────────────────────────────────────────────────────────


def db(val: float) -> float:
    return 10 ** (val / 20.0)


def load_mono(path: str, sr: int = SR):
    """Load audio as mono float32 at target sample rate via ffmpeg."""
    import numpy as np
    import soundfile as sf

    tmp = tempfile.mktemp(suffix=".wav")
    subprocess.run(
        ["ffmpeg", "-y", "-i", path, "-ar", str(sr), "-ac", "1", "-f", "wav", tmp],
        capture_output=True,
    )
    data, _ = sf.read(tmp, dtype="float32")
    os.unlink(tmp)
    return data


def reverb(audio, sr: int, room_size: float = 0.2, wet: float = 0.15):
    """Apply Reverb using pedalboard."""
    try:
        from pedalboard import Pedalboard, Reverb as PBReverb

        board = Pedalboard(
            [
                PBReverb(
                    room_size=room_size,
                    wet_level=wet,
                    dry_level=1.0 - wet * 0.3,
                    damping=0.5,
                )
            ]
        )
        return board(audio.reshape(1, -1), sr).reshape(-1)
    except Exception as e:
        print(f"  ⚠ Reverb skipped: {e}")
        return audio


def save_mp3(arr, sr: int, path: str):
    import soundfile as sf

    tmp = tempfile.mktemp(suffix=".wav")
    sf.write(tmp, arr, sr)
    subprocess.run(
        ["ffmpeg", "-y", "-i", tmp, "-codec:a", "libmp3lame", "-q:a", "2", path],
        capture_output=True,
    )
    os.unlink(tmp)


# ── 剧本解析 ──────────────────────────────────────────────────────────────────


def parse_tts_duration(tts_path: str) -> float:
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
                tts_path,
            ]
        )
        .decode()
        .strip()
    )
    return float(out)


def parse_bgm_cues(script: str, tts_dur: float) -> list[dict]:
    """
    解析剧本中的 BGM 标注。
    格式：【BGM: filename.mp3 淡入Xs 起始:幕开场】
         【BGM: filename.mp3 淡出Xs】
    简化处理：按出现顺序等分 TTS 时长来估算幕次切换点。
    """
    starts = []
    ends = []
    for line in script.splitlines():
        m = re.search(r"【BGM:\s*([\w\-\.]+)\s+淡入(\d+)s", line)
        if m:
            starts.append({"file": m.group(1), "fade_in": int(m.group(2))})
        m = re.search(r"【BGM:\s*([\w\-\.]+)\s+淡出(\d+)s", line)
        if m:
            if ends is not None:
                ends.append({"file": m.group(1), "fade_out": int(m.group(2))})

    # 匹配 start/end pairs（简单配对：同文件名）
    cues = []
    used_starts: set[str] = set()
    # 收集所有出现的 BGM 文件名顺序
    all_bgm = []
    for line in script.splitlines():
        m = re.search(r"【BGM:\s*([\w\-\.]+)", line)
        if m and m.group(1) not in [b["file"] for b in all_bgm]:
            all_bgm.append({"file": m.group(1)})

    if not all_bgm:
        return []

    # 按 BGM 数量等分 TTS 时长
    n = len(all_bgm)
    seg = tts_dur / n
    for i, bgm in enumerate(all_bgm):
        start = i * seg
        end = (i + 1) * seg
        # 查找对应的淡入淡出设置
        fi = next((s["fade_in"] for s in starts if s["file"] == bgm["file"]), 3)
        fo = next((e["fade_out"] for e in ends if e["file"] == bgm["file"]), 3)
        cues.append(
            {
                "file": bgm["file"],
                "start": start,
                "end": end,
                "fade_in": fi,
                "fade_out": fo,
            }
        )
    return cues


def parse_sfx_cues(script: str, sfx_lib: str) -> list[dict]:
    """
    解析剧本中的 SFX 标注。
    格式：【SFX: #tag1 #tag2 @ 时间描述】
         【SFX: filename.mp3 @ 时间描述】
    @ 后面支持：
      - 绝对时间 MM:SS 或 SSs
      - 相对描述（暂时跳过，返回 None，提示用户手动指定）
    """
    cues = []
    catalog_path = os.path.join(sfx_lib, "catalog.md")

    def resolve_file(ref: str) -> str | None:
        if ref.endswith(".mp3") or ref.endswith(".wav"):
            # 直接文件名
            for root, _, files in os.walk(os.path.join(sfx_lib, "assets")):
                if ref in files:
                    return os.path.join(root, ref)
            return None
        # 标签检索
        tags = re.findall(r"#(\w+)", ref)
        if not tags or not os.path.exists(catalog_path):
            return None
        with open(catalog_path) as f:
            for line in f:
                if (
                    not line.startswith("|")
                    or line.startswith("| 文件")
                    or line.startswith("|---")
                ):
                    continue
                parts = [p.strip() for p in line.split("|") if p.strip()]
                if len(parts) < 3:
                    continue
                fname = parts[0].strip("`")
                raw_tags = re.findall(r"#(\w+)", parts[2])
                if all(t.lower() in [rt.lower() for rt in raw_tags] for t in tags):
                    for root, _, files in os.walk(os.path.join(sfx_lib, "assets")):
                        if fname in files:
                            return os.path.join(root, fname)
        return None

    def parse_time(t_str: str) -> float | None:
        t_str = t_str.strip()
        m = re.match(r"(\d+):(\d+(?:\.\d+)?)", t_str)
        if m:
            return int(m.group(1)) * 60 + float(m.group(2))
        m = re.match(r"(\d+(?:\.\d+)?)s", t_str)
        if m:
            return float(m.group(1))
        return None

    for line in script.splitlines():
        m = re.search(r"【SFX:\s*([^@】]+?)(?:\s*@\s*([^】]+))?】", line)
        if not m:
            continue
        ref = m.group(1).strip()
        time_str = m.group(2).strip() if m.group(2) else None
        fpath = resolve_file(ref)
        t = parse_time(time_str) if time_str else None
        if fpath and t is not None:
            cues.append({"file": fpath, "time": t, "ref": ref})
        else:
            print(
                f"  ⚠ SFX cue skipped: ref='{ref}' time='{time_str}' "
                f"(file={'found' if fpath else 'NOT FOUND'}, "
                f"time={'parsed' if t else 'NOT PARSED'})"
            )
    return cues


# ── 混音主流程 ────────────────────────────────────────────────────────────────


def mix(tts_path: str, script_path: str, sfx_lib: str, bgm_dir: str, output_path: str):
    import numpy as np

    tts_dur = parse_tts_duration(tts_path)
    print(f"TTS 时长: {tts_dur:.1f}s")

    with open(script_path) as f:
        script = f.read()

    bgm_cues = parse_bgm_cues(script, tts_dur)
    sfx_cues = parse_sfx_cues(script, sfx_lib)

    print(f"BGM 段落: {len(bgm_cues)}")
    print(f"SFX 插入点: {len(sfx_cues)}")

    total_samples = int(tts_dur * SR) + SR
    mix_buf = load_mono(tts_path, SR)
    mix_buf = mix_buf.astype("float32")
    buf = __import__("numpy").zeros(max(len(mix_buf), total_samples), dtype="float32")
    buf[: len(mix_buf)] += mix_buf

    # BGM
    for cue in bgm_cues:
        bgm_path = os.path.join(bgm_dir, cue["file"])
        if not os.path.exists(bgm_path):
            print(f"  ⚠ BGM not found: {bgm_path}")
            continue
        dur = cue["end"] - cue["start"]
        bgm_raw = load_mono(bgm_path, SR)
        need = int(dur * SR)
        import numpy as np

        reps = (need // len(bgm_raw)) + 2
        bgm_loop = np.tile(bgm_raw, reps)[:need]
        fi_s, fo_s = int(cue["fade_in"] * SR), int(cue["fade_out"] * SR)
        bgm_loop[:fi_s] *= np.linspace(0, 1, fi_s)
        bgm_loop[-fo_s:] *= np.linspace(1, 0, fo_s)
        bgm_loop *= BGM_VOLUME
        s_idx = int(cue["start"] * SR)
        e_idx = min(s_idx + len(bgm_loop), len(buf))
        buf[s_idx:e_idx] += bgm_loop[: e_idx - s_idx]
        m, s = divmod(cue["start"], 60)
        print(f"  ✓ BGM {cue['file']} @ {int(m):02d}:{s:04.1f} ~ {cue['end']:.1f}s")

    # SFX
    # 场景 reverb 参数映射（根据时间区段自动选择）
    def reverb_params(t: float) -> tuple[float, float]:
        if len(bgm_cues) == 0:
            return (0.2, 0.15)
        seg = tts_dur / len(bgm_cues)
        idx = int(t // seg)
        params = [(0.35, 0.25), (0.15, 0.15), (0.10, 0.10)]
        return params[min(idx, len(params) - 1)]

    import numpy as np

    for cue in sfx_cues:
        if not os.path.exists(cue["file"]):
            print(f"  ⚠ SFX not found: {cue['file']}")
            continue
        sfx_raw = load_mono(cue["file"], SR)
        rs, wl = reverb_params(cue["time"])
        sfx_rev = reverb(sfx_raw, SR, room_size=rs, wet=wl)
        sfx_rev *= SFX_VOLUME
        s_idx = int(cue["time"] * SR)
        e_idx = min(s_idx + len(sfx_rev), len(buf))
        buf[s_idx:e_idx] += sfx_rev[: e_idx - s_idx]
        m, s = divmod(cue["time"], 60)
        print(f"  ✓ SFX {os.path.basename(cue['file'])} @ {int(m):02d}:{s:04.1f}")

    # 归一化
    peak = np.max(np.abs(buf))
    if peak > 0.95:
        buf = buf * (0.93 / peak)
        print(f"  归一化: peak={peak:.3f} → 0.93")

    save_mp3(buf, SR, output_path)
    size = os.path.getsize(output_path) / 1024 / 1024
    print(f"\n✓ 输出: {output_path} ({size:.1f} MB)")


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--tts", required=True, help="TTS 主轨 MP3 路径")
    ap.add_argument("--script", required=True, help="剧本 script.md 路径")
    ap.add_argument("--sfx-lib", required=True, help="sfx_library 根目录")
    ap.add_argument("--bgm-dir", required=True, help="BGM 文件所在目录")
    ap.add_argument("--output", required=True, help="输出 MP3 路径")
    args = ap.parse_args()

    mix(
        tts_path=args.tts,
        script_path=args.script,
        sfx_lib=os.path.abspath(args.sfx_lib),
        bgm_dir=args.bgm_dir,
        output_path=args.output,
    )
