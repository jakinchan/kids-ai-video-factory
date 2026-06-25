import path from "node:path";
import { readJsonFile, writeJsonFile, writeTextFile } from "../fileStore.js";
import { t } from "../localization.js";
import { jobsRoot } from "../paths.js";
import type { ContentJob } from "../types.js";

export async function generateScriptTool(jobId: string) {
  const job = await readJsonFile<ContentJob | undefined>(path.join(jobsRoot, jobId, "job.json"), undefined);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  const copy = t(job.input.language);

  const script = {
    job_id: jobId,
    title: job.input.title,
    language: job.input.language,
    target_age: job.input.target_age,
    scenes: [
      {
        scene: 1,
        visual: copy.script.visual1(job.input.theme),
        narration: copy.script.narration1(job.input.title)
      },
      {
        scene: 2,
        visual: copy.script.visual2,
        narration: copy.script.narration2
      },
      {
        scene: 3,
        visual: copy.script.visual3,
        narration: copy.script.narration3
      }
    ]
  };

  const scriptPath = path.join(job.output_dir, "script.json");
  await writeJsonFile(scriptPath, script);
  await writeTextFile(path.join(job.output_dir, "narration.txt"), script.scenes.map((scene) => scene.narration).join("\n"));
  await writeJsonFile(path.join(job.output_dir, "storyboard.json"), {
    job_id: jobId,
    visual_style: job.input.style,
    frames: script.scenes.map((scene) => ({
      scene: scene.scene,
      prompt: `${scene.visual} ${job.input.style}`
    }))
  });

  job.status = "script_ready";
  job.updated_at = new Date().toISOString();
  await writeJsonFile(path.join(job.output_dir, "job.json"), job);

  return {
    script_json_path: scriptPath,
    status: job.status
  };
}
