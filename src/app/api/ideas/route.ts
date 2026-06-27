import { NextResponse } from "next/server";
import { z } from "zod";
import { ideasForUser, readDb, requireCurrentUser, writeDb } from "@/lib/db";
import { normalizeContext, titleFromDescription } from "@/lib/ai-provider";
import { nowIso, uid } from "@/lib/utils";
import type { Idea } from "@/types/domain";

const createSchema = z.object({
  description: z.string().min(12),
  context: z.record(z.string(), z.any()).optional()
});

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const db = await readDb();
    return NextResponse.json({ ideas: ideasForUser(db, user.id) });
  } catch {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = createSchema.parse(await request.json());
    const db = await readDb();
    const createdAt = nowIso();
    const idea: Idea = {
      id: uid("idea"),
      userId: user.id,
      title: titleFromDescription(body.description),
      description: body.description,
      context: normalizeContext(body.context ?? {}),
      modules: {
        validation: "ready",
        market: "locked",
        businessPlan: "locked",
        brand: "locked",
        visual: "locked",
        marketing: "locked"
      },
      reports: [],
      experiments: [],
      createdAt,
      updatedAt: createdAt
    };
    db.ideas.push(idea);
    await writeDb(db);
    return NextResponse.json({ idea });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
