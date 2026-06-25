# Agent Safety Policy

## Allowed

- Create local content jobs.
- Generate scripts, storyboards, narration text, subtitles, and metadata.
- Run the mock pipeline.
- Write files under `output/jobs/{job_id}` and `output/agent-sessions/{session_id}`.
- Produce child-safety review notes.
- Produce publishing suggestions for a human reviewer.

## Blocked

- Automatic publishing or platform upload.
- Reading or modifying `.env`, API keys, tokens, secrets, or credentials.
- Deleting files.
- Running shell commands through the agent registry.
- Accessing personal folders or connected accounts such as Gmail, Stripe, banks, or payment systems.
- Calling unreviewed external URLs.

Blocked operations return a structured reason and mark the session as blocked.
