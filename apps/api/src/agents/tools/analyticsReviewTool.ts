export async function analyticsReviewTool(input: { channel_id?: string; job_id?: string }) {
  const seed = input.job_id?.length ?? input.channel_id?.length ?? 3;
  return {
    play_count: seed * 120,
    completion_rate: 0.72,
    replay_rate: 0.18,
    estimated_revenue: 0,
    next_action: "Create another gentle variant with a clearer opening hook, then review manually."
  };
}
