import path from "node:path";
import { nanoid } from "nanoid";
import { jobsRoot } from "../paths.js";
import { writeJsonFile } from "../fileStore.js";
import type { ContentJob, CreateContentJobInput } from "../types.js";

export async function createContentJobTool(input: CreateContentJobInput): Promise<ContentJob> {
  const now = new Date().toISOString();
  const jobId = `job_${nanoid(10)}`;
  const job: ContentJob = {
    job_id: jobId,
    status: "created",
    input,
    output_dir: path.join(jobsRoot, jobId),
    created_at: now,
    updated_at: now
  };
  await writeJsonFile(path.join(job.output_dir, "job.json"), job);
  return job;
}
