import { createHash, randomBytes } from "crypto";

export function nowIso() {
  return new Date().toISOString();
}

export function uid(prefix = "id") {
  return `${prefix}_${randomBytes(10).toString("hex")}`;
}

export function hashPassword(password: string) {
  return createHash("sha256").update(`ventureproof:${password}`).digest("hex");
}

export function publicUserName(email: string) {
  return email.split("@")[0]?.replace(/[._-]+/g, " ") || "Founder";
}

export function clampScore(value: number) {
  return Math.max(1, Math.min(99, Math.round(value)));
}
