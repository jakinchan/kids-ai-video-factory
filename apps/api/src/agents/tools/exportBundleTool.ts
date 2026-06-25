import path from "node:path";
import { promises as fs } from "node:fs";
import { readJsonFile, writeJsonFile } from "../fileStore.js";
import { t } from "../localization.js";
import { jobsRoot } from "../paths.js";
import type { ContentJob } from "../types.js";

export async function exportBundleTool(jobId: string) {
  const job = await readJsonFile<ContentJob | undefined>(path.join(jobsRoot, jobId, "job.json"), undefined);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  const copy = t(job.input.language);

  const entries = await fs.readdir(job.output_dir);
  const fileList = entries.map((entry) => path.join(job.output_dir, entry));
  const manifestPath = path.join(job.output_dir, "bundle_manifest.json");

  await writeJsonFile(manifestPath, {
    job_id: jobId,
    bundle_path: job.output_dir,
    file_list: fileList,
    exported_at: new Date().toISOString(),
    note: copy.manifestNote
  });

  job.status = "exported";
  job.updated_at = new Date().toISOString();
  await writeJsonFile(path.join(job.output_dir, "job.json"), job);

  return {
    bundle_path: job.output_dir,
    file_list: [...fileList, manifestPath]
  };
}
