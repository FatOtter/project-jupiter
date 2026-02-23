---
name: media-preview
description: Quickly inspect images, videos, and audio files without loading the raw binary into context. Use this skill whenever the Read tool fails or returns garbled output on a media file, or when a file is larger than 2MB. Generates a lightweight JPEG thumbnail (for images/video) and structured metadata summary so Claude can understand media content without token overflow. Supports PNG, JPG, WEBP, GIF, MP4, MOV, MKV, MP3, WAV, FLAC, and other common formats.
---

# Media Preview

Extracts a lightweight summary and thumbnail from any media file using local tools (ffprobe + PIL). The thumbnail is saved to `/tmp/` and can be read with the `Read` tool.

## Usage

```bash
python3 .opencode/skills/media-preview/scripts/preview.py <file> [options]

# Options:
#   --thumb-size N      Max thumbnail dimension in px (default: 512)
#   --frame-count N     Frames to extract from video (default: 3)
#   --out-dir PATH      Where to save thumbnails (default: /tmp)
```

## Workflow

1. Run the script → get JSON with `summary`, `metadata`, and `thumbnails` list
2. Read each thumbnail path with the `Read` tool to view image/video content
3. For audio, the `summary` and `metadata` fields contain all available info

## Examples

```bash
# Large image (e.g. 7MB PNG concept art)
python3 .opencode/skills/media-preview/scripts/preview.py stories/xxx/assets/image.png
# → thumbnail at /tmp/media_preview_0.jpg (~20-50KB), readable with Read tool

# Video (extracts 3 evenly-spaced frames)
python3 .opencode/skills/media-preview/scripts/preview.py assets/video.mp4
# → /tmp/media_preview_0.jpg, /tmp/media_preview_1.jpg, /tmp/media_preview_2.jpg

# Audio
python3 .opencode/skills/media-preview/scripts/preview.py audio/track.mp3
# → JSON with duration, bitrate, sample rate (no thumbnail)
```

## Output Schema

```json
{
  "type": "image|video|audio|unknown",
  "path": "/absolute/path/to/file",
  "metadata": { "format": "PNG", "width": 2816, "height": 1536, "size_kb": 7530 },
  "thumbnails": ["/tmp/media_preview_0.jpg"],
  "summary": "PNG image, 2816×1536, 7530KB.",
  "read_instruction": "Use the Read tool on /tmp/media_preview_0.jpg to view the image."
}
```

## Dependencies

- `ffprobe` (ffmpeg): metadata extraction for all types + video frame extraction
- `PIL` (Pillow): image thumbnail generation — available in ComfyUI venv:
  `/home/avic/ai_tools/ComfyUI/.venv/bin/python3 .opencode/skills/media-preview/scripts/preview.py <file>`
- System `python3` also works for images if PIL is installed globally
