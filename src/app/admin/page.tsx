"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  LucideIcon,
  Radar,
  Users,
} from "lucide-react";
import { API_BASE_URL, fetchDashboardSummary } from "@/lib/api";
import { cn, formatDateRange } from "@/lib/utils";
import { DashboardSummary, FacilityKey } from "@/types/api";

type FacilityMeta = {
  key: FacilityKey;
  label: string;
  accent: string;
  description: string;
};

const facilities: FacilityMeta[] = [
  {
    key: "communal",
    label: "Communal Room",
    accent: "from-primary to-primary/60",
    description: "Slot 1 jam per lantai, gunakan /available-slots/{date}/{lantai}",
  },
  {
    key: "serbaguna",
    label: "Serbaguna",
    accent: "from-primary/70 to-accent",
    description: "Per-area; tarik data area via /serbaguna/areas",
  },
  {
    key: "cws",
    label: "CWS",
    accent: "from-accent to-primary/70",
    description: "Slot 2 jam, booking harian /cws/date/{YYYY-MM-DD}",
  },
  {
    key: "theater",
    label: "Theater",
    accent: "from-primary to-primary/40",
    description: "Cek ketersediaan dengan /theater/time-slots",
  },
  {
    key: "dapur",
    label: "Dapur",
    accent: "from-accent to-accent/60",
    description: "Fasilitas detail lewat /dapur/facilities",
  },
  {
    key: "mesinCuciCewe",
    label: "Mesin Cuci Cewe",
    accent: "from-primary/60 to-accent",
    description: "Use /mesin-cuci-cewe/time-slots?date=&facilityId",
  },
  {
    key: "mesinCuciCowo",
    label: "Mesin Cuci Cowo",
    accent: "from-primary/60 to-accent",
    description: "Use /mesin-cuci-cowo/time-slots?date=&facilityId",
  },
];

const emptySummary: DashboardSummary = {
  userCount: 0,
  bookingTotals: {
    communal: 0,
    serbaguna: 0,
    cws: 0,
    theater: 0,
    dapur: 0,
    mesinCuciCewe: 0,
    mesinCuciCowo: 0,
  },
  latest: [],
  baseUrl: API_BASE_URL,
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchDashboardSummary();
        setSummary(result);
        setError(null);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Tidak bisa mengambil ringkasan. Pastikan token admin tersedia.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="card relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/15" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="pill text-xs text-primary">Admin Dashboard</p>
            <h1 className="text-3xl font-semibold text-foreground">
              Kontrol penuh user & booking fasilitas
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Warna dan nuansa mengikuti kaizenfe—namun layout dipisah untuk
              admin saja. Semua data diambil dari API yang dirinci di
              admin.md/API_DOCUMENTATION.md.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-muted-foreground">
            <Radar className="h-4 w-4 text-primary" />
            Endpoint base:{" "}
            <span className="text-foreground">{summary.baseUrl}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          title="Total Users"
          value={summary.userCount}
          hint="GET /users?page=1&limit=1 → pagination.total"
        />
        <StatCard
          icon={CalendarClock}
          title="Booking aktif (sum)"
          value={Object.values(summary.bookingTotals).reduce(
            (acc, val) => acc + (val || 0),
            0,
          )}
          hint="Aggregated dari semua modul booking"
        />
        <StatCard
          icon={Activity}
          title="Admin Probe"
          value={summary.userCount > 0 ? "200 OK" : "Awaiting"}
          hint="Access ditentukan oleh GET /users"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {facilities.map((facility) => (
              <FacilityCard
                key={facility.key}
                meta={facility}
                total={summary.bookingTotals[facility.key] || 0}
              />
            ))}
          </div>
          <LatestBookings
            loading={loading}
            error={error}
            items={summary.latest}
          />
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CalendarClock className="h-5 w-5 text-primary" />
              Ringkasan Hari Ini
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Gunakan endpoint date/time-range untuk menampilkan slot hari ini
              (CWS, dapur, mesin cuci). Komponen ini siap diisi data tersebut.
            </p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-lg border border-border bg-black/30 px-3 py-2">
                CWS → <code className="text-primary">/cws/date/YYYY-MM-DD</code>
              </div>
              <div className="rounded-lg border border-border bg-black/30 px-3 py-2">
                Dapur →{" "}
                <code className="text-primary">/dapur/time-range</code>
              </div>
              <div className="rounded-lg border border-border bg-black/30 px-3 py-2">
                Mesin cuci →{" "}
                <code className="text-primary">
                  /mesin-cuci-cewe/time-range
                </code>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-lg font-semibold text-foreground">
              playbook admin.md
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              1) Login → simpan token; 2) Probe admin `/users`; 3) CRUD user &
              booking sesuai modul; 4) Gunakan endpoint time-slots untuk builder
              jadwal.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              Referensi: file admin.md & API_DOCUMENTATION.md di root repo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-semibold text-foreground">{value}</h3>
          </div>
        </div>
      </div>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function FacilityCard({
  meta,
  total,
}: {
  meta: FacilityMeta;
  total: number;
}) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div
        className={cn(
          "absolute inset-0 opacity-60",
          "bg-gradient-to-br",
          meta.accent,
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {meta.label}
          </p>
          <h4 className="text-3xl font-semibold text-foreground">{total}</h4>
          <p className="text-xs text-muted-foreground">{meta.description}</p>
        </div>
        <span className="pill text-xs text-foreground">/{meta.key}</span>
      </div>
    </div>
  );
}

function LatestBookings({
  loading,
  error,
  items,
}: {
  loading: boolean;
  error: string | null;
  items: DashboardSummary["latest"];
}) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Terbaru</p>
          <h3 className="text-lg font-semibold text-foreground">
            Booking feed
          </h3>
        </div>
        <span className="pill text-xs text-muted-foreground">
          Live from API
        </span>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-black/30 px-3 py-4 text-sm text-muted-foreground">
          Memuat data terbaru...
        </div>
      ) : null}

      {error && !loading ? (
        <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {!loading && !items.length ? (
        <div className="rounded-lg border border-border bg-black/30 px-3 py-4 text-sm text-muted-foreground">
          Belum ada booking yang bisa ditampilkan.
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.module}-${item.id}`}
            className="rounded-lg border border-border bg-black/30 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <CalendarClock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.penanggungJawab || "Penanggung jawab?"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.module}
                  </p>
                </div>
              </div>
              <span className="pill text-xs text-muted-foreground">
                {item.meta || "–"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDateRange(item.waktuMulai, item.waktuBerakhir)}{" "}
              {item.status ? `• ${item.status}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
