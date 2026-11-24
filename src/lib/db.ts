import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { CreditLedgerEntry, Database, Idea, LoginMethod, LoginRecord, PaymentRecord, User } from "@/types/domain";
import { nowIso, uid } from "@/lib/utils";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "ventureproof.json");
const sessionCookie = "vp_session";
const loginRetentionMs = 400 * 24 * 60 * 60 * 1000;

const emptyDb: Database = {
  users: [],
  ideas: [],
  creditLedger: [],
  paymentLog: [],
  shareLinks: [],
  logins: []
};

// Serializes every write to the JSON file inside this process, so the login
// journal append (read-modify-write) cannot interleave with another write.
let writeQueue: Promise<unknown> = Promise.resolve();

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined);
  return run;
}

function pruneLogins(logins: LoginRecord[]) {
  const cutoff = Date.now() - loginRetentionMs;
  return logins.filter((entry) => !(Date.parse(entry.createdAt) < cutoff));
}

// Routes write back a snapshot they read earlier; keep login entries another
// request appended in the meantime instead of overwriting them.
async function mergeStoredLogins(logins: LoginRecord[]) {
  let stored: LoginRecord[] = [];
  try {
    const parsed = JSON.parse(await fs.readFile(dataFile, "utf8")) as Partial<Database>;
    stored = parsed.logins ?? [];
  } catch {
    stored = [];
  }
  const known = new Set(stored.map((entry) => entry.id));
  return pruneLogins([...stored, ...logins.filter((entry) => !known.has(entry.id))]);
}

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
    users: (parsed.users ?? []).map((user) => ({
      ...user,
      role: user.role ?? "user"
    })) as User[],
    ideas: (parsed.ideas ?? []).map((idea) => ({
      ...idea,
      moduleOutputs: idea.moduleOutputs ?? {}
    })) as Idea[],
    creditLedger: parsed.creditLedger ?? [],
    paymentLog: parsed.paymentLog ?? [],
    shareLinks: parsed.shareLinks ?? [],
    logins: parsed.logins ?? []
  };
  return db;
}

export async function writeDb(db: Database) {
  await withWriteLock(async () => {
    await ensureDb();
    db.logins = await mergeStoredLogins(db.logins ?? []);
    await fs.writeFile(dataFile, JSON.stringify(db, null, 2));
  });
}

// Journals one successful session issue. Never throws: a journal failure must
// not fail the login, and the warning carries no user data.
export async function recordLogin(userId: string, method: LoginMethod) {
  try {
    await withWriteLock(async () => {
      const db = await readDb();
      db.logins.push({ id: randomUUID(), userId, method, createdAt: nowIso() });
      db.logins = pruneLogins(db.logins);
      await fs.writeFile(dataFile, JSON.stringify(db, null, 2));
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | undefined)?.code;
    console.warn(`Login journal write failed (${code ?? (error instanceof Error ? error.name : "unknown")}); login continues.`);
  }
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
    role: user.role ?? "user",
    createdAt: user.createdAt
  };
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(db: Database, user: User) {
  if ((user.role ?? "user") === "admin") return true;
  if (adminEmails().includes(user.email.toLowerCase())) return true;
  const firstUser = [...db.users].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  return firstUser?.id === user.id && !db.users.some((entry) => (entry.role ?? "user") === "admin");
}

export async function requireAdminUser(): Promise<User> {
  const user = await requireCurrentUser();
  const db = await readDb();
  const fresh = db.users.find((entry) => entry.id === user.id);
  if (!fresh || !isAdminUser(db, fresh)) {
    throw new Error("FORBIDDEN");
  }
  return fresh;
}

export function addCredits(db: Database, userId: string, amount: number, reason: string, ideaId?: string, actorUserId?: string) {
  const user = db.users.find((entry) => entry.id === userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  user.credits += amount;
  const ledger: CreditLedgerEntry = {
    id: uid("ledger"),
    userId,
    amount,
    reason,
    ideaId,
    actorUserId,
    createdAt: nowIso()
  };
  db.creditLedger.unshift(ledger);
  return ledger;
}

export function spendCredits(db: Database, userId: string, amount: number, reason: string, ideaId?: string, actorUserId?: string) {
  const user = db.users.find((entry) => entry.id === userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.credits < amount) throw new Error("INSUFFICIENT_CREDITS");
  return addCredits(db, userId, -amount, reason, ideaId, actorUserId);
}

export function recordPayment(db: Database, input: Omit<PaymentRecord, "id" | "createdAt">) {
  const payment: PaymentRecord = {
    id: uid("payment"),
    createdAt: nowIso(),
    ...input
  };
  db.paymentLog.unshift(payment);
  return payment;
}

export function ideasForUser(db: Database, userId: string): Idea[] {
  return db.ideas.filter((idea) => idea.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
