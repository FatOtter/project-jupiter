#!/usr/bin/env python3
"""
split_segments.py
将批次 TTS 音频按 >2.5s 静默点切割为单独 segment 文件

用法:
  python3 split_segments.py <input.mp3> <prefix> <name1> <name2> ...

示例:
  python3 split_segments.py batch_NR.mp3 NR NR_001 NR_002 NR_003
"""

import subprocess, sys, os, re, tempfile
import soundfile as sf
import numpy as np

SEGMENTS_DIR = os.path.join(os.path.dirname(__file__), "audio/segments")
SR = 44100
SILENCE_THRESHOLD_DB = -38
SPLIT_MIN_DUR = 2.5   # 最小静默时长（秒），用于切割点检测
BOUNDARY_PAD  = 0.15  # 切割点两侧各留 0.15s 缓冲

def detect_split_points(audio_path: str) -> list[float]:
    """返回所有 >SPLIT_MIN_DUR 静默段的中点时间（秒）"""
    result = subprocess.run(
        ["ffmpeg", "-i", audio_path,
         "-af", f"silencedetect=noise={SILENCE_THRESHOLD_DB}dB:duration={SPLIT_MIN_DUR}",
         "-f", "null", "-"],
        capture_output=True, text=True
    )
    output = result.stderr
    points = []
    starts = re.findall(r"silence_start: ([\d.]+)", output)
    ends   = re.findall(r"silence_end: ([\d.]+)", output)
    for s, e in zip(starts, ends):
        mid = (float(s) + float(e)) / 2
        points.append(mid)
    return points

def load_mono(path: str):
    tmp = tempfile.mktemp(suffix=".wav")
    subprocess.run(["ffmpeg","-y","-i",path,"-ar",str(SR),"-ac","1","-f","wav",tmp],
                   capture_output=True)
    data, _ = sf.read(tmp, dtype="float32")
    os.unlink(tmp)
    return data

def save_mp3(data: np.ndarray, path: str):
    tmp = tempfile.mktemp(suffix=".wav")
    sf.write(tmp, data, SR)
    subprocess.run(["ffmpeg","-y","-i",tmp,"-codec:a","libmp3lame","-q:a","2",path],
                   capture_output=True)
    os.unlink(tmp)

def split(audio_path: str, names: list[str]) -> list[str]:
    points = detect_split_points(audio_path)
    audio  = load_mono(audio_path)
    total_dur = len(audio) / SR

    print(f"  总时长: {total_dur:.1f}s  检测到 {len(points)} 个切割点")
    print(f"  切割点: {[f'{p:.1f}s' for p in points]}")

    if len(points) != len(names) - 1:
        print(f"  ⚠ 警告: 期望 {len(names)-1} 个切割点，实际检测到 {len(points)} 个")
        print(f"  将尽量按检测到的点切割，多余的段名将被忽略或用空文件代替")

    # 构建分段边界
    boundaries = [0.0] + points + [total_dur]
    outputs = []

    for i, name in enumerate(names):
        if i >= len(boundaries) - 1:
            print(f"  ⚠ 跳过 {name}（切割点不足）")
            continue
        s = max(0, boundaries[i] - BOUNDARY_PAD if i > 0 else 0)
        e = min(total_dur, boundaries[i+1] + BOUNDARY_PAD if i < len(boundaries)-2 else total_dur)
        s_idx = int(s * SR)
        e_idx = min(int(e * SR), len(audio))
        seg = audio[s_idx:e_idx].copy()

        # 两端淡入淡出（0.05s）
        fade = min(int(0.05 * SR), len(seg)//4)
        if fade > 0:
            seg[:fade]  *= np.linspace(0, 1, fade)
            seg[-fade:] *= np.linspace(1, 0, fade)

        out_path = os.path.join(SEGMENTS_DIR, f"{name}.mp3")
        save_mp3(seg, out_path)
        dur = len(seg) / SR
        print(f"  ✓ {name}.mp3  ({s:.1f}s ~ {e:.1f}s = {dur:.1f}s)")
        outputs.append(out_path)

    return outputs

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    audio_path = sys.argv[1]
    names = sys.argv[2:]
    split(audio_path, names)
