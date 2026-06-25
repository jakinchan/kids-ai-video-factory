import { nanoid } from "nanoid";
import { buildClawDirectorPrompt, summarizePlan } from "../prompts/clawDirector.js";
import { appendExecutionLog, appendMessage, saveDefaultMemory, saveSession } from "./agentMemory.js";
import { createAgentPlan } from "./agentPlanner.js";
import { assertAgentActionAllowed } from "./agentSafetyGuard.js";
import { agentToolRegistry } from "./agentToolRegistry.js";
import type { AgentAction, AgentSession, PipelineMode, ResultBundle } from "./types.js";

function now() {
  return new Date().toISOString();
}

function action(toolName: string, input: unknown): AgentAction {
  const created = now();
  return {
    id: nanoid(10),
    action_type: "tool_call",
    tool_name: toolName,
    input_json: input,
    output_json: undefined,
    status: "pending",
    risk_level: "low",
    created_at: created,
    updated_at: created
  };
}

export async function createAgentSession(userGoal: string): Promise<AgentSession> {
  const created = now();
  const plan = createAgentPlan(userGoal);
  const session: AgentSession = {
    id: `session_${nanoid(10)}`,
    title: plan.content_ideas[0]?.title ?? "Claw Director Session",
    user_goal: userGoal,
    mode: plan.mode,
    status: "awaiting_approval",
    requires_human_approval: true,
    created_at: created,
    updated_at: created,
    messages: [
      {
        id: nanoid(10),
        role: "system",
        content: buildClawDirectorPrompt(userGoal),
        created_at: created
      },
      {
        id: nanoid(10),
        role: "user",
        content: userGoal,
        created_at: created
      },
      {
        id: nanoid(10),
        role: "agent",
        content: `Draft plan is ready and waiting for approval.\n\n${summarizePlan(plan)}`,
        created_at: created
      }
    ],
    plan,
    actions: []
  };

  await saveDefaultMemory(session.id);
  await appendExecutionLog(session.id, "Session created.");
  return saveSession(session);
}

export async function regeneratePlan(session: AgentSession, userGoal = session.user_goal): Promise<AgentSession> {
  const plan = createAgentPlan(userGoal);
  session.user_goal = userGoal;
  session.mode = plan.mode;
  session.title = plan.content_ideas[0]?.title ?? session.title;
  session.plan = plan;
  session.status = "awaiting_approval";
  session.updated_at = now();
  await appendExecutionLog(session.id, "Plan regenerated.");
  await saveSession(session);
  return appendMessage(session, "agent", `Updated plan is ready for review.\n\n${summarizePlan(plan)}`);
}

export async function approveSession(session: AgentSession): Promise<AgentSession> {
  session.approved_at = now();
  session.status = "approved";
  session.updated_at = now();
  await appendExecutionLog(session.id, "Human approval received.");
  await saveSession(session);
  return appendMessage(session, "agent", "Approval recorded. The pipeline can now execute.");
}

export async function cancelSession(session: AgentSession): Promise<AgentSession> {
  session.status = "cancelled";
  session.updated_at = now();
  await appendExecutionLog(session.id, "Session cancelled.");
  return saveSession(session);
}

async function runAction<T>(session: AgentSession, toolName: string, input: unknown, runner: () => Promise<T>): Promise<T> {
  const decision = assertAgentActionAllowed(`${toolName} ${JSON.stringify(input)}`);
  const currentAction = action(toolName, input);
  currentAction.risk_level = decision.risk_level;
  if (decision.blocked) {
    currentAction.status = "blocked";
    currentAction.output_json = { blocked: true, reason: decision.reason };
    session.actions.push(currentAction);
    session.status = "blocked";
    await appendExecutionLog(session.id, `${toolName} blocked: ${decision.reason}`);
    await saveSession(session);
    throw new Error(decision.reason);
  }

  currentAction.status = "running";
  session.actions.push(currentAction);
  await saveSession(session);
  await appendExecutionLog(session.id, `${toolName} started.`);
  const output = await runner();
  currentAction.output_json = output;
  currentAction.status = "completed";
  currentAction.updated_at = now();
  session.updated_at = currentAction.updated_at;
  await appendExecutionLog(session.id, `${toolName} completed.`);
  await saveSession(session);
  return output;
}

export async function executeApprovedPlan(session: AgentSession, pipelineMode: PipelineMode = "mock"): Promise<AgentSession> {
  if (!session.plan) {
    throw new Error("No plan exists for this session.");
  }
  if (!session.approved_at) {
    throw new Error("Human approval is required before execution.");
  }
  if (session.status === "cancelled") {
    throw new Error("Cannot execute a cancelled session.");
  }
  if (session.status === "completed") {
    return session;
  }

  session.status = "running";
  session.updated_at = now();
  await saveSession(session);
  await appendExecutionLog(session.id, `Execution started in ${pipelineMode} mode.`);

  const jobIds: string[] = [];
  const outputDirs: string[] = [];
  const generatedFiles: string[] = [];
  const safetyReviews: ResultBundle["safety_reviews"] = [];
  const publishSuggestions: ResultBundle["publish_suggestions"] = [];

  for (const idea of session.plan.content_ideas) {
    const job = await runAction(session, "createContentJobTool", idea, () =>
      agentToolRegistry.createContentJobTool({
        title: idea.title,
        content_type: session.plan?.mode === "song_mode" ? "song_short" : "story_short",
        language: session.plan?.language ?? "zh",
        target_age: session.plan?.target_age ?? "2-4",
        theme: idea.theme,
        style: idea.visual_style,
        duration_seconds: idea.duration_seconds,
        output_mode: session.plan?.output_mode ?? "video_and_audio_bundle",
        voice_style: idea.voice_style,
        platform: session.plan?.platform ?? "youtube_shorts"
      })
    );
    jobIds.push(job.job_id);

    await runAction(session, "generateScriptTool", { job_id: job.job_id }, () => agentToolRegistry.generateScriptTool(job.job_id));
    const pipeline = await runAction(session, "runPipelineTool", { job_id: job.job_id, pipeline_mode: pipelineMode }, () =>
      agentToolRegistry.runPipelineTool(job.job_id, pipelineMode)
    );
    outputDirs.push(pipeline.output_dir);
    generatedFiles.push(...pipeline.generated_files);

    const safety = await runAction(session, "reviewSafetyTool", { job_id: job.job_id }, () => agentToolRegistry.reviewSafetyTool(job.job_id));
    safetyReviews.push(safety);

    const exported = await runAction(session, "exportBundleTool", { job_id: job.job_id }, () => agentToolRegistry.exportBundleTool(job.job_id));
    generatedFiles.push(...exported.file_list);

    const suggestion = await runAction(session, "publishSuggestionTool", { job_id: job.job_id, platform: session.plan.platform }, () =>
      agentToolRegistry.publishSuggestionTool(job.job_id, session.plan?.platform ?? "youtube_shorts", idea.title, session.plan?.language)
    );
    publishSuggestions.push(suggestion);
  }

  session.result_bundle = {
    job_ids: jobIds,
    output_dirs: outputDirs,
    generated_files: Array.from(new Set(generatedFiles)),
    safety_reviews: safetyReviews,
    publish_suggestions: publishSuggestions,
    completed_at: now()
  };
  session.status = "completed";
  session.updated_at = now();
  await appendExecutionLog(session.id, "Execution completed.");
  await saveSession(session);
  return appendMessage(session, "agent", `Mock bundle completed for ${jobIds.length} job(s). Human review is still required before publishing.`);
}
