"use client";

import { Activity, Blocks, Database, FileDown, Globe2, LockKeyhole, Users } from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";
import { useLanguage } from "@/lib/i18n";

const features = [
  [Database, "features.evidence", "features.evidenceCopy"],
  [Blocks, "features.modules", "features.modulesCopy"],
  [Activity, "features.board", "features.boardCopy"],
  [Globe2, "features.local", "features.localCopy"],
  [FileDown, "features.exports", "features.exportsCopy"],
  [Users, "features.workspace", "features.workspaceCopy"],
  [LockKeyhole, "features.keys", "features.keysCopy"]
];

export default function FeaturesPage() {
  const { t } = useLanguage();

  return (
    <>
      <MarketingNav />
      <main className="shell py-14">
        <div className="max-w-3xl">
          <p className="font-black uppercase text-moss">{t("features.label")}</p>
          <h1 className="mt-2 text-5xl font-black">{t("features.title")}</h1>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {features.map(([Icon, title, copy]) => {
            const TypedIcon = Icon as typeof Activity;
            return (
              <div key={title as string} className="panel p-6">
                <TypedIcon className="text-ocean" size={26} />
                <h2 className="mt-4 text-xl font-black">{t(title as string)}</h2>
                <p className="mt-2 text-sm leading-6 text-ink/65">{t(copy as string)}</p>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
