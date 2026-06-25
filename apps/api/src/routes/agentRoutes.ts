import { Router } from "express";
import { z } from "zod";
import {
  approveSession,
  cancelSession,
  createAgentSession,
  executeApprovedPlan,
  regeneratePlan
} from "../agents/clawDirectorAgent.js";
import { appendMessage, getSession, listSessions, readExecutionLog, saveSession } from "../agents/agentMemory.js";
import type { PipelineMode } from "../agents/types.js";

const router = Router();

const createSessionSchema = z.object({
  user_goal: z.string().min(1).optional(),
  message: z.string().min(1).optional()
});

const messageSchema = z.object({
  message: z.string().min(1)
});

const executeSchema = z.object({
  pipeline_mode: z.enum(["mock", "real"]).default("mock")
});

async function loadSessionOr404(sessionId: string) {
  const session = await getSession(sessionId);
  if (!session) {
    const error = new Error("Session not found");
    (error as Error & { status?: number }).status = 404;
    throw error;
  }
  return session;
}

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "claw-director-agent",
    openclaw_integration: {
      mode: process.env.OPENCLAW_BASE_URL ? "external_rest_ready" : "mock_local",
      skill_name: process.env.OPENCLAW_SKILL_NAME ?? "kids-video-factory-claw-skill"
    }
  });
});

router.post("/sessions", async (req, res, next) => {
  try {
    const body = createSessionSchema.parse(req.body);
    const goal = body.user_goal ?? body.message ?? "Create one gentle child-safe short video.";
    const session = await createAgentSession(goal);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

router.get("/sessions", async (_req, res, next) => {
  try {
    res.json(await listSessions());
  } catch (error) {
    next(error);
  }
});

router.get("/sessions/:id", async (req, res, next) => {
  try {
    res.json(await loadSessionOr404(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.post("/sessions/:id/message", async (req, res, next) => {
  try {
    const { message } = messageSchema.parse(req.body);
    const session = await loadSessionOr404(req.params.id);
    await appendMessage(session, "user", message);
    const updated = await regeneratePlan(session, message);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post("/sessions/:id/plan", async (req, res, next) => {
  try {
    const session = await loadSessionOr404(req.params.id);
    res.json(await regeneratePlan(session));
  } catch (error) {
    next(error);
  }
});

router.post("/sessions/:id/approve", async (req, res, next) => {
  try {
    const session = await loadSessionOr404(req.params.id);
    res.json(await approveSession(session));
  } catch (error) {
    next(error);
  }
});

router.post("/sessions/:id/execute", async (req, res, next) => {
  try {
    const session = await loadSessionOr404(req.params.id);
    const { pipeline_mode } = executeSchema.parse(req.body ?? {});
    res.json(await executeApprovedPlan(session, pipeline_mode as PipelineMode));
  } catch (error) {
    next(error);
  }
});

router.post("/sessions/:id/cancel", async (req, res, next) => {
  try {
    const session = await loadSessionOr404(req.params.id);
    res.json(await cancelSession(session));
  } catch (error) {
    next(error);
  }
});

router.get("/sessions/:id/logs", async (req, res, next) => {
  try {
    await loadSessionOr404(req.params.id);
    res.json({ session_id: req.params.id, lines: await readExecutionLog(req.params.id) });
  } catch (error) {
    next(error);
  }
});

router.post("/sessions/:id/status", async (req, res, next) => {
  try {
    const session = await loadSessionOr404(req.params.id);
    session.updated_at = new Date().toISOString();
    await saveSession(session);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

export default router;
