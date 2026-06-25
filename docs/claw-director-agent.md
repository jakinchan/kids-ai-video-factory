# Claw Director Agent

Claw Director is a child-safe production orchestrator for short video bundles.

## Responsibilities

- Parse user requests into a structured plan.
- Pick one of the supported modes: single job, batch job, bedtime, song, educational, or review.
- Create content jobs.
- Generate script, storyboard, narration, subtitles, and mock metadata.
- Run safety review.
- Export a bundle manifest.
- Create publishing suggestions for human review.

## Non-Goals

- It does not auto-publish to YouTube, TikTok, Douyin, or Xiaohongshu.
- It does not read secrets or `.env` files.
- It does not execute arbitrary shell commands.
- It does not delete project files.
- It does not contact unreviewed external URLs.

## Approval Model

Every plan has `requires_human_approval: true`. Execution fails until `POST /api/agent/sessions/:id/approve` has been called.

## Output

Each mock job creates:

- `job.json`
- `script.json`
- `storyboard.json`
- `narration.txt`
- `audio_metadata.json`
- `video_metadata.json`
- `subtitles.srt`
- `safety_review.json`
- `bundle_manifest.json`
