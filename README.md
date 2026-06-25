# Kids AI Video Factory

AI children's short video factory with a local Claw Director agent orchestrator.

## Claw Director

Claw Director turns a natural-language request into a child-safe production plan, waits for human approval, then runs a mock pipeline that creates script, storyboard, narration, subtitle, metadata, safety review, and publishing suggestion files.

## Folder Design

The recommended project layout and OpenClaw placement are documented in [docs/project-structure.md](docs/project-structure.md). In short, app code stays under `apps/`, OpenClaw-specific adapters stay under `integrations/openclaw/`, and the OpenClaw clone should eventually live under `vendor/openclaw/`.

Example request:

```text
帮我生成 3 条中文儿童短视频，主题是小动物，适合 3-5 岁，同时生成语音和字幕。
```

## Run Locally

```bash
npm install
npm run dev
```

- Web admin: `http://localhost:3000/claw-director`
- API health: `http://localhost:4010/api/agent/health`

The first version runs in local mock mode. The cloned `openclaw/` directory is left untouched and can later call these REST endpoints through a `kids-video-factory-claw-skill`.

## Useful Commands

```bash
npm run typecheck
npm run smoke
npm run build
```

## Generated Output

Agent session files are written to:

```text
output/agent-sessions/{session_id}/
```

Mock content jobs are written to:

```text
output/jobs/{job_id}/
```

Publishing remains a manual human-review step. The agent only creates suggestions.
