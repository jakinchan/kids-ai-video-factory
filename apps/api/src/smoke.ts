import { approveSession, createAgentSession, executeApprovedPlan } from "./agents/clawDirectorAgent.js";

const session = await createAgentSession("帮我生成 2 条中文儿童短视频，主题是小动物，适合 3-5 岁，同时生成语音和字幕。");
await approveSession(session);
const completed = await executeApprovedPlan(session, "mock");

if (completed.status !== "completed" || !completed.result_bundle?.job_ids.length) {
  throw new Error("Smoke test failed: session did not complete.");
}

console.log(
  JSON.stringify(
    {
      session_id: completed.id,
      status: completed.status,
      job_ids: completed.result_bundle.job_ids,
      output_dirs: completed.result_bundle.output_dirs
    },
    null,
    2
  )
);
