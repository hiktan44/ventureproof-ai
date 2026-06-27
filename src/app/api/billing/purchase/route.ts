import { NextResponse } from "next/server";
import { z } from "zod";
import { addCredits, publicUser, readDb, recordPayment, requireCurrentUser, writeDb } from "@/lib/db";

const packs: Record<string, number> = {
  starter: 200,
  builder: 800,
  founder: 1800,
  studio: 5000
};

const prices: Record<string, number> = {
  starter: 19.99,
  builder: 49.99,
  founder: 99.99,
  studio: 249.99
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
    recordPayment(db, {
      userId: user.id,
      pack: body.pack,
      credits: packs[body.pack],
      amount: prices[body.pack],
      currency: "EUR",
      provider: "mock",
      status: "paid"
    });
    const updated = db.users.find((entry) => entry.id === user.id);
    await writeDb(db);
    return NextResponse.json({ user: updated ? publicUser(updated) : null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
