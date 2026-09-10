"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NAV_GROUPS, NAV_ITEMS } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading Athachi Farms FMS…
      </div>
    );
  }

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (!item.permission) return true;
      const required = Array.isArray(item.permission) ? item.permission : [item.permission];
      return required.some((p) => hasPermission(p));
    }),
  })).filter((group) => group.items.length > 0);

  // Some hrefs are prefixes of others (e.g. "/workforce" vs "/workforce/departments") — only the
  // longest matching href should render active, so a sub-page doesn't also light up its parent.
  const activeHref = NAV_ITEMS
    .filter((item) => pathname === item.href || pathname?.startsWith(item.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r bg-card transition-transform lg:static lg:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            AF
          </div>
          <span className="font-semibold">Athachi Farms</span>
          <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-3 overflow-y-auto p-2" style={{ height: "calc(100vh - 3.5rem)" }}>
          {groups.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {group.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = item.href === activeHref;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {!item.built && <span className="ml-auto text-[10px] opacity-60">soon</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right text-sm leading-tight">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.roles.join(", ")}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
