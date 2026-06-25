import { createContentJobTool } from "./tools/createContentJobTool.js";
import { generateScriptTool } from "./tools/generateScriptTool.js";
import { runPipelineTool } from "./tools/runPipelineTool.js";
import { reviewSafetyTool } from "./tools/reviewSafetyTool.js";
import { exportBundleTool } from "./tools/exportBundleTool.js";
import { analyticsReviewTool } from "./tools/analyticsReviewTool.js";
import { publishSuggestionTool } from "./tools/publishSuggestionTool.js";

export const agentToolRegistry = {
  createContentJobTool,
  generateScriptTool,
  runPipelineTool,
  reviewSafetyTool,
  exportBundleTool,
  analyticsReviewTool,
  publishSuggestionTool
};

export type AgentToolName = keyof typeof agentToolRegistry;
