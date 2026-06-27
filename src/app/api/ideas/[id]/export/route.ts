import { NextResponse } from "next/server";
import { readDb, requireCurrentUser } from "@/lib/db";
import { createReportDocx, createReportPdf, slugifyFileName } from "@/lib/report-export";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await context.params;
    const url = new URL(request.url);
    const format = url.searchParams.get("format") === "docx" ? "docx" : "pdf";
    const db = await readDb();
    const idea = db.ideas.find((entry) => entry.id === id && entry.userId === user.id);
    const report = idea?.reports[0];

    if (!idea || !report) {
      return NextResponse.json({ error: "Dışa aktarılacak rapor bulunamadı." }, { status: 404 });
    }

    const fileBase = `${slugifyFileName(idea.title)}-ventureproof-raporu`;
    const buffer = format === "docx" ? await createReportDocx({ idea, report }) : await createReportPdf({ idea, report });
    const contentType =
      format === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileBase}.${format}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dışa aktarım başarısız.";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
