"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  SlidersHorizontal,
  Users as UsersIcon,
} from "lucide-react";
import { fetchUsers } from "@/lib/api";
import { cn, formatDateTime } from "@/lib/utils";
import { Pagination, User } from "@/types/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState({ searchWa: "", angkatan: "" });
  const [draftFilters, setDraftFilters] = useState({
    searchWa: "",
    angkatan: "",
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchUsers({
          page,
          limit: 8,
          sortBy: "namaLengkap",
          sortOrder: "asc",
          searchWa: filters.searchWa || undefined,
          angkatanId: filters.angkatan || undefined,
        });

        setUsers(res.data || []);
        setPagination(
          res.pagination || {
            page,
            limit: 8,
            total: res.data?.length || 0,
            totalPages: 1,
          },
        );
        setError(null);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat user",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filters, page]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setFilters({
      searchWa: draftFilters.searchWa.trim(),
      angkatan: draftFilters.angkatan.trim(),
    });
  };

  const handleReset = () => {
    setDraftFilters({ searchWa: "", angkatan: "" });
    setFilters({ searchWa: "", angkatan: "" });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="pill text-xs text-primary">Users</p>
          <h1 className="text-2xl font-semibold text-foreground">
            Manajemen user
          </h1>
          <p className="text-sm text-muted-foreground">
            CRUD user admin pakai `/users` dan `/auth/register` (protected
            admin).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFilters({ ...filters })}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card flex flex-col gap-3 p-5 md:flex-row md:items-end md:justify-between"
      >
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filter & Search
          </p>
          <p className="text-xs text-muted-foreground">
            Cari by WhatsApp: GET /users/wa/{`{nomorWa}`} atau filter by
            angkatan.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-black/20 px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={draftFilters.searchWa}
              onChange={(e) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  searchWa: e.target.value,
                }))
              }
              placeholder="Cari nomor WA (+62...)"
              className="w-48 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-black/20 px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Angkatan
            </span>
            <input
              value={draftFilters.angkatan}
              onChange={(e) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  angkatan: e.target.value,
                }))
              }
              placeholder="ID angkatan (opsional)"
              className="w-44 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Terapkan
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition hover:border-primary"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {error ? (
        <div className="rounded-lg border border-error/40 bg-error/10 px-3 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <UsersIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Daftar user</p>
              <h4 className="text-lg font-semibold text-foreground">
                {loading ? "Memuat..." : `${users.length} user`}
              </h4>
            </div>
          </div>
          <span className="pill text-xs text-muted-foreground">
            GET /users
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-lg border border-border bg-black/30 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    {user.angkatan?.namaAngkatan || `ID ${user.idAngkatan || "-"}`}
                  </p>
                  <h5 className="text-lg font-semibold text-foreground">
                    {user.namaLengkap}
                  </h5>
                  {user.namaPanggilan ? (
                    <p className="text-xs text-muted-foreground">
                      {user.namaPanggilan}
                    </p>
                  ) : null}
                </div>
                <span className="pill text-xs text-muted-foreground">
                  {user.id}
                </span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>
                  WA: <span className="text-foreground">{user.nomorWa}</span>
                </p>
                <p>
                  Ditambahkan: {formatDateTime(user.createdAt)}
                  {user.updatedAt
                    ? ` • update ${formatDateTime(user.updatedAt)}`
                    : ""}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="pill">GET /users/{user.id}</span>
                <span className="pill">PUT /users/{user.id}</span>
                <span className="pill">DELETE /users/{user.id}</span>
              </div>
            </article>
          ))}
        </div>

        {!loading && !users.length ? (
          <p className="rounded-lg border border-border bg-black/30 px-3 py-3 text-center text-sm text-muted-foreground">
            Tidak ada user untuk filter ini.
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Page {pagination?.page ?? page} dari {pagination?.totalPages ?? 1} •
            Total {pagination?.total ?? users.length} user
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={(pagination?.page ?? page) <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className={cn(
                "rounded-lg border border-border px-3 py-2 transition",
                (pagination?.page ?? page) <= 1
                  ? "opacity-50"
                  : "hover:border-primary",
              )}
            >
              Prev
            </button>
            <button
              type="button"
              disabled={
                pagination
                  ? pagination.page >= pagination.totalPages
                  : false
              }
              onClick={() =>
                setPage((prev) =>
                  pagination
                    ? Math.min(pagination.totalPages, prev + 1)
                    : prev + 1,
                )
              }
              className={cn(
                "rounded-lg border border-border px-3 py-2 transition",
                pagination && pagination.page >= pagination.totalPages
                  ? "opacity-50"
                  : "hover:border-primary",
              )}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
