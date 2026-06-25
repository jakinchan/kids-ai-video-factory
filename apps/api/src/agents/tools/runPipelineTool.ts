import path from "node:path";
import { readJsonFile, writeJsonFile, writeTextFile } from "../fileStore.js";
import { t } from "../localization.js";
import { jobsRoot } from "../paths.js";
import type { ContentJob, PipelineMode } from "../types.js";

function srtForTitle(title: string, language: string) {
  const copy = t(language);
  return [
    "1",
    "00:00:00,000 --> 00:00:05,000",
    copy.script.narration1(title),
    "",
    "2",
    "00:00:05,000 --> 00:00:12,000",
    copy.script.narration2,
    "",
    "3",
    "00:00:12,000 --> 00:00:18,000",
    copy.script.narration3,
    ""
  ].join("\n");
}

export async function runPipelineTool(jobId: string, pipelineMode: PipelineMode = "mock") {
  const job = await readJsonFile<ContentJob | undefined>(path.join(jobsRoot, jobId, "job.json"), undefined);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  const generatedFiles = [
    path.join(job.output_dir, "audio_metadata.json"),
    path.join(job.output_dir, "video_metadata.json"),
    path.join(job.output_dir, "subtitles.srt")
  ];

  await writeJsonFile(generatedFiles[0], {
    job_id: jobId,
    mode: pipelineMode,
    voice_style: job.input.voice_style,
    format: "mock-audio",
    file_name: "narration.mock.wav"
  });
  await writeJsonFile(generatedFiles[1], {
    job_id: jobId,
    mode: pipelineMode,
    platform: job.input.platform,
    duration_seconds: job.input.duration_seconds,
    format: "mock-video",
    file_name: "video.mock.mp4"
  });
  await writeTextFile(generatedFiles[2], srtForTitle(job.input.title, job.input.language));

  job.status = "pipeline_complete";
  job.updated_at = new Date().toISOString();
  await writeJsonFile(path.join(job.output_dir, "job.json"), job);

  return {
    output_dir: job.output_dir,
    generated_files: generatedFiles,
    status: job.status
  };
}
