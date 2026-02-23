#!/usr/bin/env python3
"""
media-preview: 快速生成媒体文件的轻量缩略图和元信息摘要

用法:
  python3 preview.py <media_file> [--thumb-size 512] [--frame-count 3] [--out-dir /tmp]

输出:
  JSON 到 stdout，缩略图保存到 --out-dir（默认 /tmp）
  缩略图路径在 JSON 的 thumbnails 字段中，可直接用 Read 工具读取
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile

SUPPORTED_IMAGE = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tiff", ".tif"}
SUPPORTED_VIDEO = {".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v", ".flv"}
SUPPORTED_AUDIO = {".mp3", ".wav", ".flac", ".ogg", ".aac", ".m4a", ".opus"}


def ffprobe(path: str) -> dict:
    """Run ffprobe and return parsed JSON."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json",
         "-show_format", "-show_streams", path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        return {}
    try:
        return json.loads(result.stdout)
    except Exception:
        return {}


def make_thumb(src: str, dst: str, size: int = 512) -> bool:
    """Resize image to thumbnail using Pillow. Returns True on success."""
    try:
        from PIL import Image
        img = Image.open(src)
        img.thumbnail((size, size), Image.LANCZOS)
        # 转为 RGB（避免 RGBA/P 模式保存 JPEG 报错）
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        img.save(dst, format="JPEG", quality=82, optimize=True)
        return True
    except Exception as e:
        return False


def preview_image(path: str, thumb_size: int, out_dir: str) -> dict:
    ext = os.path.splitext(path)[1].lower()
    size_bytes = os.path.getsize(path)

    # 元信息：先用 ffprobe，再用 PIL 补充
    probe = ffprobe(path)
    width = height = None
    fmt = ext.lstrip(".")
    for s in probe.get("streams", []):
        if s.get("codec_type") == "video" or s.get("width"):
            width = s.get("width")
            height = s.get("height")
            fmt = s.get("codec_name", fmt)
            break

    if width is None:
        try:
            from PIL import Image
            with Image.open(path) as img:
                width, height = img.size
                fmt = img.format or fmt
        except Exception:
            pass

    # 生成缩略图
    thumb_path = os.path.join(out_dir, "media_preview_0.jpg")
    thumb_ok = make_thumb(path, thumb_path, thumb_size)

    meta = {
        "format": fmt.upper(),
        "width": width,
        "height": height,
        "size_kb": round(size_bytes / 1024, 1),
    }
    summary = (
        f"{fmt.upper()} image, {width}×{height}, "
        f"{meta['size_kb']}KB."
    )

    return {
        "type": "image",
        "path": path,
        "metadata": meta,
        "thumbnails": [thumb_path] if thumb_ok else [],
        "summary": summary,
        "read_instruction": (
            f"Thumbnail saved to {thumb_path}. "
            "Use the Read tool on that path to view the image content."
        ) if thumb_ok else "Thumbnail generation failed; check PIL installation.",
    }


def preview_video(path: str, thumb_size: int, frame_count: int, out_dir: str) -> dict:
    size_bytes = os.path.getsize(path)
    probe = ffprobe(path)

    fmt_info = probe.get("format", {})
    duration = float(fmt_info.get("duration", 0))
    bitrate = int(fmt_info.get("bit_rate", 0)) // 1000

    width = height = None
    vcodec = acodec = None
    fps_str = ""
    for s in probe.get("streams", []):
        if s.get("codec_type") == "video" and width is None:
            width = s.get("width")
            height = s.get("height")
            vcodec = s.get("codec_name")
            fps_str = s.get("r_frame_rate", "")
        elif s.get("codec_type") == "audio" and acodec is None:
            acodec = s.get("codec_name")

    # 提取均匀分布的 N 帧
    thumbs = []
    if duration > 0 and frame_count > 0:
        intervals = [duration * (i + 0.5) / frame_count for i in range(frame_count)]
        for idx, t in enumerate(intervals):
            out_path = os.path.join(out_dir, f"media_preview_{idx}.jpg")
            result = subprocess.run(
                ["ffmpeg", "-y", "-ss", str(t), "-i", path,
                 "-vframes", "1", "-q:v", "5",
                 "-vf", f"scale={thumb_size}:-1",
                 out_path],
                capture_output=True
            )
            if result.returncode == 0 and os.path.exists(out_path):
                thumbs.append(out_path)

    meta = {
        "format": fmt_info.get("format_name", "").split(",")[0],
        "duration_s": round(duration, 1),
        "width": width,
        "height": height,
        "video_codec": vcodec,
        "audio_codec": acodec,
        "bitrate_kbps": bitrate,
        "size_kb": round(size_bytes / 1024, 1),
        "fps": fps_str,
    }
    mins, secs = divmod(int(duration), 60)
    summary = (
        f"Video {width}×{height}, {mins}m{secs}s, "
        f"{vcodec}/{acodec}, {bitrate}kbps, {meta['size_kb']}KB."
    )

    return {
        "type": "video",
        "path": path,
        "metadata": meta,
        "thumbnails": thumbs,
        "summary": summary,
        "read_instruction": (
            f"{len(thumbs)} frame(s) extracted to: {', '.join(thumbs)}. "
            "Use the Read tool on each path to view video frames."
        ) if thumbs else "Frame extraction failed.",
    }


def preview_audio(path: str, out_dir: str) -> dict:
    size_bytes = os.path.getsize(path)
    probe = ffprobe(path)

    fmt_info = probe.get("format", {})
    duration = float(fmt_info.get("duration", 0))
    bitrate = int(fmt_info.get("bit_rate", 0)) // 1000
    tags = fmt_info.get("tags", {})

    codec = sample_rate = channels = None
    for s in probe.get("streams", []):
        if s.get("codec_type") == "audio":
            codec = s.get("codec_name")
            sample_rate = s.get("sample_rate")
            channels = s.get("channels")
            break

    mins, secs = divmod(int(duration), 60)
    meta = {
        "format": codec,
        "duration_s": round(duration, 1),
        "bitrate_kbps": bitrate,
        "sample_rate_hz": sample_rate,
        "channels": channels,
        "size_kb": round(size_bytes / 1024, 1),
        "title": tags.get("title", ""),
        "artist": tags.get("artist", ""),
    }
    summary = (
        f"Audio {codec}, {mins}m{secs}s, "
        f"{bitrate}kbps, {sample_rate}Hz, "
        f"{'stereo' if channels == 2 else str(channels)+' ch'}, "
        f"{meta['size_kb']}KB."
    )
    if meta["title"]:
        summary = f"[{meta['title']}] " + summary

    return {
        "type": "audio",
        "path": path,
        "metadata": meta,
        "thumbnails": [],
        "summary": summary,
        "read_instruction": "Audio file: no visual preview available. Use summary and metadata above.",
    }


def main():
    parser = argparse.ArgumentParser(description="Media preview tool for OpenCode")
    parser.add_argument("file", help="Path to media file")
    parser.add_argument("--thumb-size", type=int, default=512,
                        help="Max thumbnail dimension in pixels (default: 512)")
    parser.add_argument("--frame-count", type=int, default=3,
                        help="Number of frames to extract from video (default: 3)")
    parser.add_argument("--out-dir", default="/tmp",
                        help="Directory to save thumbnails (default: /tmp)")
    args = parser.parse_args()

    path = os.path.abspath(args.file)
    if not os.path.exists(path):
        print(json.dumps({"error": f"File not found: {path}"}))
        sys.exit(1)

    ext = os.path.splitext(path)[1].lower()

    if ext in SUPPORTED_IMAGE:
        result = preview_image(path, args.thumb_size, args.out_dir)
    elif ext in SUPPORTED_VIDEO:
        result = preview_video(path, args.thumb_size, args.frame_count, args.out_dir)
    elif ext in SUPPORTED_AUDIO:
        result = preview_audio(path, args.out_dir)
    else:
        result = {
            "type": "unknown",
            "path": path,
            "summary": f"Unsupported file type: {ext}",
            "thumbnails": [],
            "metadata": {"size_kb": round(os.path.getsize(path) / 1024, 1)},
        }

    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
