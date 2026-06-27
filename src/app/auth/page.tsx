"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, Sparkles } from "lucide-react";

export default function AuthPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-mist">Loading auth...</main>}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState(searchParams.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const idea = searchParams.get("idea") || "";

  const title = useMemo(() => (mode === "signup" ? "Create account" : "Welcome back"), [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const response = await fetch(`/api/auth/${mode === "signup" ? "signup" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Islem tamamlanamadi.");
      return;
    }
    const next = idea ? `/dashboard?idea=${encodeURIComponent(idea)}` : "/dashboard";
    router.push(next);
  }

  return (
    <main className="grid min-h-screen bg-mist lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex flex-col justify-between bg-ink p-8 text-white">
        <Link href="/" className="flex items-center gap-2 font-black">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-citrus text-ink">
            <Sparkles size={18} />
          </span>
          VentureProof AI
        </Link>
        <div className="max-w-xl py-16">
          <p className="text-sm font-black uppercase text-citrus">Founder workspace</p>
          <h1 className="mt-3 text-5xl font-black leading-tight">Evidence, experiments and launch assets in one dashboard.</h1>
          <p className="mt-5 leading-7 text-white/70">
            Signup includes 100 credits. Production keys for AI, billing and OAuth can be connected after deployment.
          </p>
        </div>
        <div className="text-sm text-white/50">No card required for the local MVP.</div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="panel p-6 shadow-soft">
            <h2 className="text-3xl font-black">{title}</h2>
            <p className="mt-2 text-sm text-ink/60">{mode === "signup" ? "Start validating with 100 credits." : "Continue your validation journey."}</p>
            <div className="mt-6 grid grid-cols-2 rounded-lg border border-line bg-white p-1">
              <button className={`rounded-md py-2 text-sm font-black ${mode === "login" ? "bg-ink text-white" : ""}`} onClick={() => setMode("login")}>
                Sign In
              </button>
              <button className={`rounded-md py-2 text-sm font-black ${mode === "signup" ? "bg-ink text-white" : ""}`} onClick={() => setMode("signup")}>
                Sign Up
              </button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="text-sm font-bold">Email</span>
                <input className="field mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required />
              </label>
              <label className="block">
                <span className="text-sm font-bold">Password</span>
                <div className="mt-2 flex rounded-lg border border-line bg-white focus-within:border-ocean focus-within:ring-4 focus-within:ring-ocean/20">
                  <input
                    className="w-full rounded-lg border-0 bg-transparent px-3 py-3 outline-none"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={mode === "signup" ? "Create a password" : "Your password"}
                    required
                  />
                  <button type="button" className="px-3" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password">
                    <Eye size={18} />
                  </button>
                </div>
              </label>
              {error ? <div className="rounded-lg border border-coral bg-coral/10 p-3 text-sm font-bold text-ink">{error}</div> : null}
              <button className="btn w-full" disabled={loading} type="submit">
                {loading ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
                <ArrowRight size={16} />
              </button>
            </form>
            <p className="mt-5 text-xs leading-5 text-ink/55">
              By continuing you accept local MVP terms. Google OAuth placeholder is intentionally disabled until keys are added.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
