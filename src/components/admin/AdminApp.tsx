"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Palette,
  Search,
  Share2,
  ShieldCheck,
  Type,
} from "lucide-react";
import type { SiteData } from "@/lib/types";
import { Button, Card, Input, Toast } from "./ui";
import ContentTab from "./ContentTab";
import GalleryTab from "./GalleryTab";
import SocialTab from "./SocialTab";
import ThemeTab from "./ThemeTab";
import SeoTab from "./SeoTab";

type Tab = "dashboard" | "content" | "gallery" | "social" | "theme" | "seo" | "security";

type Overview = {
  status: string;
  totalImages: number;
  visibleImages: number;
  activeTheme: string;
  themeMode: string;
  lastUpdate: string | null;
  activity: { id: number; action: string; detail: string; createdAt: string }[];
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "content", label: "Content", icon: <Type className="h-4 w-4" /> },
  { id: "gallery", label: "Gallery", icon: <ImageIcon className="h-4 w-4" /> },
  { id: "social", label: "Socials", icon: <Share2 className="h-4 w-4" /> },
  { id: "theme", label: "Theme & Layout", icon: <Palette className="h-4 w-4" /> },
  { id: "seo", label: "SEO", icon: <Search className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <ShieldCheck className="h-4 w-4" /> },
];

export default function AdminApp() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<SiteData | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2500);
  }, []);

  const reload = useCallback(async () => {
    const [settingsRes, overviewRes] = await Promise.all([
      fetch("/api/admin/settings"),
      fetch("/api/admin/overview"),
    ]);
    if (settingsRes.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (settingsRes.ok) setData(await settingsRes.json());
    if (overviewRes.ok) setOverview(await overviewRes.json());
  }, [router]);

  useEffect(() => {
    reload();
  }, [reload]);

  /** Persists a settings document and refreshes local state. */
  const saveSetting = useCallback(
    async (key: string, value: unknown) => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        showToast("Saved");
        reload();
      } else {
        showToast("Save failed");
      }
      return res.ok;
    },
    [reload, showToast]
  );

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-zinc-800/80 p-5 md:flex">
          <p className="mb-8 px-2 text-lg font-semibold tracking-tight">
            Site<span className="text-amber-400">Studio</span>
          </p>
          <nav aria-label="Admin sections" className="flex-1 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  tab === t.id
                    ? "bg-amber-400/10 text-amber-300"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
          <div className="space-y-1 border-t border-zinc-800/80 pt-4">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
            >
              <ExternalLink className="h-4 w-4" /> View site
            </a>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 p-5 sm:p-8">
          {/* Mobile tab bar */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 md:hidden">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs ${
                  tab === t.id
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                    : "border-zinc-800 text-zinc-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {!data ? (
            <div className="flex h-64 items-center justify-center text-zinc-500">
              Loading…
            </div>
          ) : (
            <>
              {tab === "dashboard" && (
                <Dashboard overview={overview} data={data} />
              )}
              {tab === "content" && (
                <ContentTab
                  content={data.content}
                  onSave={(v) => saveSetting("content", v)}
                />
              )}
              {tab === "gallery" && (
                <GalleryTab showToast={showToast} onChanged={reload} />
              )}
              {tab === "social" && (
                <SocialTab showToast={showToast} onChanged={reload} />
              )}
              {tab === "theme" && (
                <ThemeTab
                  theme={data.theme}
                  layout={data.layout}
                  content={data.content}
                  onSaveTheme={(v) => saveSetting("theme", v)}
                  onSaveLayout={(v) => saveSetting("layout", v)}
                  onSaveContent={(v) => saveSetting("content", v)}
                  showToast={showToast}
                />
              )}
              {tab === "seo" && (
                <SeoTab seo={data.seo} onSave={(v) => saveSetting("seo", v)} />
              )}
              {tab === "security" && <SecurityTab showToast={showToast} />}
            </>
          )}
        </main>
      </div>
      <Toast message={toast} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

function Dashboard({
  overview,
  data,
}: {
  overview: Overview | null;
  data: SiteData;
}) {
  const stats = [
    {
      label: "Website status",
      value: overview ? "Online" : "—",
      accent: true,
    },
    {
      label: "Total images",
      value: overview
        ? `${overview.totalImages} (${overview.visibleImages} visible)`
        : "—",
    },
    { label: "Active theme", value: overview?.activeTheme ?? "—" },
    {
      label: "Last update",
      value: overview?.lastUpdate
        ? new Date(overview.lastUpdate).toLocaleString()
        : "Never",
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Overview of {data.content.name}&apos;s website.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              {s.label}
            </p>
            <p
              className={`mt-2 text-lg font-semibold ${
                s.accent ? "text-emerald-400" : "text-zinc-100"
              }`}
            >
              {s.accent && (
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400 align-middle" />
              )}
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <Card title="Recent activity">
        {!overview || overview.activity.length === 0 ? (
          <p className="text-sm text-zinc-500">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-800/80">
            {overview.activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3 text-sm">
                <Activity className="h-4 w-4 shrink-0 text-amber-400/70" />
                <span className="text-zinc-200">{a.action}</span>
                {a.detail && <span className="text-zinc-500">{a.detail}</span>}
                <span className="ml-auto shrink-0 text-xs text-zinc-500">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

function SecurityTab({ showToast }: { showToast: (m: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="max-w-lg space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Sessions expire after 12 hours. Login is rate-limited and all admin
          actions are logged.
        </p>
      </header>

      <Card title="Credentials">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-zinc-400">
            Admin credentials are read from environment variables
            <code className="mx-1 rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">ADMIN_USERNAME</code>
            and
            <code className="mx-1 rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">ADMIN_PASSWORD</code>.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Set them in your
            <code className="mx-1 rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">.env.local</code>
            file (or <code className="mx-1 rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">.env</code>).
            Defaults: <code className="text-zinc-300">admin</code> / <code className="text-zinc-300">admin123</code>.
          </p>
          <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-mono text-zinc-500"># .env.local</p>
            <p className="text-xs font-mono text-emerald-400">ADMIN_USERNAME=admin</p>
            <p className="text-xs font-mono text-emerald-400">ADMIN_PASSWORD=your-strong-password</p>
          </div>
        </div>
      </Card>

      <Card title="Test credentials">
        <div className="space-y-4">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            disabled={busy || !password}
            onClick={async () => {
              setBusy(true);
              const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
              });
              setBusy(false);
              if (res.ok) showToast("Credentials are valid ✓");
              else showToast("Invalid credentials");
            }}
          >
            {busy ? "Testing…" : "Test login"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
