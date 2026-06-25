import { defaultPlanSteps } from "../prompts/agentPlanning.js";
import { t } from "./localization.js";
import type { AgentMode, AgentPlan, ContentIdea } from "./types.js";

const titleSeeds = [
  "Little Star Finds a Friend",
  "The Kind Cloud",
  "Bunny Learns to Share",
  "Tiny Train Counts to Five",
  "Sleepy Moon Says Goodnight",
  "Panda Cleans Up"
];

const CJK_NUMBERS: Record<string, number> = {
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10
};

function inferCount(text: string): number {
  const normalized = text.toLowerCase();
  const countMatch = normalized.match(/(?:create|make|generate|制作|生成|作成|つくる|作る)?\s*([1-9]|10)\s*(?:videos?|shorts?|clips?|本|条|個|件|つ)?/i);
  if (countMatch) {
    return Math.min(Number(countMatch[1]), 10);
  }

  const cjkMatch = text.match(/([一二两三四五六七八九十])\s*(?:本|条|個|件|つ|个|部|動画|短视频|短片)/);
  if (cjkMatch) {
    return CJK_NUMBERS[cjkMatch[1]] ?? 1;
  }

  return 1;
}

function inferMode(text: string): AgentMode {
  if (/sleep|bedtime|goodnight|眠|睡|おやすみ|寝かしつけ/i.test(text)) return "bedtime_mode";
  if (/song|music|sing|歌|音乐|音楽|うた/i.test(text)) return "song_mode";
  if (/number|count|color|learn|educational|数字|数|颜色|色|学|学習|教育/i.test(text)) return "educational_mode";
  if (/review|audit|チェック|確認|审核|審査/i.test(text)) return "review_mode";
  return inferCount(text) > 1 ? "batch_job_mode" : "single_job_mode";
}

function inferLanguage(text: string): string {
  if (/japanese|日本語|日文|ja\b/i.test(text)) return "ja";
  if (/english|英語|英文|英语|en\b/i.test(text)) return "en";
  if (/chinese|中文|中国語|zh\b/i.test(text)) return "zh";
  if (/[\u3040-\u30ff]/.test(text)) return "ja";
  if (/[\u4e00-\u9fff]/.test(text)) return "zh";
  return "en";
}

function inferTheme(text: string): string {
  if (/animal|animals|動物|动物|どうぶつ|うさぎ|パンダ|bunny|panda/i.test(text)) return "animal";
  if (/number|count|数字|数|かず/i.test(text)) return "numbers";
  if (/habit|clean|cleanup|片付|習慣|习惯|整理/i.test(text)) return "good_habits";
  if (/sleep|bedtime|眠|睡|おやすみ/i.test(text)) return "bedtime";
  if (/friend|kind|share|友達|やさし|朋友|分享/i.test(text)) return "gentle_friendship";
  return "gentle_friendship";
}

function inferTargetAge(text: string): string {
  const ageMatch = text.match(/([0-9])\s*[-~〜到至]\s*([0-9])\s*(?:歳|才|age|years?|岁)?/i);
  if (ageMatch) return `${ageMatch[1]}-${ageMatch[2]}`;
  const singleAgeMatch = text.match(/([0-9])\s*(?:歳|才|years?|岁)/i);
  if (singleAgeMatch) return singleAgeMatch[1];
  return "3-5";
}

function inferPlatform(text: string): string {
  if (/tiktok/i.test(text)) return "tiktok";
  if (/douyin|抖音/i.test(text)) return "douyin";
  if (/xiaohongshu|小红书|小紅書/i.test(text)) return "xiaohongshu";
  if (/instagram|reels/i.test(text)) return "instagram_reels";
  return "youtube_shorts";
}

function makeIdeas(count: number, theme: string, mode: AgentMode, language: string): ContentIdea[] {
  const copy = t(language);
  return Array.from({ length: count }).map((_, index) => {
    const title = titleSeeds[index % titleSeeds.length];
    const lesson = mode === "educational_mode" ? copy.lesson.educational : copy.lesson.gentle;
    return {
      title: `${title} ${index + 1}`,
      theme,
      lesson,
      visual_style: copy.visualStyle,
      voice_style: mode === "song_mode" ? copy.voiceStyle.song : copy.voiceStyle.default,
      duration_seconds: mode === "bedtime_mode" ? 45 : 30
    };
  });
}

export function createAgentPlan(userGoal: string): AgentPlan {
  const mode = inferMode(userGoal);
  const content_count = inferCount(userGoal);
  const language = inferLanguage(userGoal);
  const theme = inferTheme(userGoal);
  const target_age = inferTargetAge(userGoal);
  const platform = inferPlatform(userGoal);
  const copy = t(language);

  return {
    intent: "create_child_safe_short_video_bundle",
    mode,
    goal: userGoal,
    language,
    target_age,
    theme,
    content_count,
    output_mode: "video_and_audio_bundle",
    voice_style: mode === "song_mode" ? copy.voiceStyle.song : copy.voiceStyle.default,
    platform,
    plan_steps: [...(language === "en" ? defaultPlanSteps : copy.planSteps)],
    content_ideas: makeIdeas(content_count, theme, mode, language),
    requires_human_approval: true,
    safety_notes: [...copy.safetyNotes],
    blocked_actions: [
      "auto_publish",
      "delete_files",
      "read_secrets",
      "run_shell",
      "call_unreviewed_external_urls"
    ],
    next_question: ""
  };
}
