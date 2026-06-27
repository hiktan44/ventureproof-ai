import { NextResponse } from "next/server";
import { createModuleOutput } from "@/lib/ai-provider";
import { publicUser, readDb, requireCurrentUser, spendCredits, writeDb } from "@/lib/db";
import { moduleCosts, type ModuleKey } from "@/types/domain";
import { nowIso } from "@/lib/utils";

const unlockOrder: Partial<Record<ModuleKey, ModuleKey[]>> = {
  market: ["visual"],
  businessPlan: ["visual"],
  brand: ["visual"],
  visual: ["marketing"]
};

function isGeneratableModule(module: string): module is Exclude<ModuleKey, "validation"> {
  return ["market", "businessPlan", "brand", "visual", "marketing"].includes(module);
}

export async function POST(_request: Request, context: { params: Promise<{ id: string; module: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id, module } = await context.params;
    if (!isGeneratableModule(module)) {
      return NextResponse.json({ error: "Unsupported module" }, { status: 400 });
    }
    const db = await readDb();
    const freshUser = db.users.find((entry) => entry.id === user.id);
    const idea = db.ideas.find((entry) => entry.id === id && entry.userId === user.id);
    if (!freshUser || !idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    if (idea.modules[module] === "locked") {
      return NextResponse.json({ error: "This module is locked. Run the previous journey step first." }, { status: 409 });
    }
    if (!idea.reports[0]) {
      return NextResponse.json({ error: "Run validation first." }, { status: 409 });
    }

    spendCredits(db, user.id, moduleCosts[module], `${module} module`, idea.id);
    const output = createModuleOutput(module, idea);
    idea.moduleOutputs[module] = output;
    idea.modules[module] = "complete";
    for (const next of unlockOrder[module] ?? []) {
      if (idea.modules[next] === "locked") idea.modules[next] = "ready";
    }
    idea.updatedAt = nowIso();
    await writeDb(db);
    return NextResponse.json({ idea, output, user: publicUser(freshUser) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Module generation failed";
    if (message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Yetersiz kredi. Billing sekmesinden kredi yukleyin." }, { status: 402 });
    }
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
