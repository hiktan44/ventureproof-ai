import { NextResponse } from "next/server";
import { z } from "zod";
import { addCredits, isAdminUser, readDb, recordPayment, requireAdminUser, writeDb } from "@/lib/db";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("addCredits"),
    userId: z.string().min(1),
    amount: z.number().int().positive().max(100000),
    reason: z.string().min(2).max(160).default("Admin credit grant")
  }),
  z.object({
    action: z.literal("setCredits"),
    userId: z.string().min(1),
    credits: z.number().int().min(0).max(1000000),
    reason: z.string().min(2).max(160).default("Admin credit correction")
  }),
  z.object({
    action: z.literal("setRole"),
    userId: z.string().min(1),
    role: z.enum(["user", "admin"])
  }),
  z.object({
    action: z.literal("recordPayment"),
    userId: z.string().min(1),
    pack: z.string().min(1).max(80),
    credits: z.number().int().nonnegative().max(1000000),
    amount: z.number().nonnegative().max(1000000),
    currency: z.string().min(3).max(8).default("EUR")
  })
]);

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminUser();
    const body = schema.parse(await request.json());
    const db = await readDb();
    const user = db.users.find((entry) => entry.id === body.userId);
    if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });

    if (body.action === "addCredits") {
      addCredits(db, user.id, body.amount, body.reason, undefined, admin.id);
    }

    if (body.action === "setCredits") {
      const diff = body.credits - user.credits;
      if (diff !== 0) addCredits(db, user.id, diff, body.reason, undefined, admin.id);
    }

    if (body.action === "setRole") {
      user.role = body.role;
      addCredits(db, user.id, 0, `Admin role changed to ${body.role}`, undefined, admin.id);
    }

    if (body.action === "recordPayment") {
      recordPayment(db, {
        userId: user.id,
        pack: body.pack,
        credits: body.credits,
        amount: body.amount,
        currency: body.currency,
        provider: "mock",
        status: "paid",
        actorUserId: admin.id
      });
      if (body.credits > 0) {
        addCredits(db, user.id, body.credits, `Admin recorded payment: ${body.pack}`, undefined, admin.id);
      }
    }

    await writeDb(db);
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        role: isAdminUser(db, user) ? "admin" : user.role ?? "user",
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : message === "FORBIDDEN" ? 403 : 400 });
  }
}

