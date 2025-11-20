"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Flame,
  LayoutGrid,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { deleteModuleBooking, fetchModuleBookings } from "@/lib/api";
import { cn, formatDateRange } from "@/lib/utils";
import { BookingSnippet, FacilityKey } from "@/types/api";

type ModuleCard = {
  key: FacilityKey;
  title: string;
  accent: string;
  description: string;
  endpoints: string[];
};

const modules: ModuleCard[] = [
  {
    key: "communal",
    title: "Communal Room",
    accent: "from-primary/80 to-primary/50",
    description: "Slot 1 jam; filter per lantai & penanggung jawab.",
    endpoints: [
      "GET /communal",
      "GET /communal/available-slots/{date}/{lantai}",
      "POST /communal",
      "PUT /communal/{id}",
      "DELETE /communal/{id}",
    ],
  },
  {
    key: "serbaguna",
    title: "Serbaguna",
    accent: "from-primary/60 to-accent/80",
    description: "Perlu data area dari /serbaguna/areas.",
    endpoints: [
      "GET /serbaguna",
      "GET /serbaguna/areas",
      "GET /serbaguna/available-slots/{date}/{areaId}",
      "POST /serbaguna",
      "PUT /serbaguna/{id}",
      "DELETE /serbaguna/{id}",
    ],
  },
  {
    key: "cws",
    title: "CWS",
    accent: "from-accent/80 to-primary/60",
    description: "Daily view + slot 2 jam & mark past done.",
    endpoints: [
      "GET /cws",
      "GET /cws/date/{YYYY-MM-DD}",
      "GET /cws/time-slots?date=",
      "POST /cws",
      "PUT /cws/{id}",
      "POST /cws/mark-past-done",
      "DELETE /cws/{id}",
    ],
  },
  {
    key: "theater",
    title: "Theater",
    accent: "from-primary/70 to-primary/40",
    description: "Gunakan time-suggestions & time-slots.",
    endpoints: [
      "GET /theater",
      "GET /theater/time-slots?date=",
      "POST /theater",
      "PUT /theater/{id}",
      "DELETE /theater/{id}",
    ],
  },
  {
    key: "dapur",
    title: "Dapur",
    accent: "from-accent/60 to-primary/40",
    description: "Fasilitas dapur + time-range reporting.",
    endpoints: [
      "GET /dapur",
      "GET /dapur/facilities",
      "GET /dapur/time-slots?date=&facilityId=",
      "POST /dapur",
      "PUT /dapur/{id}",
      "DELETE /dapur/{id}",
    ],
  },
  {
    key: "mesinCuciCewe",
    title: "Mesin Cuci Cewe",
    accent: "from-primary/60 to-accent/60",
    description: "Struktur endpoint sama dengan cowo.",
    endpoints: [
      "GET /mesin-cuci-cewe",
      "GET /mesin-cuci-cewe/time-slots?date=&facilityId=",
      "POST /mesin-cuci-cewe",
      "PUT /mesin-cuci-cewe/{id}",
      "DELETE /mesin-cuci-cewe/{id}",
    ],
  },
  {
    key: "mesinCuciCowo",
    title: "Mesin Cuci Cowo",
    accent: "from-primary/60 to-accent/60",
    description: "Struktur endpoint sama dengan cewe.",
    endpoints: [
      "GET /mesin-cuci-cowo",
      "GET /mesin-cuci-cowo/time-slots?date=&facilityId=",
      "POST /mesin-cuci-cowo",
      "PUT /mesin-cuci-cowo/{id}",
      "DELETE /mesin-cuci-cowo/{id}",
    ],
  },
];

export default function BookingHub() {
  const [activeKey, setActiveKey] = useState<FacilityKey>("communal");
  const [bookings, setBookings] = useState<BookingSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const activeMeta = useMemo(
    () => modules.find((m) => m.key === activeKey),
    [activeKey],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchModuleBookings(activeKey, { page: 1, limit: 12 });
        setBookings(res.items);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Gagal memuat data booking untuk modul ini.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeKey]);

  const handleDelete = async (id: string, label: string) => {
    const sure = window.confirm(
      `Hapus booking ${label}? Aksi ini memanggil DELETE endpoint sesuai admin.md.`,
    );
    if (!sure) return;
    setStatus(null);
    try {
      await deleteModuleBooking(activeKey, id);
      setBookings((prev) => prev.filter((item) => item.id !== id));
      setStatus("Booking berhasil dihapus.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menghapus booking (perlu akses admin?).";
      setError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="pill text-xs text-primary">Bookings</p>
          <h1 className="text-2xl font-semibold text-foreground">
            Lihat & hapus booking per modul
          </h1>
          <p className="text-sm text-muted-foreground">
            Menggunakan endpoint CRUD dari admin.md/API docs. Pilih modul lalu
            bisa hapus booking melalui tombol Delete.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary"
        >
          <LayoutGrid className="h-4 w-4" />
          Kembali ke dashboard
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {modules.map((module) => {
          const active = module.key === activeKey;
          return (
            <button
              key={module.key}
              type="button"
              onClick={() => setActiveKey(module.key)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition",
                active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
              )}
            >
              {module.title}
            </button>
          );
        })}
      </div>

      {activeMeta ? (
        <div className="card relative overflow-hidden p-5">
          <div
            className={cn(
              "absolute inset-0 opacity-60",
              "bg-gradient-to-br",
              activeMeta.accent,
            )}
          />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {activeMeta.key}
                </p>
                <h3 className="text-xl font-semibold text-foreground">
                  {activeMeta.title}
                </h3>
              </div>
              <span className="pill text-xs text-muted-foreground">
                Endpoint ready
              </span>
            </div>
            <p className="text-sm text-foreground">{activeMeta.description}</p>
            <div className="space-y-2 rounded-lg border border-border bg-black/30 p-3 text-xs text-muted-foreground">
              {activeMeta.endpoints.map((endpoint) => (
                <div key={endpoint} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <code className="text-foreground">{endpoint}</code>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5 text-primary" />
                Time-slot ready
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-primary" />
                Dark vivid style
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Listing booking aktif
              </p>
              <h4 className="text-lg font-semibold text-foreground">
                {activeMeta?.title}
              </h4>
            </div>
          </div>
          <span className="pill text-xs text-muted-foreground">
            GET & DELETE
          </span>
        </div>

        {status ? (
          <div className="mb-3 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
            {status}
          </div>
        ) : null}
        {error ? (
          <div className="mb-3 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-lg border border-border bg-black/30 px-3 py-4 text-sm text-muted-foreground">
            Memuat booking...
          </div>
        ) : null}

        {!loading && !bookings.length ? (
          <div className="rounded-lg border border-border bg-black/30 px-3 py-4 text-sm text-muted-foreground">
            Belum ada booking untuk modul ini.
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          {bookings.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-border bg-black/30 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    {item.module}
                  </p>
                  <h5 className="text-lg font-semibold text-foreground">
                    {item.penanggungJawab || "Penanggung jawab ?"}
                  </h5>
                  <p className="text-xs text-muted-foreground">{item.meta}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleDelete(item.id, item.penanggungJawab || item.id)
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-xs font-semibold text-error transition hover:border-error/70 hover:bg-error/15"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDateRange(item.waktuMulai, item.waktuBerakhir)}{" "}
                {item.status ? `• ${item.status}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="pill">ID: {item.id}</span>
                <span className="pill">DELETE /{item.module}/{item.id}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
