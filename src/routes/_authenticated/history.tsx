import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AiNotice, EmptyState, GhostButton, SectionLabel } from "@/components/ai-ui";
import { toolLabel, useStore } from "@/lib/store";
import type { HistoryTool } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "AI History — Cadence" },
      {
        name: "description",
        content:
          "Every AI output generated in Cadence, with saved items, full inputs and one-click deletion under your control.",
      },
      { property: "og:title", content: "AI History — Cadence" },
      {
        property: "og:description",
        content: "Review, save or delete every AI output produced in your workspace.",
      },
    ],
  }),
  component: HistoryPage,
});

const filters: { key: "all" | HistoryTool | "saved"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "saved", label: "Saved" },
  { key: "email", label: "Emails" },
  { key: "meeting", label: "Meetings" },
  { key: "planner", label: "Schedules" },
  { key: "assistant", label: "Assistant" },
];

function preview(output: unknown) {
  if (!output || typeof output !== "object") return "";
  const data = output as Record<string, unknown>;
  if (typeof data["body"] === "string") return data["body"];
  if (typeof data["summary"] === "string") return data["summary"];
  if (typeof data["text"] === "string") return data["text"];
  if (Array.isArray(data["blocks"])) {
    return (data["blocks"] as { start?: string; end?: string; title?: string }[])
      .map((block) => `${block.start}–${block.end}  ${block.title}`)
      .join("\n");
  }
  return "";
}

function HistoryPage() {
  const { history, toggleSaved, deleteHistory, clearHistory } = useStore();
  const [filter, setFilter] = useState<"all" | HistoryTool | "saved">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const visible = history.filter((item) =>
    filter === "all" ? true : filter === "saved" ? item.saved : item.tool === filter,
  );

  return (
    <AppShell
      title="AI History"
      description="Everything Cadence has generated for you. Save what is useful, delete what is not — nothing leaves your control."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((option) => (
          <button
            key={option.key}
            onClick={() => setFilter(option.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === option.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
        {history.length ? (
          <GhostButton
            className="ml-auto"
            onClick={() => {
              if (confirming === "all") {
                clearHistory();
                setConfirming(null);
                toast.success("History cleared");
              } else {
                setConfirming("all");
                toast("Press again to confirm clearing all history");
              }
            }}
          >
            {confirming === "all" ? "Confirm clear all" : "Clear all"}
          </GhostButton>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          body="Generated emails, meeting summaries, schedules and assistant replies are recorded here automatically."
        />
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <article key={item.id} className="surface-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="label-eyebrow">{toolLabel[item.tool]}</p>
                  <h2 className="mt-1 text-sm font-medium text-pretty">{item.title}</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <GhostButton
                    onClick={() => toggleSaved(item.id)}
                    className={item.saved ? "text-primary" : ""}
                  >
                    <Bookmark className="size-3.5" aria-hidden />
                    {item.saved ? "Saved" : "Save"}
                  </GhostButton>
                  <GhostButton
                    onClick={() => {
                      if (confirming === item.id) {
                        deleteHistory(item.id);
                        setConfirming(null);
                        toast.success("Deleted");
                      } else {
                        setConfirming(item.id);
                        toast("Press again to confirm deletion");
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    {confirming === item.id ? "Confirm" : "Delete"}
                  </GhostButton>
                </div>
              </div>

              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="mt-3 text-xs font-medium text-muted-foreground underline underline-offset-4"
                aria-expanded={expanded === item.id}
              >
                {expanded === item.id ? "Hide output" : "View output"}
              </button>

              {expanded === item.id ? (
                <div className="mt-3 space-y-3">
                  <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Input: </span>
                    {item.input}
                  </p>
                  <pre className="max-h-72 overflow-auto rounded-lg bg-secondary/60 p-3 text-xs leading-relaxed whitespace-pre-wrap">
                    {preview(item.output) || JSON.stringify(item.output, null, 2)}
                  </pre>
                  <AiNotice />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <div className="mt-10">
        <SectionLabel>Storage</SectionLabel>
        <p className="max-w-[62ch] text-pretty text-sm text-muted-foreground">
          History is stored locally in this browser only. Clearing it removes the records
          permanently.
        </p>
      </div>
    </AppShell>
  );
}
