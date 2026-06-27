import { NextResponse } from "next/server";
import { getCurrentUser, ideasForUser, publicUser, readDb } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null, ideas: [] });
  const db = await readDb();
  return NextResponse.json({ user: publicUser(user), ideas: ideasForUser(db, user.id), ledger: db.creditLedger.filter((entry) => entry.userId === user.id) });
}
