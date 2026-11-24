import { NextResponse } from "next/server";
import { z } from "zod";
import { addCredits, publicUser, readDb, recordLogin, setSession, writeDb } from "@/lib/db";
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
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
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
  addCredits(db, user.id, 1000, "Kayıt bonusu");
  await writeDb(db);
  await setSession(user.id);
  await recordLogin(user.id, "register");
  return NextResponse.json({ user: publicUser(user) });
}
