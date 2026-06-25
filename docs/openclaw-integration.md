# OpenClaw Integration

This project treats OpenClaw as an external agent controller. The local app owns production data, content jobs, mock pipeline output, and safety review files.

## Current Mode

- `openclaw/` is cloned inside the repository root and is not modified by this implementation.
- The project exposes REST endpoints under `/api/agent`.
- The local Claw Director implementation runs without OpenClaw so development can continue immediately.

## Future Skill

Skill name:

```text
kids-video-factory-claw-skill
```

Proposed skill actions:

- `create_kids_video_job`
- `run_kids_video_pipeline`
- `get_job_status`
- `get_job_output_bundle`
- `generate_next_video_ideas`
- `review_child_safety`
- `suggest_publish_plan`
- `summarize_analytics`

## API Contract

OpenClaw can call:

- `GET /api/agent/health`
- `POST /api/agent/sessions`
- `GET /api/agent/sessions`
- `GET /api/agent/sessions/:id`
- `POST /api/agent/sessions/:id/message`
- `POST /api/agent/sessions/:id/plan`
- `POST /api/agent/sessions/:id/approve`
- `POST /api/agent/sessions/:id/execute`
- `POST /api/agent/sessions/:id/cancel`
- `GET /api/agent/sessions/:id/logs`

Set `OPENCLAW_BASE_URL` and `OPENCLAW_SKILL_NAME` in the environment once the external OpenClaw skill is ready.
