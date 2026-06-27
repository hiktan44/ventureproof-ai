import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VentureProof AI",
  description: "Evidence-first AI startup validation, market research and launch planning platform."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
