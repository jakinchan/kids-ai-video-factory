import cors from "cors";
import express from "express";
import agentRoutes from "./routes/agentRoutes.js";

const app = express();
const port = Number(process.env.API_PORT ?? 4010);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/agent", agentRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = (error as Error & { status?: number }).status ?? 400;
  res.status(status).json({
    error: error instanceof Error ? error.message : "Unknown error"
  });
});

app.listen(port, () => {
  console.log(`Claw Director API listening on http://localhost:${port}`);
});
