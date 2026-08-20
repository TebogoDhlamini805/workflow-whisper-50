import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  AiNotice,
  CopyButton,
  EmptyState,
  ErrorState,
  Field,
  LoadingCard,
  PrimaryButton,
  PromptInspector,
  RegenerateButton,
  SaveButton,
  SectionLabel,
  TextArea,
} from "@/components/ai-ui";
import { summarizeMeeting } from "@/lib/ai.functions";
import { meetingPrompt } from "@/lib/prompts";
import { useStore } from "@/lib/store";
import type { MeetingResult } from "@/lib/types";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Cadence" },
      {
        name: "description",
        content:
          "Paste raw meeting notes and get a summary, key points, decisions, action items, owners and deadlines you can turn into tasks.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Cadence" },
      {
        property: "og:description",
        content: "Turn messy meeting notes into decisions, owners, deadlines and tracked tasks.",
      },
    ],
  }),
  component: MeetingsPage,
});

function List({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-5">
      <h3 className="label-eyebrow mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-sm text-pretty">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MeetingsPage() {
  const runSummarize = useServerFn(summarizeMeeting);
  const navigate = useNavigate();
  const { addHistory, addTasks, toggleSaved, history } = useStore();

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [converted, setConverted] = useState(false);

  const saved = history.find((item) => item.id === historyId)?.saved ?? false;
  const prompt = meetingPrompt(notes || "…");

  async function run() {
    if (notes.trim().length < 30) {
      toast.error("Paste at least a few lines of meeting notes.");
      return;
    }
    setLoading(true);
    setError(null);
    setConverted(false);
    try {
      const output = await runSummarize({ data: { notes } });
      setResult(output);
      setSelected(Object.fromEntries((output.actionItems ?? []).map((_, index) => [index, true])));
      setHistoryId(
        addHistory({
          tool: "meeting",
          title: output.summary?.slice(0, 60) || "Meeting summary",
          saved: false,
          input: notes.slice(0, 200),
          output,
        }),
      );
      toast.success("Notes processed — review before saving");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The AI request failed.");
    } finally {
      setLoading(false);
    }
  }

  function convert() {
    const items = (result?.actionItems ?? []).filter((_, index) => selected[index]);
    if (!items.length) {
      toast.error("Select at least one action item.");
      return;
    }
    addTasks(
      items.map((item) => ({
        title: item.task,
        due: item.deadline || undefined,
        priority: item.priority ?? "medium",
        owner: item.owner || undefined,
        source: "meeting" as const,
      })),
    );
    setConverted(true);
    toast.success(`${items.length} task${items.length === 1 ? "" : "s"} added to your workspace`);
  }

  const plainText = result
    ? [
        `SUMMARY\n${result.summary}`,
        `KEY POINTS\n${(result.keyPoints ?? []).map((point) => `- ${point}`).join("\n")}`,
        `DECISIONS\n${(result.decisions ?? []).map((item) => `- ${item}`).join("\n")}`,
        `ACTION ITEMS\n${(result.actionItems ?? [])
          .map((item) => `- ${item.task}${item.owner ? ` (${item.owner})` : ""}${item.deadline ? ` — ${item.deadline}` : ""}`)
          .join("\n")}`,
      ].join("\n\n")
    : "";

  return (
    <AppShell
      title="Meeting Summarizer"
      description="Paste raw notes from a meeting. Cadence extracts what was decided, who owns what and when it is due."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <SectionLabel>Input</SectionLabel>
          <Field label="Raw meeting notes" hint="Bullet points, transcripts or messy notes all work.">
            <TextArea
              rows={16}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={
                "Standup 12 Aug. Thabo said the invoice module is blocked by the payment gateway. Nomsa to confirm with vendor by Friday. Agreed to postpone the launch to 2 September..."
              }
            />
          </Field>
          <div className="mt-4">
            <PrimaryButton onClick={run} loading={loading}>
              {loading ? "Analysing…" : "Summarize notes"}
            </PrimaryButton>
          </div>
          <PromptInspector system={prompt.system} user={prompt.user} />
        </section>

        <section>
          <SectionLabel>Output</SectionLabel>
          {loading ? (
            <LoadingCard message="Extracting decisions…" />
          ) : error ? (
            <ErrorState message={error} onRetry={run} />
          ) : !result ? (
            <EmptyState
              title="No summary yet"
              body="Your structured summary, decisions, action items and deadlines will appear here for review."
            />
          ) : (
            <div className="surface-card p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                  Structured record
                </span>
                <div className="flex flex-wrap gap-2">
                  <CopyButton value={plainText} />
                  <RegenerateButton onClick={run} disabled={loading} />
                  <SaveButton
                    saved={saved}
                    onClick={() => {
                      if (historyId) {
                        toggleSaved(historyId);
                        toast.success(saved ? "Removed from saved" : "Saved to AI History");
                      }
                    }}
                  />
                </div>
              </div>

              <h3 className="label-eyebrow mb-2">Summary</h3>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                {result.summary}
              </p>

              <List title="Key points" items={result.keyPoints ?? []} />
              <List title="Decisions" items={result.decisions ?? []} />

              {result.deadlines?.length ? (
                <div className="mt-5">
                  <h3 className="label-eyebrow mb-2">Deadlines</h3>
                  <ul className="space-y-1.5">
                    {result.deadlines.map((deadline, index) => (
                      <li key={index} className="flex justify-between gap-3 text-sm">
                        <span className="text-pretty">{deadline.item}</span>
                        <span className="shrink-0 text-muted-foreground">{deadline.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.actionItems?.length ? (
                <div className="mt-6 border-t border-border pt-5">
                  <h3 className="label-eyebrow mb-3">Action items</h3>
                  <div className="space-y-2">
                    {result.actionItems.map((item, index) => (
                      <label
                        key={index}
                        className="flex cursor-pointer items-start gap-3 rounded-lg bg-secondary/60 p-3"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(selected[index])}
                          onChange={(event) =>
                            setSelected({ ...selected, [index]: event.target.checked })
                          }
                          className="mt-0.5 size-4 accent-[oklch(0.383_0.055_219.9)]"
                        />
                        <span className="flex-1">
                          <span className="block text-sm">{item.task}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {item.owner || "Owner not stated"} · {item.deadline || "No deadline"} ·{" "}
                            {item.priority} priority
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={convert}
                    className="mt-4 w-full rounded-lg bg-foreground py-2 text-sm font-medium text-background active:opacity-90"
                  >
                    {converted ? "Add selected again" : "Convert selected into tasks"}
                  </button>
                  {converted ? (
                    <button
                      onClick={() => navigate({ to: "/planner" })}
                      className="mt-2 w-full text-xs text-muted-foreground underline underline-offset-4"
                    >
                      View them in the Task Planner
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-5 border-t border-border pt-4">
                <AiNotice />
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
