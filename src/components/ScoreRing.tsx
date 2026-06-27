"use client";

import { useLanguage } from "@/lib/i18n";

export function ScoreRing({ value, label }: { value: number; label: string }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3">
      <div className="score-ring grid h-20 w-20 place-items-center rounded-full" style={{ "--score": value } as React.CSSProperties}>
        <div className="text-xl font-black">{value}</div>
      </div>
      <div>
        <div className="text-sm font-black uppercase text-moss">{label}</div>
        <div className="text-sm text-ink/65">{t("score.caption")}</div>
      </div>
    </div>
  );
}
