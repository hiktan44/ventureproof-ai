import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "VentureProof AI",
  description: "Kanıt odaklı AI girişim doğrulama, pazar araştırması ve lansman planlama platformu."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
        <script defer src="/site-visit-preference.js" data-site-origin="https://ventureproof.seymata.com" data-context="server" />
      </body>
    </html>
  );
}
