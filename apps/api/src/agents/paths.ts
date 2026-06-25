import path from "node:path";

export const projectRoot = path.resolve(process.env.PROJECT_ROOT ?? path.join(process.cwd(), "../.."));
export const outputRoot = path.join(projectRoot, "output");
export const sessionRoot = path.join(outputRoot, "agent-sessions");
export const jobsRoot = path.join(outputRoot, "jobs");
