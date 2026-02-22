---
name: comfyui-mcp
description: Generate images, music, and multi-character TTS audio via a ComfyUI MCP server, then publish results to a publicly accessible URL. Covers the full workflow from generation to delivery.
license: MIT
compatibility: opencode
metadata:
  mcp_endpoint: "http://localhost:9000/mcp"
  asset_base_url: "http://localhost:6002/gen/"
  audience: ai-agent
---

# ComfyUI MCP Skill

This skill covers how to use the ComfyUI MCP server to generate media assets and deliver them via public URL.

---

## MCP Server

- **Endpoint:** `http://localhost:9000/mcp`
- **Transport:** streamable-http (stateless JSON-RPC over HTTP POST with SSE)
- **Auth:** IP whitelist (no token required for whitelisted clients)
- **Published assets base URL:** `http://localhost:6002/gen/`

---

## Available Models

| Model | Type |
|-------|------|
| `JANKUTrainedNoobaiRouwei_v69.safetensors` | Checkpoint |
| `Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors` | SDXL Checkpoint |
| `novaAnimeXL_ilV160.safetensors` | Anime SDXL |
| `qwen_2.5_vl_7b_fp8_scaled.safetensors` | Vision Language |

Default model: `v1-5-pruned-emaonly.ckpt`

---

## Tools Reference

### Discovery & Configuration

| Tool | Purpose |
|------|---------|
| `list_workflows` | List all available workflows with their parameters |
| `list_models` | List available ComfyUI checkpoint models |
| `get_defaults` | Get current generation defaults (model, resolution, etc.) |
| `set_defaults` | Set runtime defaults for image / audio / video generation |
| `get_publish_info` | Check publish configuration and asset delivery status |
| `set_comfyui_output_root` | Configure ComfyUI output path (one-time setup) |

### Generation

| Tool | Purpose |
|------|---------|
| `generate_image` | Generate an image via Stable Diffusion |
| `generate_song` | Generate a music track via ACE-Step |
| `audio_test1` | Generate multi-character TTS speech via Qwen3-TTS |
| `run_workflow` | Run any workflow by ID with parameter overrides |
| `regenerate` | Re-run a previous generation with optional overrides |

#### Available Workflows

| Workflow ID | Description |
|-------------|-------------|
| `generate_image` | SD/SDXL image generation with full parameter control |
| `generate_song` | ACE-Step music generation with tags and lyrics |
| `audio_test1` | Multi-character TTS via Qwen3-TTS |
| `basic_api_test` | Basic API connectivity test |

### Job Management

| Tool | Purpose |
|------|---------|
| `get_queue_status` | Check ComfyUI queue (running + pending jobs) |
| `get_job` | Poll a job by `prompt_id` until completion |
| `cancel_job` | Cancel a queued or running job |

### Asset Management

| Tool | Purpose |
|------|---------|
| `list_assets` | List recently generated assets in this session |
| `get_asset_metadata` | Get full provenance and metadata for an asset |
| `view_image` | View a generated image inline (thumbnails only) |
| `publish_asset` | Copy an asset to the public web directory and get a URL |

---

## Key Concepts

### Asset lifecycle
Generation tools return immediately with either:
- `asset_id` — generation completed synchronously
- `prompt_id` + `status: "running"` — job is still running; poll with `get_job`

Always check which key is present before proceeding.

### Polling pattern
```
result = generate_image(...)

if "prompt_id" in result:
    while True:
        job = get_job(prompt_id=result["prompt_id"])
        if job["status"] == "completed":
            asset_id = job["outputs"][0]["asset_id"]
            break
        elif job["status"] in ["error", "not_found"]:
            raise Exception(job.get("error"))
        sleep(5)
else:
    asset_id = result["asset_id"]
```

### Publishing assets
After generation, publish to get a public URL:
```
pub = publish_asset(
    asset_id=asset_id,
    target_filename="output.mp3",   # must be lowercase, a-z0-9._-
    overwrite=True
)
# pub["dest_url"]  -> "/gen/output.mp3"
# public URL      -> "http://localhost:6002" + pub["dest_url"]
```

Supported filename extensions: `png`, `jpg`, `jpeg`, `webp`, `mp3`, `wav`, `mp4`, `webm`, `mov`

---

## Default Settings

Use `get_defaults` to retrieve current defaults, `set_defaults` to modify.

### Image Defaults
- width: 512
- height: 512
- steps: 20
- cfg: 8.0
- sampler_name: euler
- scheduler: normal
- denoise: 1.0
- model: v1-5-pruned-emaonly.ckpt
- negative_prompt: text, watermark

### Audio Defaults
- steps: 50
- cfg: 5.0
- sampler_name: euler
- scheduler: simple
- denoise: 1.0
- seconds: 60
- lyrics_strength: 0.99
- model: ace_step_v1_3.5b.safetensors

### Video Defaults
- width: 1280
- height: 720
- steps: 20
- cfg: 8.0
- sampler_name: euler
- scheduler: normal
- denoise: 1.0
- negative_prompt: text, watermark
- duration: 5
- fps: 16

---

## Workflow Recipes

### Image generation
```
img = generate_image(
    prompt="a cyberpunk city at night, neon lights, rain",
    negative_prompt="blurry, low quality",
    width=1024,
    height=1024,
    steps=20,
    seed=42
)
# wait for completion if needed, then publish
pub = publish_asset(asset_id=img["asset_id"], target_filename="city.png")
```

### Music generation
```
song = generate_song(
    tags="cinematic orchestral epic",
    lyrics="[verse]\nRising from the ashes...",
    seconds=30,
    seed=1234
)
# poll get_job if status is "running"
pub = publish_asset(asset_id=..., target_filename="track.mp3")
```

### Multi-character TTS
Uses Qwen3-TTS with two built-in voice characters, each with language-specific reference voices to minimize foreign accent.

#### Voice file reference

| Character tag in text | `narrator_voice` value | Language |
|----------------------|----------------------|----------|
| `[Victoria]` | `voices_examples/characters/victoria_en.mp3` | English |
| `[Victoria]` | `voices_examples/characters/victoria_zh.mp3` | Chinese |
| `[Victoria]` | `voices_examples/characters/victoria_ja.mp3` | Japanese |
| `[Victoria]` | `voices_examples/characters/victoria.mp3` | Default (Japanese) |
| `[Yin Shuang]` | `voices_examples/characters/silverfrost_en.mp3` | English |
| `[Yin Shuang]` | `voices_examples/characters/silverfrost_zh.mp3` | Chinese |
| `[Yin Shuang]` | `voices_examples/characters/silverfrost_ja.mp3` | Japanese |
| `[Yin Shuang]` | `voices_examples/characters/silverfrost.mp3` | Default (Chinese) |

**Rule:** set `narrator_voice` to the language-specific file that matches the **dominant language** of the script. The alias map also supports language-tagged character names in text: `[Victoria EN]`, `[Victoria ZH]`, `[Victoria JA]`, `[Yin Shuang EN]`, `[Yin Shuang ZH]`, `[Yin Shuang JA]`.

```
# English scene — use EN reference voices
tts = audio_test1(
    text="[Victoria] Hello! Welcome to Tharsis Dome.\n[Yin Shuang] Systems nominal. Proceed.",
    narrator_voice="voices_examples/characters/victoria_en.mp3",
    seed=42
)

# Chinese scene — use ZH reference voices
tts = audio_test1(
    text="[Victoria] 主人好！[Yin Shuang] 系统正常，随时待命。",
    narrator_voice="voices_examples/characters/victoria_zh.mp3",
    seed=42
)

# poll if needed, then publish
pub = publish_asset(asset_id=..., target_filename="scene.mp3")
public_url = "http://localhost:6002" + pub["dest_url"]
```

---

## Error Handling

| Error code | Meaning | Fix |
|-----------|---------|-----|
| `ASSET_NOT_FOUND_OR_EXPIRED` | Asset ID is stale (server restarted) | Re-generate |
| `COMFYUI_OUTPUT_ROOT_NOT_FOUND` | Output path not configured | Call `set_comfyui_output_root` |
| `INVALID_TARGET_FILENAME` | Filename fails regex validation | Use lowercase alphanumeric + allowed extensions |
| `SOURCE_PATH_OUTSIDE_ROOT` | Security check failed | Use asset IDs from this session only |

---

## Notes

- Assets are **session-scoped**: they expire when the MCP server restarts. Always `publish_asset` before ending a session if the file needs to persist.
- `narrator_voice` in `audio_test1` is an **enum**, not a free-form path. Use the exact path string from the table above.
- Long TTS or image generation jobs can take 30–120 seconds. Always use the polling pattern.
- The `run_workflow` tool can execute any workflow by its filename stem (e.g. `"audio-test1"`). Use `list_workflows` to discover available ones.
