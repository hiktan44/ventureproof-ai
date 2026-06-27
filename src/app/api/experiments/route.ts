import { NextResponse } from "next/server";
import { z } from "zod";
import { readDb, requireCurrentUser, writeDb } from "@/lib/db";
import type { ExperimentStatus } from "@/types/domain";
import { nowIso } from "@/lib/utils";

const schema = z.object({
  ideaId: z.string(),
  experimentId: z.string(),
  status: z.enum(["to_validate", "in_progress", "confirmed", "false"]).optional(),
  evidence: z.string().optional()
});

export async function PATCH(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = schema.parse(await request.json());
    const db = await readDb();
    const idea = db.ideas.find((entry) => entry.id === body.ideaId && entry.userId === user.id);
    const experiment = idea?.experiments.find((entry) => entry.id === body.experimentId);
    if (!idea || !experiment) return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    if (body.status) experiment.status = body.status as ExperimentStatus;
    if (body.evidence?.trim()) experiment.evidence.unshift(body.evidence.trim());
    idea.updatedAt = nowIso();
    await writeDb(db);
    return NextResponse.json({ idea, experiment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
