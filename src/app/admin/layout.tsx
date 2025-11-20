"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/layout/AdminNav";
import { useAuth } from "@/contexts/auth-context";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isReady, isLoading } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (isAdmin === false) {
      router.replace("/login?forbidden=1");
    }
  }, [isAdmin, isAuthenticated, isReady, router]);

  if (!isReady || isLoading || (isAuthenticated && isAdmin === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">{children}</main>
    </div>
  );
}
