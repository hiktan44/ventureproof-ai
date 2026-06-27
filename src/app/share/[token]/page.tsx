import { notFound } from "next/navigation";
import { SharedReportView } from "@/components/SharedReportView";
import { readDb } from "@/lib/db";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = await readDb();
  const link = db.shareLinks.find((entry) => entry.token === token);
  const idea = link ? db.ideas.find((entry) => entry.id === link.ideaId) : null;
  const report = idea?.reports[0];
  if (!idea || !report) notFound();

  return <SharedReportView idea={idea} report={report} />;
}
