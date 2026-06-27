"use client";

import Link from "next/link";
import { BarChart3, Search, Sparkles } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n";

export function MarketingNav() {
  const { t } = useLanguage();

  return (
    <header className="border-b border-line bg-mist/90 backdrop-blur">
      <div className="shell flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">
            <Sparkles size={18} />
          </span>
          VentureProof AI
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold text-ink/75 md:flex">
          <Link href="/features">{t("nav.features")}</Link>
          <Link href="/pricing">{t("nav.pricing")}</Link>
          <Link href="/#tools">{t("nav.tools")}</Link>
          <Link href="/#report">{t("nav.demo")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button className="btn ghost hidden md:inline-flex" aria-label={t("nav.search")}>
            <Search size={16} />
          </button>
          <Link className="btn secondary" href="/auth">
            {t("nav.login")}
          </Link>
          <Link className="btn" href="/auth?mode=signup">
            <BarChart3 size={16} />
            {t("nav.start")}
          </Link>
        </div>
      </div>
    </header>
  );
}
