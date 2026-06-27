import { NextResponse } from "next/server";
import { getCurrentUser, ideasForUser, isAdminUser, publicUser, readDb } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null, ideas: [] });
  const db = await readDb();
  const fresh = db.users.find((entry) => entry.id === user.id) ?? user;
  const sessionUser = {
    ...publicUser(fresh),
    role: isAdminUser(db, fresh) ? "admin" : fresh.role ?? "user"
  };
  return NextResponse.json({ user: sessionUser, ideas: ideasForUser(db, user.id), ledger: db.creditLedger.filter((entry) => entry.userId === user.id) });
}
