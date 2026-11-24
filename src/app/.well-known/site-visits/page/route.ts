import { createVisitHandler } from "@/lib/site-visit-request";
import { visitorStore } from "@/lib/site-visits/store.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = createVisitHandler(async (day, id) => visitorStore().record(day, id, Date.now()));
