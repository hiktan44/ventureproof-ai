import { NextResponse } from "next/server";
import { z } from "zod";
import { addCredits, publicUser, readDb, setSession, writeDb } from "@/lib/db";
import { hashPassword, nowIso, publicUserName, uid } from "@/lib/utils";
import type { User } from "@/types/domain";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const email = body.email.toLowerCase();
  const db = await readDb();
  if (db.users.some((user) => user.email === email)) {
    return NextResponse.json({ error: "Bu e-posta zaten kayitli." }, { status: 409 });
  }
  const user = {
    id: uid("user"),
    email,
    name: publicUserName(email),
    passwordHash: hashPassword(body.password),
    credits: 0,
    role: db.users.length === 0 ? "admin" : "user",
    createdAt: nowIso()
  } satisfies User;
  db.users.push(user);
  addCredits(db, user.id, 100, "Signup bonus");
  await writeDb(db);
  await setSession(user.id);
  return NextResponse.json({ user: publicUser(user) });
}
