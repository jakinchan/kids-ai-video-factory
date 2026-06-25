import type { PublishSuggestion } from "../types.js";
import { t } from "../localization.js";

export async function publishSuggestionTool(jobId: string, platform: string, title: string, language = "en"): Promise<PublishSuggestion> {
  const copy = t(language).publish;
  return {
    job_id: jobId,
    platform,
    title_suggestions: copy.titles(title),
    description: copy.description,
    hashtags: [...copy.hashtags],
    publish_time: "manual_review_required",
    thumbnail_suggestion: copy.thumbnail
  };
}
