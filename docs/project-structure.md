# Project Structure

This repository is split into two clear ownership areas:

1. `kids-ai-video-factory` application code
2. external `openclaw` orchestration runtime

The app must be able to run without modifying OpenClaw. OpenClaw should call the app through REST APIs or a future skill package.

## Recommended Layout

```text
kids-ai-video-factory/
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ agents/
│  │  │  │  ├─ clawDirectorAgent.ts
│  │  │  │  ├─ agentMemory.ts
│  │  │  │  ├─ agentPlanner.ts
│  │  │  │  ├─ agentSafetyGuard.ts
│  │  │  │  ├─ agentToolRegistry.ts
│  │  │  │  └─ tools/
│  │  │  ├─ prompts/
│  │  │  ├─ routes/
│  │  │  └─ index.ts
│  │  └─ package.json
│  └─ web-admin/
│     ├─ src/app/
│     │  └─ claw-director/
│     └─ package.json
├─ database/
│  └─ schema.sql
├─ docs/
│  ├─ project-structure.md
│  ├─ openclaw-integration.md
│  ├─ claw-director-agent.md
│  └─ agent-safety-policy.md
├─ samples/
│  ├─ agent-session-sample.json
│  └─ claw-director-prompts.json
├─ output/
│  ├─ agent-sessions/
│  └─ jobs/
├─ integrations/
│  └─ openclaw/
│     ├─ skills/
│     │  └─ kids-video-factory-claw-skill/
│     └─ README.md
├─ vendor/
│  └─ openclaw/
├─ package.json
└─ README.md
```

## Where OpenClaw Should Live

Recommended final location:

```text
vendor/openclaw/
```

Reason:

- OpenClaw is a third-party runtime, not product source code.
- It should stay isolated from `apps/api` and `apps/web-admin`.
- It can be updated or replaced without touching app code.
- It should not be part of the app workspace packages.
- It avoids accidental imports from OpenClaw internals.

The current local clone is:

```text
openclaw/
```

That is acceptable for development, but the cleaner long-term shape is to move or re-clone it into `vendor/openclaw/`.

## What Goes Outside OpenClaw

Application-owned code belongs in:

```text
apps/api/
apps/web-admin/
database/
docs/
samples/
output/
```

These folders define the actual Kids AI Video Factory product:

- content job management
- Claw Director planning
- child-safety policy
- mock or real video pipeline
- generated bundles
- admin UI
- REST API

## What Goes Near OpenClaw

OpenClaw-specific glue belongs in:

```text
integrations/openclaw/
```

This folder should contain adapter code and skill packaging only:

- OpenClaw skill manifest
- endpoint mapping
- request and response schemas
- examples for calling `apps/api`
- deployment notes

It should not contain video generation business logic.

## Boundary Rule

Use this dependency direction:

```text
OpenClaw -> integrations/openclaw -> apps/api -> output/jobs
```

Do not use this direction:

```text
apps/api -> openclaw internals
```

The API should not import OpenClaw source files directly. If OpenClaw is unavailable, the app should still run in local mock mode.

## Environment Variables

```text
API_PORT=4010
WEB_PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4010
PIPELINE_MODE=mock
OPENCLAW_BASE_URL=
OPENCLAW_SKILL_NAME=kids-video-factory-claw-skill
```

`OPENCLAW_BASE_URL` should stay empty in local mock mode. Set it only when OpenClaw is running as an external service.

## Migration From Current Layout

Current:

```text
kids-ai-video-factory/
└─ openclaw/
```

Recommended:

```text
kids-ai-video-factory/
├─ vendor/
│  └─ openclaw/
└─ integrations/
   └─ openclaw/
```

Suggested PowerShell move, if the current clone should be kept:

```powershell
New-Item -ItemType Directory -Force vendor
Move-Item -LiteralPath .\openclaw -Destination .\vendor\openclaw
```

If OpenClaw should remain a separate Git repository, keep its `.git` folder inside `vendor/openclaw/` and do not add it as an npm workspace.

## Git Tracking Policy

Recommended:

- Track `apps/`, `database/`, `docs/`, `samples/`, root config files.
- Ignore `output/`, `.next/`, `dist/`, logs, and `node_modules/`.
- Decide separately whether `vendor/openclaw/` is tracked as a submodule, ignored local clone, or separate repository checkout.

Preferred production setup:

```text
vendor/openclaw/  -> Git submodule or deployment-time checkout
integrations/     -> tracked by this repository
```

This keeps application changes reviewable while leaving OpenClaw upgrade cadence independent.
