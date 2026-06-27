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

const moduleLedgerLabels: Record<Exclude<ModuleKey, "validation">, string> = {
  market: "Pazar Analizi",
  businessPlan: "İş Planı",
  brand: "Marka Stratejisi",
  visual: "Görsel Kimlik",
  marketing: "Pazarlama Paketi"
};

function isGeneratableModule(module: string): module is Exclude<ModuleKey, "validation"> {
  return ["market", "businessPlan", "brand", "visual", "marketing"].includes(module);
}

export async function POST(_request: Request, context: { params: Promise<{ id: string; module: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id, module } = await context.params;
    if (!isGeneratableModule(module)) {
      return NextResponse.json({ error: "Desteklenmeyen modül." }, { status: 400 });
    }
    const db = await readDb();
    const freshUser = db.users.find((entry) => entry.id === user.id);
    const idea = db.ideas.find((entry) => entry.id === id && entry.userId === user.id);
    if (!freshUser || !idea) return NextResponse.json({ error: "Fikir bulunamadı." }, { status: 404 });
    if (idea.modules[module] === "locked") {
      return NextResponse.json({ error: "Bu modül kilitli. Önce önceki yolculuk adımını çalıştırın." }, { status: 409 });
    }
    if (!idea.reports[0]) {
      return NextResponse.json({ error: "Önce doğrulamayı çalıştırın." }, { status: 409 });
    }

    spendCredits(db, user.id, moduleCosts[module], `${moduleLedgerLabels[module]} modülü`, idea.id);
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
    const message = error instanceof Error ? error.message : "Modül üretimi başarısız.";
    if (message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Yetersiz kredi. Ödeme sekmesinden kredi yükleyin veya adminden ücretsiz kredi isteyin." }, { status: 402 });
    }
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
