
const automated = /bot|crawler|spider|headless|health.?check|uptime|monitor|lighthouse|preview|curl|wget|python-requests/i;
const host = "ventureproof.seymata.com";
const maxBytes = 160;
const dayFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
});
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

// Check the actual stream limit too, including requests without Content-Length.
async function readPayload(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const buffer = new Uint8Array(maxBytes);
  let used = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, used)));
      if (used + value.byteLength > maxBytes) {
        await reader.cancel();
        return null;
      }
      buffer.set(value, used);
      used += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }
}

type Store = (day: string, browserId: string) => Promise<boolean>;

export function createVisitHandler(store: Store, now = Date.now) {
  // A site-wide, process-local budget avoids storing addresses or fingerprinting.
  let resetAt = 0, requests = 0;
  const result = (status: number) => new Response(null, {
    status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
  return async function handle(request: Request) {
    const url = new URL(request.url);
    const headers = request.headers;
    if (url.search || url.pathname !== "/.well-known/site-visits/page") return result(404);
    if (request.method !== "POST") return result(405);
    if (headers.get("host")?.toLowerCase() !== host || headers.get("origin") !== "https://" + host ||
        headers.get("sec-fetch-site") !== "same-origin" || headers.get("sec-fetch-mode") !== "same-origin") return result(403);
    const ua = headers.get("user-agent");
    if (!ua || automated.test(ua) || headers.get("sec-gpc") === "1" || headers.get("dnt") === "1") return result(204);
    if (headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return result(415);
    if (Number(headers.get("content-length")) > maxBytes) return result(413);
    const clock = now();
    if (clock >= resetAt) { resetAt = clock + 60_000; requests = 0; }
    if (++requests > 1200) return result(429);
    let data;
    try { data = await readPayload(request); } catch { return result(400); }
    if (!data || Object.keys(data).sort().join(",") !== "day,id" || data.day !== dayFormat.format(clock) ||
        typeof data.id !== "string" || !uuid.test(data.id)) return result(400);
    const browserId = data.id.toLowerCase();
    try { return result(await store(data.day, browserId) ? 204 : 400); }
    catch { return result(503); }
  };
}
