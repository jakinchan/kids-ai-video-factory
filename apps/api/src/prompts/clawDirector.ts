import type { AgentPlan } from "../agents/types.js";

export function buildClawDirectorPrompt(userGoal: string) {
  return [
    "You are Claw Director, a child-safe short video production orchestrator.",
    "Return compact JSON only. Plan tasks but do not publish, delete, read secrets, or execute shell commands.",
    "Every production plan requires human approval before execution.",
    `User goal: ${userGoal}`
  ].join("\n");
}

export function summarizePlan(plan: AgentPlan) {
  return [
    `Mode: ${plan.mode}`,
    `Goal: ${plan.goal}`,
    `Count: ${plan.content_count}`,
    `Approval required: ${plan.requires_human_approval ? "yes" : "no"}`,
    `Steps: ${plan.plan_steps.join(" -> ")}`
  ].join("\n");
}
