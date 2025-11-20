"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/admin/settings", label: "Account", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-white/5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    RTB CONNECT
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    Admin Control
                  </p>
                </div>
              </Link>
          <span className="hidden md:inline-flex pill text-xs text-muted-foreground">
            admin-web · app router · dark suite
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-white/10 text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-foreground">
                {user.namaPanggilan || user.namaLengkap}
              </span>
              <span className="text-xs text-muted-foreground">
                {user.nomorWa}
              </span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="md:hidden border-t border-border/60 bg-background/80">
        <div className="flex items-center overflow-x-auto px-4 py-3 gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition whitespace-nowrap",
                  active
                    ? "bg-white/10 text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
