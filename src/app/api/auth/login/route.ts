import { NextResponse } from "next/server";
import { z } from "zod";
import { publicUser, readDb, setSession } from "@/lib/db";
import { hashPassword } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const db = await readDb();
  const user = db.users.find((entry) => entry.email === body.email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(body.password)) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }
  await setSession(user.id);
  return NextResponse.json({ user: publicUser(user) });
}
