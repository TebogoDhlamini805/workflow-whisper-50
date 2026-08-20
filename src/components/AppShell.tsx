import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarClock,
  FileText,
  History,
  LayoutDashboard,
  Mail,
  Settings,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

const navItems = [
  { to: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { to: "/assistant", label: "AI Assistant", short: "Assist", icon: Sparkles },
  { to: "/email", label: "Email Generator", short: "Email", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", short: "Notes", icon: FileText },
  { to: "/planner", label: "Task Planner", short: "Plan", icon: CalendarClock },
  { to: "/history", label: "AI History", short: "History", icon: History },
  { to: "/settings", label: "Settings", short: "Settings", icon: Settings },
] as const;

const mobileNav = navItems.filter((item) =>
  ["/", "/assistant", "/email", "/planner", "/history"].includes(item.to),
);

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { profile } = useStore();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="size-4 text-primary-foreground" aria-hidden />
          </div>
          <div>
            <p className="font-serif text-lg leading-none">Cadence</p>
            <p className="text-[11px] text-muted-foreground">Workplace AI</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-xl bg-secondary p-3">
          <p className="text-sm font-medium">{profile.name}</p>
          <p className="text-xs text-muted-foreground">{profile.role}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-5 py-3 backdrop-blur-md lg:px-10">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-4 text-primary-foreground" aria-hidden />
            </div>
            <span className="font-serif text-lg leading-none">Cadence</span>
          </div>
          <p className="hidden label-eyebrow lg:block">{title}</p>
          <Link
            to="/settings"
            className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-medium ring-1 ring-black/5"
            aria-label="Open settings"
          >
            {profile.name.slice(0, 1).toUpperCase()}
          </Link>
        </header>

        <main className="mx-auto w-full max-w-5xl px-5 pt-8 pb-28 lg:px-10 lg:pb-16">
          <div className="mb-8">
            <h1 className="text-3xl leading-tight font-medium text-balance">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-[62ch] text-pretty text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between border-t border-border bg-background/90 px-5 py-2.5 backdrop-blur-md lg:hidden"
        aria-label="Mobile navigation"
      >
        {mobileNav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="size-5" aria-hidden />
              <span className="text-[10px] font-medium">{item.short}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
