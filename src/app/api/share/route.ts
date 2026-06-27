import { NextResponse } from "next/server";
import { z } from "zod";
import { readDb, requireCurrentUser, writeDb } from "@/lib/db";
import { nowIso, uid } from "@/lib/utils";

const schema = z.object({
  ideaId: z.string()
});

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = schema.parse(await request.json());
    const db = await readDb();
    const idea = db.ideas.find((entry) => entry.id === body.ideaId && entry.userId === user.id);
    if (!idea || !idea.reports[0]) return NextResponse.json({ error: "Shareable report not found" }, { status: 404 });
    const existing = db.shareLinks.find((link) => link.ideaId === idea.id && link.userId === user.id);
    if (existing) return NextResponse.json({ url: `/share/${existing.token}`, token: existing.token });
    const token = uid("share").replace("share_", "");
    db.shareLinks.push({
      id: uid("sharelink"),
      ideaId: idea.id,
      userId: user.id,
      token,
      createdAt: nowIso()
    });
    await writeDb(db);
    return NextResponse.json({ url: `/share/${token}`, token });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Share failed";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
