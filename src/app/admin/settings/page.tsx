"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, KeyRound, Save, Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { updatePassword } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function AccountSettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setStatus({ type: "success", msg: "Password berhasil diupdate" });
      setCurrentPassword("");
      setNewPassword("");
      await refreshProfile();
    } catch (err: unknown) {
      setStatus({
        type: "error",
        msg:
          err instanceof Error ? err.message : "Gagal mengupdate password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="pill text-xs text-primary">Account</p>
        <h1 className="text-2xl font-semibold text-foreground">
          Pengaturan akun admin
        </h1>
        <p className="text-sm text-muted-foreground">
          Validasi token tetap mengikuti admin.md — setelah update password,
          token lama masih berlaku sampai expired.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Profil aktif</p>
              <h3 className="text-lg font-semibold text-foreground">
                {user?.namaLengkap || "Anon"}
              </h3>
              <p className="text-xs text-muted-foreground">{user?.nomorWa}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>Angkatan: {user?.angkatan?.namaAngkatan || user?.idAngkatan || "-"}</p>
            <p>Since: {formatDateTime(user?.createdAt)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Ganti password</p>
              <p className="text-xs text-muted-foreground">
                PUT /auth/update-password
              </p>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm text-muted-foreground">Password lama</span>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-black/20 px-3 py-2 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-muted-foreground">Password baru</span>
            <input
              required
              minLength={6}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-black/20 px-3 py-2 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>

          {status ? (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                status.type === "success"
                  ? "border border-primary/40 bg-primary/10 text-primary"
                  : "border border-error/40 bg-error/10 text-error"
              }`}
            >
              {status.msg}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {loading ? "Menyimpan..." : "Simpan password baru"}
          </button>
        </form>
      </div>

      <div className="card p-5 text-sm text-muted-foreground">
        <div className="mb-2 flex items-center gap-2 text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Catatan keamanan
        </div>
        <ul className="list-disc space-y-1 pl-4">
          <li>Gunakan kombinasi minimal 6 karakter.</li>
          <li>Jika token kadaluarsa, login ulang dan dashboard akan mem-probe admin.</li>
          <li>Logout hanya menghapus token di sisi client sesuai admin.md.</li>
        </ul>
      </div>
    </div>
  );
}
