import { NextResponse } from "next/server";
import { generateExperiments, generateValidationReport } from "@/lib/ai-provider";
import { publicUser, readDb, requireCurrentUser, spendCredits, writeDb } from "@/lib/db";
import { moduleCosts } from "@/types/domain";
import { nowIso } from "@/lib/utils";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await context.params;
    const db = await readDb();
    const freshUser = db.users.find((entry) => entry.id === user.id);
    const idea = db.ideas.find((entry) => entry.id === id && entry.userId === user.id);
    if (!freshUser || !idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

    spendCredits(db, user.id, moduleCosts.validation, "Idea Validation", idea.id);
    idea.modules.validation = "complete";
    idea.modules.market = "ready";
    idea.modules.businessPlan = "ready";
    idea.modules.brand = "ready";
    const report = generateValidationReport(idea);
    idea.reports.unshift(report);
    if (idea.experiments.length === 0) {
      idea.experiments = generateExperiments(idea.id);
    }
    idea.updatedAt = nowIso();
    await writeDb(db);
    return NextResponse.json({ idea, report, user: publicUser(freshUser) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    if (message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Yetersiz kredi. Lutfen kredi yukleyin." }, { status: 402 });
    }
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
