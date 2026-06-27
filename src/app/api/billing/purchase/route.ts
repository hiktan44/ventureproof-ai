import { NextResponse } from "next/server";
import { z } from "zod";
import { addCredits, publicUser, readDb, requireCurrentUser, writeDb } from "@/lib/db";

const packs: Record<string, number> = {
  starter: 200,
  builder: 800,
  founder: 1800,
  studio: 5000
};

const schema = z.object({
  pack: z.enum(["starter", "builder", "founder", "studio"])
});

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = schema.parse(await request.json());
    const db = await readDb();
    addCredits(db, user.id, packs[body.pack], `Mock purchase: ${body.pack}`);
    const updated = db.users.find((entry) => entry.id === user.id);
    await writeDb(db);
    return NextResponse.json({ user: updated ? publicUser(updated) : null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
