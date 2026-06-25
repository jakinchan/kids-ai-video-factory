import path from "node:path";
import { nanoid } from "nanoid";
import type { AgentMessage, AgentSession } from "./types.js";
import { sessionRoot } from "./paths.js";
import { ensureDir, readJsonFile, writeJsonFile, writeTextFile } from "./fileStore.js";

const sessionIndexPath = path.join(sessionRoot, "sessions.json");

export async function listSessions(): Promise<AgentSession[]> {
  return readJsonFile<AgentSession[]>(sessionIndexPath, []);
}

export async function getSession(sessionId: string): Promise<AgentSession | undefined> {
  const session = await readJsonFile<AgentSession | undefined>(path.join(sessionRoot, sessionId, "session.json"), undefined);
  return session;
}

export async function saveSession(session: AgentSession): Promise<AgentSession> {
  const sessionDir = path.join(sessionRoot, session.id);
  await ensureDir(sessionDir);
  await writeJsonFile(path.join(sessionDir, "session.json"), session);
  await writeJsonFile(path.join(sessionDir, "messages.json"), session.messages);
  if (session.plan) {
    await writeJsonFile(path.join(sessionDir, "plan.json"), session.plan);
  }
  const sessions = await listSessions();
  const nextSessions = [session, ...sessions.filter((item) => item.id !== session.id)].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  await writeJsonFile(sessionIndexPath, nextSessions);
  return session;
}

export async function appendMessage(session: AgentSession, role: AgentMessage["role"], content: string): Promise<AgentSession> {
  const now = new Date().toISOString();
  session.messages.push({
    id: nanoid(10),
    role,
    content,
    created_at: now
  });
  session.updated_at = now;
  return saveSession(session);
}

export async function appendExecutionLog(sessionId: string, line: string) {
  const logPath = path.join(sessionRoot, sessionId, "execution.log");
  const current = await readJsonFile<string[]>(path.join(sessionRoot, sessionId, "execution-lines.json"), []);
  const next = [...current, `[${new Date().toISOString()}] ${line}`];
  await writeJsonFile(path.join(sessionRoot, sessionId, "execution-lines.json"), next);
  await writeTextFile(logPath, `${next.join("\n")}\n`);
}

export async function readExecutionLog(sessionId: string): Promise<string[]> {
  return readJsonFile<string[]>(path.join(sessionRoot, sessionId, "execution-lines.json"), []);
}

export function createDefaultMemory() {
  return {
    preferred_language: "zh",
    common_target_age: "2-4",
    common_themes: ["animal", "bedtime", "numbers", "habits"],
    common_platforms: ["youtube_shorts"],
    recent_successful_topics: [],
    recent_failed_topics: [],
    child_safety_notes: [
      "Avoid frightening imagery, unsafe behavior, medical claims, and direct calls to publish.",
      "Keep narration gentle and concrete for preschool viewers."
    ]
  };
}

export async function saveDefaultMemory(sessionId: string) {
  await writeJsonFile(path.join(sessionRoot, sessionId, "memory.json"), createDefaultMemory());
}
