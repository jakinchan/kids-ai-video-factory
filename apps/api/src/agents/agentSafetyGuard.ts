export interface SafetyDecision {
  blocked: boolean;
  reason?: string;
  risk_level: "low" | "medium" | "high";
}

const blockedPatterns = [
  { pattern: /auto[_ -]?publish|direct[_ -]?publish|platform[_ -]?upload|自動投稿|自動公開|今すぐ投稿|直接公開/i, reason: "Automatic publishing requires human approval and is disabled in this version." },
  { pattern: /\.env|api[_ -]?key|secret|token/i, reason: "The agent cannot read or modify secrets or environment files." },
  { pattern: /\bdelete\b|\brm\s+-rf\b|remove-item|削除/i, reason: "Destructive file operations are blocked by policy." },
  { pattern: /gmail|stripe|payment|bank|銀行|支払/i, reason: "Connected personal, payment, and account systems are out of scope." },
  { pattern: /powershell|cmd\.exe|bash|shell|exec/i, reason: "Shell command execution is not exposed to the agent tool registry." },
  { pattern: /http:\/\/|https:\/\//i, reason: "External untrusted URLs require a reviewed integration before use." }
];

export function evaluateActionSafety(actionText: string): SafetyDecision {
  const blocked = blockedPatterns.find((item) => item.pattern.test(actionText));
  if (blocked) {
    return {
      blocked: true,
      reason: blocked.reason,
      risk_level: "high"
    };
  }

  return {
    blocked: false,
    risk_level: "low"
  };
}

export function assertAgentActionAllowed(actionText: string) {
  const decision = evaluateActionSafety(actionText);
  if (decision.blocked) {
    return {
      blocked: true,
      reason: decision.reason ?? "This operation requires human approval or a future integration.",
      risk_level: decision.risk_level
    };
  }

  return {
    blocked: false,
    risk_level: decision.risk_level
  };
}
