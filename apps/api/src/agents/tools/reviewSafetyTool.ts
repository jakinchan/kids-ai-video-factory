import path from "node:path";
import { childSafetyReviewRules } from "../../prompts/agentReview.js";
import { readJsonFile, writeJsonFile } from "../fileStore.js";
import { t } from "../localization.js";
import { jobsRoot } from "../paths.js";
import type { ContentJob, SafetyReview } from "../types.js";

export async function reviewSafetyTool(jobId: string): Promise<SafetyReview> {
  const job = await readJsonFile<ContentJob | undefined>(path.join(jobsRoot, jobId, "job.json"), undefined);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  const copy = t(job.input.language);

  const review: SafetyReview = {
    job_id: jobId,
    safety_status: "approved_for_draft",
    risk_level: "low",
    notes: [
      copy.safetyDraft,
      ...childSafetyReviewRules
    ]
  };

  await writeJsonFile(path.join(job.output_dir, "safety_review.json"), review);
  job.status = "reviewed";
  job.updated_at = new Date().toISOString();
  await writeJsonFile(path.join(job.output_dir, "job.json"), job);
  return review;
}
