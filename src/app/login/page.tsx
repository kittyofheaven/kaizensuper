"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();

  const [nomorWa, setNomorWa] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const forbidden = searchParams.get("forbidden");

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const { isAdmin: adminAccess } = await login({ nomorWa, password });
      if (!adminAccess) {
        setError("Akun ini tidak memiliki akses admin.");
        return;
      }
      router.replace("/admin");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Login gagal, coba lagi.",
      );
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
      <div className="mb-10 flex items-center gap-3 rounded-full border border-border/80 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
        <Sparkles className="h-4 w-4 text-accent" />
        Admin Portal · Styled after kaizenfe
      </div>
      <div className="grid w-full gap-6 lg:grid-cols-2">
        <div className="card p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                RTB Connect Admin
              </p>
              <h1 className="text-2xl font-semibold text-foreground">
                Login untuk mulai mengelola
              </h1>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm text-muted-foreground">
                Nomor WhatsApp (gunakan kode negara)
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-black/20 px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <input
                  required
                  value={nomorWa}
                  onChange={(e) => setNomorWa(e.target.value)}
                  placeholder="+6281234567890"
                  className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-muted-foreground">Password</span>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-black/20 px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>

            {error || forbidden ? (
              <div className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
                {forbidden ? "Anda tidak memiliki akses admin." : error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110",
                isLoading ? "opacity-70" : "",
              )}
            >
              {isLoading ? "Memproses..." : "Masuk ke dashboard"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-xs text-muted-foreground">
              Token akan disimpan secara lokal, lalu dashboard akan mem‑probe
              `/users` untuk memastikan akun ini benar-benar admin seperti di
              `admin.md`.
            </p>
          </form>
        </div>

        <div className="card relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
          <div className="relative space-y-4">
            <div className="pill text-xs text-primary">
              Base URL: {API_BASE_URL}
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Alur admin sesuai backend
            </h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li>
                1) Login → simpan token `data.token` + user di local storage.
              </li>
              <li>
                2) Probe admin-only endpoint `/users` → jika 403 redirect kembali
                ke login.
              </li>
              <li>
                3) Layout admin memanggil `/auth/profile` untuk menampilkan info
                akun, serta `/users` dsb untuk data manajemen.
              </li>
            </ol>

            <div className="rounded-xl border border-border bg-black/30 p-4 text-sm leading-relaxed text-foreground">
              <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Admin endpoints
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Login</span>
                  <code className="rounded bg-white/5 px-2 py-1 text-foreground">
                    POST /auth/login
                  </code>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Profile</span>
                  <code className="rounded bg-white/5 px-2 py-1 text-foreground">
                    GET /auth/profile
                  </code>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Admin check</span>
                  <code className="rounded bg-white/5 px-2 py-1 text-foreground">
                    GET /users?page=1&limit=1
                  </code>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Registrasi admin</span>
                  <code className="rounded bg-white/5 px-2 py-1 text-foreground">
                    POST /auth/register
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
