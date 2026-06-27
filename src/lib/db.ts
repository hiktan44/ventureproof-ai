import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import type { CreditLedgerEntry, Database, Idea, User } from "@/types/domain";
import { nowIso, uid } from "@/lib/utils";

const dataFile = path.join(process.cwd(), ".data", "ventureproof.json");
const sessionCookie = "vp_session";

const emptyDb: Database = {
  users: [],
  ideas: [],
  creditLedger: [],
  shareLinks: []
};

async function ensureDb() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(emptyDb, null, 2));
  }
}

export async function readDb(): Promise<Database> {
  await ensureDb();
  const raw = await fs.readFile(dataFile, "utf8");
  const parsed = JSON.parse(raw) as Partial<Database>;
  const db: Database = {
    users: parsed.users ?? [],
    ideas: (parsed.ideas ?? []).map((idea) => ({
      ...idea,
      moduleOutputs: idea.moduleOutputs ?? {}
    })) as Idea[],
    creditLedger: parsed.creditLedger ?? [],
    shareLinks: parsed.shareLinks ?? []
  };
  return db;
}

export async function writeDb(db: Database) {
  await ensureDb();
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2));
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(sessionCookie)?.value;
  if (!userId) return null;
  const db = await readDb();
  return db.users.find((user) => user.id === userId) ?? null;
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie);
}

export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    credits: user.credits,
    createdAt: user.createdAt
  };
}

export function addCredits(db: Database, userId: string, amount: number, reason: string, ideaId?: string) {
  const user = db.users.find((entry) => entry.id === userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  user.credits += amount;
  const ledger: CreditLedgerEntry = {
    id: uid("ledger"),
    userId,
    amount,
    reason,
    ideaId,
    createdAt: nowIso()
  };
  db.creditLedger.unshift(ledger);
  return ledger;
}

export function spendCredits(db: Database, userId: string, amount: number, reason: string, ideaId?: string) {
  const user = db.users.find((entry) => entry.id === userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.credits < amount) throw new Error("INSUFFICIENT_CREDITS");
  return addCredits(db, userId, -amount, reason, ideaId);
}

export function ideasForUser(db: Database, userId: string): Idea[] {
  return db.ideas.filter((idea) => idea.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
