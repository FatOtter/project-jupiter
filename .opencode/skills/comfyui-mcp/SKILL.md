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

| Workflow ID | Description | Key Parameters |
|-------------|-------------|----------------|
| `generate_image` | SD/SDXL image generation | `prompt`, `width`, `height`, `steps`, `seed` |
| `generate_song` | Music via ACE-Step v1 (umt5-base encoder, high quality) | `tags`, `lyrics`, `negative`, `seconds`, `steps`, `seed` |
| `audio_test1` | Multi-character TTS via Qwen3-TTS | `text`, `narrator_voice`, `seed` |
| `radio_drama_ch3` | Full multi-character radio drama with custom voice design | `text`, `bartender_voice_desc`, `shiva_voice_desc`, `seed` |
| `basic_api_test` | Basic API connectivity test | — |

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

### Music generation (ACE-Step v1, high quality)

`generate_song` uses ACE-Step v1 with `umt5-base` text encoder — much better style understanding than ACE-Step 1.5.

- `tags`: Music style description in English. Be specific about instruments and mood. Add explicit negatives.
- `lyrics`: Use `"[instrumental]"` for background music. Include `[verse]`/`[chorus]` tags for songs.
- `negative`: What to avoid — e.g. `"metal, guitar, distortion, drums"` for ambient.
- `seconds`: Duration (float). Default 60.
- `steps`: Quality/time tradeoff. Default 60. Do not go below 30.

```
# Ambient BGM — spaceport
song = run_workflow(
    workflow_id="generate_song",
    overrides={
        "tags": "ambient electronic, sci-fi spaceport, cold sterile drone pads, minimal texture, no melody, no drums",
        "lyrics": "[instrumental]",
        "negative": "metal, rock, guitar, distortion, drums, vocals",
        "seconds": 60,
        "steps": 60,
        "seed": 1001
    }
)
# poll get_job until completed, then copy output file to public/gen/
```

### Multi-character TTS
Uses Qwen3-TTS with character switching via `[Character Tag]` labels in text.

#### Character tag alias map (built-in presets)

| Tag in text | Voice resolved | Language |
|-------------|---------------|----------|
| `[Yin Shuang]` | `silverfrost` (Chinese default) | Chinese |
| `[Yin Shuang ZH]` | `silverfrost_zh` | Chinese |
| `[Yin Shuang EN]` | `silverfrost_en` | English |

> **Note:** `Victoria ZH/EN/JA` presets have been removed from `models/voices/` as they were superseded by `victoria_custom`. Use `[victoria_custom]` for Victoria in all new productions.

#### Project Jupiter character tags (VoiceDesign — models/voices/)

| Tag in text | Character | Language | Profile |
|-------------|-----------|----------|---------|
| `[victoria_custom]` | 维多利亚 | Chinese | `characters/victoria/` |
| `[shiva_lin]` | 希瓦·林 | Chinese | `characters/shiva_lin/` |
| `[bartender_mars]` | 三手调酒师 | Chinese | — |
| `[augmented_man]` | 飞升者（通用）| Chinese | `characters/_npcs/` |
| `[staff_voice]` | 地勤职员（通用）| Chinese | `characters/_npcs/` |

#### NPC tags (VoiceDesign — models/voices/)

| Tag in text | NPC | Profile |
|-------------|-----|---------|
| `[narrator_zh]` | 旁白（中文成熟女声）| `characters/_npcs/narrator/` |
| `[passerby_male_young]` | 年轻男路人 | `characters/_npcs/passerby_male_young/` |
| `[passerby_male_mid]` | 中年男路人 | `characters/_npcs/passerby_male_mid/` |
| `[passerby_male_old]` | 老年男路人 | `characters/_npcs/passerby_male_old/` |
| `[passerby_female_young]` | 年轻女路人 | `characters/_npcs/passerby_female_young/` |
| `[passerby_female_mid]` | 中年女路人 | `characters/_npcs/passerby_female_mid/` |
| `[passerby_female_old]` | 老年女路人 | `characters/_npcs/passerby_female_old/` |
| `[official_male]` | 官方播报男声 | `characters/_npcs/official_male/` |
| `[official_female]` | 官方播报女声 | `characters/_npcs/official_female/` |

**Critical rules:**
- All VoiceDesign tags above resolve to `models/voices/{tag_name}.wav`
- `narrator_voice` dropdown (for untagged text) should use `voices_examples/characters/silverfrost.mp3`
- For new characters: use `generate_npc_voice` workflow with `character_name` param to save to `models/voices/`
- Full radio drama production workflow: see `.opencode/skills/radio-drama/SKILL.md`

```python
# Example: multi-character TTS with Project Jupiter cast
result = run_workflow(
    workflow_id="radio_drama_ch3",
    overrides={
        "victoria_voice_desc": "年轻女性，声线清亮，气息感，偏中低音域...",
        "narrator_voice_desc": "中年成熟女性，沉稳低沉，叙事感...",
        # ... other voice descs
        "text": "[narrator_zh] 旁白内容。[victoria_custom] 维多利亚的台词。",
        "seed": 3001
    }
)
```

### Radio drama with custom voice design (radio_drama_ch3 workflow)

Uses `Qwen3TTSVoiceDesignerNode` to synthesize new voices from text descriptions, then multi-character TTS.

**Execution order (critical):**
```
Qwen3TTSEngineNode (node 1)
  ├── VoiceDesignerNode bartender (node 2) ──┐
  └── VoiceDesignerNode shiva (node 3) ──────┤
                                              ↓
                                    RefreshVoiceCacheNode (node 4)
                                    signal=node2, signal2=node3
                                              │ signal2 passthrough
                                              ↓
                  UnifiedTTSTextNode (node 5) ← TTS_engine=node1, opt_narrator=node4[1]
```

`opt_narrator=node4[1]` forces node 4 (cache refresh) to complete before TTS starts,
while `TTS_engine=node1` provides the actual engine. All text lines use `[Victoria ZH]`,
`[bartender_mars]`, `[shiva_lin]` tags — no untagged narration.

```
result = run_workflow(
    workflow_id="radio_drama_ch3",
    overrides={
        "bartender_voice_desc": "A gruff male voice, raspy and metallic. Slow, deliberate. Chinese Mandarin.",
        "shiva_voice_desc": "Energetic woman, late 20s, hoarse from machinery noise. Direct engineer tone. Chinese Mandarin.",
        "text": "[Victoria ZH] 大小姐。[shiva_lin] 别叫我大小姐，叫我希瓦。[bartender_mars] 要点什么？",
        "seed": 42
    }
)
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

- Assets are **session-scoped**: they expire when the MCP server restarts. After generation, copy output files directly from `ComfyUI/output/audio/` to `comfyui-mcp-server/public/gen/` for persistence.
- `narrator_voice` in `audio_test1` is an **enum** (dropdown path). Use the exact path string from the table above.
- Long TTS jobs take 5–10 minutes for full drama scripts. BGM generation at 60 steps takes 2–3 minutes. Always use the polling pattern.
- The `run_workflow` tool can execute any workflow by its filename stem. Use `list_workflows` to discover available ones.
- **Victoria's language**: Always use `[Victoria ZH]` for Chinese, never `[Victoria]` (defaults to Japanese voice). Same for Yin Shuang: `[Yin Shuang ZH]` not `[Yin Shuang]`.
- **ACE-Step v1 BGM quality**: Use descriptive English prompts with explicit negative prompts. `steps=60` is the minimum for quality output. Lower step counts produce noticeable artifacts.
- **ComfyUI restart required** after installing new custom node packages. The `ComfyUI_ACE-Step` node requires: `py3langid`, `loguru`, `spacy`, `cutlet`, `num2words`, `hangul-romanize`. Install via `pip3` in the ComfyUI venv.
- **diffusers 0.36.0 bug**: `torchao_quantizer.py` uses `logger` before it's defined. Fix: move `logger = logging.get_logger(__name__)` to before the module-level `_update_torch_safe_globals()` call.
