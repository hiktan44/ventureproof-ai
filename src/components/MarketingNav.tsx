import Link from "next/link";
import { BarChart3, Search, Sparkles } from "lucide-react";

export function MarketingNav() {
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
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/#tools">Free Tools</Link>
          <Link href="/#report">Demo Report</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button className="btn ghost hidden md:inline-flex" aria-label="Search">
            <Search size={16} />
          </button>
          <Link className="btn secondary" href="/auth">
            Login
          </Link>
          <Link className="btn" href="/auth?mode=signup">
            <BarChart3 size={16} />
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
