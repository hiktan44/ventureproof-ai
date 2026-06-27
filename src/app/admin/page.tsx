"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeEuro, Coins, Crown, Loader2, Plus, ReceiptText, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  credits: number;
  role: "user" | "admin";
  createdAt: string;
  ideaCount: number;
  ledgerCount: number;
  paidTotal: number;
};

type LedgerEntry = {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  actorUserId?: string;
  createdAt: string;
};

type PaymentRecord = {
  id: string;
  userId: string;
  pack: string;
  credits: number;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  createdAt: string;
};

type AdminOverview = {
  stats: {
    users: number;
    ideas: number;
    creditsIssued: number;
    creditsSpent: number;
    revenue: number;
  };
  users: AdminUser[];
  ledger: LedgerEntry[];
  payments: PaymentRecord[];
};

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [creditAmount, setCreditAmount] = useState(500);
  const [creditReason, setCreditReason] = useState("Admin ücretsiz kredi");
  const [paymentPack, setPaymentPack] = useState("manual");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentCredits, setPaymentCredits] = useState(1000);

  const refresh = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/overview");
    const payload = await response.json();
    if (response.status === 401) {
      router.push("/auth");
      return;
    }
    if (!response.ok) {
      setMessage(payload.error || "Admin yetkisi gerekli.");
      setLoading(false);
      return;
    }
    setData(payload);
    setSelectedUserId((current) => current || payload.users?.[0]?.id || "");
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectedUser = useMemo(() => data?.users.find((user) => user.id === selectedUserId) || data?.users[0], [data, selectedUserId]);
  const users = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!data) return [];
    if (!term) return data.users;
    return data.users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(term));
  }, [data, query]);

  async function patchUser(body: Record<string, unknown>, success: string) {
    setBusy(String(body.action || "save"));
    setMessage("");
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(payload.error || "İşlem tamamlanamadı.");
      return;
    }
    setMessage(success);
    await refresh();
  }

  async function addCredits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) return;
    await patchUser({ action: "addCredits", userId: selectedUser.id, amount: creditAmount, reason: creditReason }, `${selectedUser.email} kullanıcısına ${creditAmount} kredi eklendi.`);
  }

  async function setRole(role: "user" | "admin") {
    if (!selectedUser) return;
    await patchUser({ action: "setRole", userId: selectedUser.id, role }, `${selectedUser.email} rolü ${role} olarak güncellendi.`);
  }

  async function recordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) return;
    await patchUser(
      { action: "recordPayment", userId: selectedUser.id, pack: paymentPack, amount: paymentAmount, credits: paymentCredits, currency: "EUR" },
      `${selectedUser.email} için ödeme kaydı oluşturuldu.`
    );
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-mist">
        <div className="panel flex items-center gap-3 p-6 font-black">
          <Loader2 className="animate-spin" size={18} />
          Admin panel yükleniyor...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mist">
      <header className="sticky top-0 z-20 border-b border-line bg-mist/90 px-5 py-4 backdrop-blur">
        <div className="shell flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn ghost">
              <ArrowLeft size={16} />
              Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-black">Admin Panel</h1>
              <p className="text-sm text-ink/60">Kullanıcı, kredi, ödeme ve yetki yönetimi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button className="btn secondary" onClick={() => refresh()} disabled={busy === "refresh"}>
              <RefreshCcw size={16} />
              Yenile
            </button>
          </div>
        </div>
      </header>

      <div className="shell py-6">
        {message ? <div className="mb-4 rounded-lg border border-coral bg-coral/10 p-3 text-sm font-bold">{message}</div> : null}

        <section className="grid gap-4 md:grid-cols-5">
          <Metric icon={Users} label="Kullanıcı" value={data?.stats.users ?? 0} />
          <Metric icon={ShieldCheck} label="Fikir" value={data?.stats.ideas ?? 0} />
          <Metric icon={Coins} label="Verilen kredi" value={data?.stats.creditsIssued ?? 0} />
          <Metric icon={ReceiptText} label="Harcanan kredi" value={data?.stats.creditsSpent ?? 0} />
          <Metric icon={BadgeEuro} label="Ödenen ücret" value={`EUR ${(data?.stats.revenue ?? 0).toFixed(2)}`} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[360px_1fr]">
          <aside className="panel p-4">
            <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kullanıcı ara..." />
            <div className="mt-4 max-h-[620px] space-y-2 overflow-auto pr-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  className={`w-full rounded-lg border p-3 text-left text-sm ${selectedUser?.id === user.id ? "border-ink bg-mist" : "border-line bg-white"}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-black">{user.name}</div>
                      <div className="mt-0.5 text-xs text-ink/55">{user.email}</div>
                    </div>
                    <span className={`chip ${user.role === "admin" ? "bg-citrus/50" : ""}`}>{user.role}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-ink/60">
                    <span>{user.credits} kredi</span>
                    <span>{user.ideaCount} fikir</span>
                    <span>EUR {user.paidTotal.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {selectedUser ? (
            <div className="grid gap-5">
              <section className="panel p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-moss">Seçili kullanıcı</p>
                    <h2 className="mt-1 text-2xl font-black">{selectedUser.name}</h2>
                    <p className="mt-1 text-sm text-ink/60">{selectedUser.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="chip bg-citrus/50">{selectedUser.credits} kredi</span>
                    <span className="chip">{selectedUser.role}</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  <form className="rounded-lg border border-line bg-white p-4" onSubmit={addCredits}>
                    <h3 className="font-black">Ücretsiz kredi ekle</h3>
                    <input className="field mt-3" type="number" min={1} value={creditAmount} onChange={(event) => setCreditAmount(Number(event.target.value))} />
                    <input className="field mt-3" value={creditReason} onChange={(event) => setCreditReason(event.target.value)} placeholder="Sebep" />
                    <button className="btn mt-3 w-full" disabled={busy === "addCredits"}>
                      <Plus size={16} />
                      Kredi ekle
                    </button>
                  </form>

                  <div className="rounded-lg border border-line bg-white p-4">
                    <h3 className="font-black">Yetki ver / kaldır</h3>
                    <p className="mt-2 text-sm text-ink/60">Admin yetkisi kullanıcı ve kredi yönetimi sağlar.</p>
                    <div className="mt-4 grid gap-2">
                      <button className="btn secondary" disabled={selectedUser.role === "admin" || busy === "setRole"} onClick={() => setRole("admin")}>
                        <Crown size={16} />
                        Admin yap
                      </button>
                      <button className="btn ghost" disabled={selectedUser.role === "user" || busy === "setRole"} onClick={() => setRole("user")}>
                        Standart kullanıcı yap
                      </button>
                    </div>
                  </div>

                  <form className="rounded-lg border border-line bg-white p-4" onSubmit={recordPayment}>
                    <h3 className="font-black">Ödeme kaydı gir</h3>
                    <input className="field mt-3" value={paymentPack} onChange={(event) => setPaymentPack(event.target.value)} placeholder="Paket" />
                    <input className="field mt-3" type="number" min={0} step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(Number(event.target.value))} placeholder="EUR" />
                    <input className="field mt-3" type="number" min={0} value={paymentCredits} onChange={(event) => setPaymentCredits(Number(event.target.value))} placeholder="Kredi" />
                    <button className="btn mt-3 w-full" disabled={busy === "recordPayment"}>
                      <ReceiptText size={16} />
                      Kaydet
                    </button>
                  </form>
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-2">
                <LogTable title="Kullanıcı kredi logları" rows={(data?.ledger ?? []).filter((entry) => entry.userId === selectedUser.id)} users={data?.users ?? []} />
                <PaymentTable rows={(data?.payments ?? []).filter((payment) => payment.userId === selectedUser.id)} />
              </section>
            </div>
          ) : null}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          <LogTable title="Son kredi logları" rows={data?.ledger ?? []} users={data?.users ?? []} />
          <PaymentTable rows={data?.payments ?? []} />
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <div className="panel p-4">
      <Icon className="text-ocean" size={22} />
      <div className="mt-3 text-2xl font-black">{value}</div>
      <div className="mt-1 text-sm text-ink/60">{label}</div>
    </div>
  );
}

function LogTable({ title, rows, users }: { title: string; rows: LedgerEntry[]; users: AdminUser[] }) {
  const emailFor = (id: string) => users.find((user) => user.id === id)?.email || id;
  return (
    <div className="panel p-5">
      <h3 className="font-black">{title}</h3>
      <div className="mt-4 overflow-hidden rounded-lg border border-line">
        {rows.length === 0 ? <div className="bg-white p-4 text-sm text-ink/60">Kayıt yok.</div> : null}
        {rows.slice(0, 30).map((entry) => (
          <div key={entry.id} className="grid gap-2 border-b border-line bg-white p-4 text-sm last:border-0 md:grid-cols-[1fr_auto]">
            <div>
              <div className="font-black">{entry.reason}</div>
              <div className="mt-1 text-xs text-ink/50">
                {emailFor(entry.userId)} • {new Date(entry.createdAt).toLocaleString("tr-TR")}
              </div>
              {entry.actorUserId ? <div className="mt-1 text-xs text-ink/45">İşlemi yapan: {emailFor(entry.actorUserId)}</div> : null}
            </div>
            <div className={entry.amount >= 0 ? "font-black text-moss" : "font-black text-coral"}>{entry.amount >= 0 ? `+${entry.amount}` : entry.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentTable({ rows }: { rows: PaymentRecord[] }) {
  return (
    <div className="panel p-5">
      <h3 className="font-black">Ödeme kayıtları</h3>
      <div className="mt-4 overflow-hidden rounded-lg border border-line">
        {rows.length === 0 ? <div className="bg-white p-4 text-sm text-ink/60">Ödeme kaydı yok.</div> : null}
        {rows.slice(0, 30).map((payment) => (
          <div key={payment.id} className="grid gap-2 border-b border-line bg-white p-4 text-sm last:border-0 md:grid-cols-[1fr_auto]">
            <div>
              <div className="font-black">{payment.pack}</div>
              <div className="mt-1 text-xs text-ink/50">
                {payment.credits} kredi • {payment.provider} • {new Date(payment.createdAt).toLocaleString("tr-TR")}
              </div>
            </div>
            <div className="font-black text-moss">
              {payment.currency} {payment.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

