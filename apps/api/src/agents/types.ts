export type AgentMode =
  | "single_job_mode"
  | "batch_job_mode"
  | "bedtime_mode"
  | "song_mode"
  | "educational_mode"
  | "review_mode";

export type SessionStatus = "planning" | "awaiting_approval" | "approved" | "running" | "completed" | "cancelled" | "blocked";

export type MessageRole = "user" | "agent" | "system";

export type PipelineMode = "mock" | "real";

export interface AgentMessage {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface ContentIdea {
  title: string;
  theme: string;
  lesson: string;
  visual_style: string;
  voice_style: string;
  duration_seconds: number;
}

export interface AgentPlan {
  intent: string;
  mode: AgentMode;
  goal: string;
  language: string;
  target_age: string;
  theme: string;
  content_count: number;
  output_mode: "video_and_audio_bundle";
  voice_style: string;
  platform: string;
  plan_steps: string[];
  content_ideas: ContentIdea[];
  requires_human_approval: boolean;
  safety_notes: string[];
  blocked_actions: string[];
  next_question: string;
}

export interface AgentAction {
  id: string;
  action_type: string;
  tool_name: string;
  input_json: unknown;
  output_json: unknown;
  status: "pending" | "running" | "completed" | "blocked" | "failed";
  risk_level: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface AgentSession {
  id: string;
  title: string;
  user_goal: string;
  mode: AgentMode;
  status: SessionStatus;
  requires_human_approval: boolean;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  messages: AgentMessage[];
  plan?: AgentPlan;
  actions: AgentAction[];
  result_bundle?: ResultBundle;
}

export interface ResultBundle {
  job_ids: string[];
  output_dirs: string[];
  generated_files: string[];
  safety_reviews: SafetyReview[];
  publish_suggestions: PublishSuggestion[];
  completed_at: string;
}

export interface CreateContentJobInput {
  title: string;
  content_type: string;
  language: string;
  target_age: string;
  theme: string;
  style: string;
  duration_seconds: number;
  output_mode: string;
  voice_style: string;
  platform: string;
}

export interface ContentJob {
  job_id: string;
  status: "created" | "script_ready" | "pipeline_complete" | "reviewed" | "exported";
  input: CreateContentJobInput;
  output_dir: string;
  created_at: string;
  updated_at: string;
}

export interface SafetyReview {
  job_id: string;
  safety_status: "approved_for_draft" | "needs_human_review" | "blocked";
  risk_level: "low" | "medium" | "high";
  notes: string[];
}

export interface PublishSuggestion {
  job_id: string;
  platform: string;
  title_suggestions: string[];
  description: string;
  hashtags: string[];
  publish_time: string;
  thumbnail_suggestion: string;
}
