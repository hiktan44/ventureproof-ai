"use client";

import { useLanguage, type Language } from "@/lib/i18n";

const languages: Language[] = ["tr", "en"];

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex rounded-lg border border-line bg-white p-1" aria-label="Language selector">
      {languages.map((entry) => (
        <button
          key={entry}
          type="button"
          className={`rounded-md px-2.5 py-1.5 text-xs font-black ${language === entry ? "bg-ink text-white" : "text-ink/60"}`}
          onClick={() => setLanguage(entry)}
          aria-pressed={language === entry}
        >
          {t(`language.${entry}`)}
        </button>
      ))}
    </div>
  );
}

