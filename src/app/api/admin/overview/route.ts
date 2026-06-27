import { NextResponse } from "next/server";
import { isAdminUser, readDb, requireAdminUser } from "@/lib/db";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    const db = await readDb();
    const users = db.users
      .map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        role: isAdminUser(db, user) ? "admin" : user.role ?? "user",
        createdAt: user.createdAt,
        ideaCount: db.ideas.filter((idea) => idea.userId === user.id).length,
        ledgerCount: db.creditLedger.filter((entry) => entry.userId === user.id).length,
        paidTotal: db.paymentLog.filter((payment) => payment.userId === user.id && payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0)
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({
      admin: { id: admin.id, email: admin.email },
      stats: {
        users: db.users.length,
        ideas: db.ideas.length,
        creditsIssued: db.creditLedger.filter((entry) => entry.amount > 0).reduce((sum, entry) => sum + entry.amount, 0),
        creditsSpent: Math.abs(db.creditLedger.filter((entry) => entry.amount < 0).reduce((sum, entry) => sum + entry.amount, 0)),
        revenue: db.paymentLog.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0)
      },
      users,
      ledger: db.creditLedger.slice(0, 100),
      payments: db.paymentLog.slice(0, 100)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 403 });
  }
}

