import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, FileText, Mail, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AiNotice, SectionLabel } from "@/components/ai-ui";
import { useStore, toolLabel } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Cadence — AI Workplace Productivity Dashboard" },
      {
        name: "description",
        content:
          "Cadence is an integrated AI workspace: draft emails, summarise meeting notes, and build realistic daily schedules in one dashboard.",
      },
      { property: "og:title", content: "Cadence — AI Workplace Productivity Dashboard" },
      {
        property: "og:description",
        content:
          "One AI workspace for email drafting, meeting summaries, action items and smart scheduling.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { to: "/email", label: "Emails", icon: Mail },
  { to: "/meetings", label: "Notes", icon: FileText },
  { to: "/planner", label: "Planner", icon: CalendarClock },
] as const;

function Dashboard() {
  const { tasks, history, profile, toggleTask, hydrated } = useStore();
  const open = tasks.filter((task) => !task.done);
  const highPriority = open.filter((task) => task.priority === "high");
  const withDeadlines = open.filter((task) => task.due);
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const suggestion = highPriority.length
    ? `Protect a 90-minute focus block for "${highPriority[0]?.title}" before midday.`
    : open.length
      ? "Group your remaining tasks into one afternoon block to avoid context switching."
      : "Nothing is queued. Use the Task Planner to shape tomorrow before the day starts.";

  return (
    <AppShell
      title={`Welcome back, ${profile.name}.`}
      description="Your workspace is ready. Draft communication, process meeting notes and plan the day from one place."
    >
      <p className="label-eyebrow -mt-6 mb-8">{today}</p>

      <section className="mb-10">
        <SectionLabel>Core utilities</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          {tools.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-secondary outline-1 -outline-offset-1 outline-black/5 transition-transform active:scale-95 sm:aspect-[2/1]"
            >
              <tool.icon className="size-5 text-primary" aria-hidden />
              <span className="text-[11px] font-medium">{tool.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-card">
          <span className="inline-block rounded-full bg-primary-foreground/10 px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase">
            Productivity suggestion
          </span>
          <h3 className="mt-3 mb-2 text-lg leading-snug font-medium text-balance">{suggestion}</h3>
          <p className="mb-4 max-w-[56ch] text-sm text-pretty text-primary-foreground/70">
            Based on {open.length} open task{open.length === 1 ? "" : "s"} and{" "}
            {highPriority.length} marked high priority.
          </p>
          <Link
            to="/planner"
            className="block w-full rounded-lg bg-primary-foreground py-2 text-center text-sm font-medium text-primary active:opacity-90"
          >
            Build today's schedule
          </Link>
          <AiNotice className="mt-3 text-primary-foreground/70" />
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <SectionLabel>Today&apos;s tasks</SectionLabel>
          <div className="space-y-3">
            {!hydrated ? (
              <div className="h-16 animate-pulse rounded-xl bg-secondary" />
            ) : open.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                No open tasks. Add some in the Task Planner.
              </p>
            ) : (
              open.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 rounded-xl bg-secondary/60 p-4 outline-1 -outline-offset-1 outline-black/5"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} complete`}
                    className="size-5 shrink-0 rounded-full border-2 border-muted-foreground/40 transition-colors hover:border-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {task.due ?? "No deadline"} · {task.priority} priority
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <SectionLabel>Upcoming deadlines</SectionLabel>
          <div className="surface-card mb-8 divide-y divide-border p-2">
            {withDeadlines.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">Nothing scheduled yet.</p>
            ) : (
              withDeadlines.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <p className="text-sm">{task.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{task.due}</span>
                </div>
              ))
            )}
          </div>

          <SectionLabel>Recent AI activity</SectionLabel>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                Nothing yet. Generated emails, summaries and schedules appear here.
              </p>
            ) : (
              history.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  to="/history"
                  className="flex items-center gap-3 rounded-xl bg-secondary/60 px-4 py-3 outline-1 -outline-offset-1 outline-black/5"
                >
                  <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {toolLabel[item.tool]} ·{" "}
                      {new Date(item.createdAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <footer className="mt-16 border-t border-border pt-8">
        <p className="mx-auto max-w-[52ch] text-center text-[11px] leading-relaxed text-balance text-muted-foreground">
          Cadence uses large language models to assist your work. Human oversight is required for
          accuracy, privacy and bias.{" "}
          <Link to="/settings" className="underline underline-offset-2">
            Read the Responsible AI notice
          </Link>
          .
        </p>
      </footer>
    </AppShell>
  );
}
