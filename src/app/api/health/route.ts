import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json({
      ok: true,
      service: "ventureproof-ai",
      users: db.users.length,
      ideas: db.ideas.length,
      time: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "ventureproof-ai",
        error: error instanceof Error ? error.message : "unknown"
      },
      { status: 500 }
    );
  }
}
