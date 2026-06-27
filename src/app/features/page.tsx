import { Activity, Blocks, Database, FileDown, Globe2, LockKeyhole, Users } from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";

const features = [
  [Database, "Evidence-first reports", "Every section carries verified, inference or user-provided claim labels."],
  [Blocks, "Founder journey modules", "Validation, market, business plan, brand, identity and marketing outputs."],
  [Activity, "Experiment board", "Convert assumptions into tests with owner, cost, duration and success threshold."],
  [Globe2, "Local market mode", "TR, EU and US context fields are first-class inputs."],
  [FileDown, "Exports", "Report content is structured for PDF, Markdown and investor memo outputs."],
  [Users, "Workspace-ready model", "Data model is ready for teams, agencies and accelerators."],
  [LockKeyhole, "Keyless now, pluggable later", "Mock provider works locally; real AI, billing and auth keys can be added later."]
];

export default function FeaturesPage() {
  return (
    <>
      <MarketingNav />
      <main className="shell py-14">
        <div className="max-w-3xl">
          <p className="font-black uppercase text-moss">Features</p>
          <h1 className="mt-2 text-5xl font-black">Built as a product system, not a prompt wrapper.</h1>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {features.map(([Icon, title, copy]) => {
            const TypedIcon = Icon as typeof Activity;
            return (
              <div key={title as string} className="panel p-6">
                <TypedIcon className="text-ocean" size={26} />
                <h2 className="mt-4 text-xl font-black">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-ink/65">{copy as string}</p>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
