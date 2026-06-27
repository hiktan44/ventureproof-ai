import { promises as fs } from "fs";
import path from "path";
import { createModuleOutput, generateExperiments, generateValidationReport, normalizeContext, titleFromDescription } from "../src/lib/ai-provider";
import { hashPassword, nowIso, uid } from "../src/lib/utils";
import type { Database, Idea, User } from "../src/types/domain";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "ventureproof.json");
const email = "demo@ventureproof.ai";
const password = "DemoPass!2026";

async function readDb(): Promise<Database> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    return {
      users: parsed.users ?? [],
      ideas: parsed.ideas ?? [],
      creditLedger: parsed.creditLedger ?? [],
      paymentLog: parsed.paymentLog ?? [],
      shareLinks: parsed.shareLinks ?? []
    } as Database;
  } catch {
    return { users: [], ideas: [], creditLedger: [], paymentLog: [], shareLinks: [] };
  }
}

async function main() {
  const db = await readDb();
  let user = db.users.find((entry) => entry.email === email);
  if (!user) {
    user = {
      id: uid("user"),
      email,
      name: "Demo Founder",
      passwordHash: hashPassword(password),
      credits: 1180,
      role: "admin",
      createdAt: nowIso()
    } satisfies User;
    db.users.push(user);
    db.creditLedger.unshift({
      id: uid("ledger"),
      userId: user.id,
      amount: 1180,
      reason: "Seed demo credits",
      createdAt: nowIso()
    });
  } else if (!user.role) {
    user.role = "admin";
  }

  let idea = db.ideas.find((entry) => entry.userId === user.id);
  if (!idea) {
    const description = "Turkey and EU boutique hotels need an AI revenue copilot that recommends pricing, channel actions and weekly demand experiments.";
    const createdAt = nowIso();
    idea = {
      id: uid("idea"),
      userId: user.id,
      title: titleFromDescription(description),
      description,
      context: normalizeContext({
        geography: "Turkey + EU",
        industry: "Hospitality SaaS",
        customerSegment: "boutique hotel operators",
        stage: "mvp",
        founderSkills: "hospitality sales, analytics, no-code"
      }),
      modules: {
        validation: "complete",
        market: "complete",
        businessPlan: "complete",
        brand: "complete",
        visual: "ready",
        marketing: "locked"
      },
      reports: [],
      moduleOutputs: {},
      experiments: [],
      createdAt,
      updatedAt: createdAt
    } satisfies Idea;
    const report = generateValidationReport(idea);
    idea.reports.unshift(report);
    idea.experiments = generateExperiments(idea.id);
    idea.moduleOutputs.market = createModuleOutput("market", idea);
    idea.moduleOutputs.businessPlan = createModuleOutput("businessPlan", idea);
    idea.moduleOutputs.brand = createModuleOutput("brand", idea);
    db.ideas.push(idea);
    db.shareLinks.push({
      id: uid("sharelink"),
      ideaId: idea.id,
      userId: user.id,
      token: "demo",
      createdAt: nowIso()
    });
  }

  await fs.writeFile(dataFile, JSON.stringify(db, null, 2));
  console.log(`Seeded ${email} / ${password}`);
  console.log("Shared report: /share/demo");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
