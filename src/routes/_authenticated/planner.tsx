import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
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
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/ai-ui";
import { planSchedule } from "@/lib/ai.functions";
import { plannerPrompt } from "@/lib/prompts";
import { useStore } from "@/lib/store";
import type { Priority, ScheduleResult } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner & Scheduler — Cadence" },
      {
        name: "description",
        content:
          "Enter tasks, deadlines, priorities and working hours to get a realistic time-blocked schedule with conflicts flagged.",
      },
      { property: "og:title", content: "AI Task Planner & Scheduler — Cadence" },
      {
        property: "og:description",
        content: "Turn a task list into an ordered, conflict-checked daily or weekly schedule.",
      },
    ],
  }),
  component: PlannerPage,
});

const blockTone: Record<string, string> = {
  task: "bg-card",
  meeting: "bg-accent/60",
  break: "bg-secondary",
  buffer: "bg-secondary",
};

function PlannerPage() {
  const runPlan = useServerFn(planSchedule);
  const { tasks, addTask, toggleTask, deleteTask, addHistory, toggleSaved, history, profile } =
    useStore();

  const [newTask, setNewTask] = useState({ title: "", due: "", priority: "medium" as Priority, duration: "" });
  const [workingHours, setWorkingHours] = useState(profile.workingHours);
  const [focusNote, setFocusNote] = useState("");
  const [horizon, setHorizon] = useState<"day" | "week">("day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [blocks, setBlocks] = useState<ScheduleResult["blocks"]>([]);
  const [historyId, setHistoryId] = useState<string | null>(null);

  const open = tasks.filter((task) => !task.done);
  const saved = history.find((item) => item.id === historyId)?.saved ?? false;

  const taskLines = open
    .map(
      (task) =>
        `${task.title} | deadline: ${task.due || "none"} | priority: ${task.priority} | est: ${
          task.durationMinutes ? `${task.durationMinutes} min` : "unknown"
        }${task.owner ? ` | owner: ${task.owner}` : ""}`,
    )
    .join("\n");

  const prompt = plannerPrompt({ tasks: taskLines || "…", workingHours, focusNote, horizon });

  async function run() {
    if (!open.length) {
      toast.error("Add at least one task first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const output = await runPlan({
        data: { tasks: taskLines, workingHours, focusNote, horizon },
      });
      setResult(output);
      setBlocks(output.blocks ?? []);
      setHistoryId(
        addHistory({
          tool: "planner",
          title: `${horizon === "day" ? "Daily" : "Weekly"} schedule · ${open.length} tasks`,
          saved: false,
          input: taskLines.slice(0, 200),
          output,
        }),
      );
      toast.success("Schedule generated — adjust as needed");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The AI request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Task Planner"
      description="Cadence orders your work by urgency and deadline, groups related tasks and builds a schedule you can actually follow."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <SectionLabel>Your tasks</SectionLabel>
          <div className="space-y-2">
            {open.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                No open tasks yet. Add one below or import action items from the Meeting Summarizer.
              </p>
            ) : (
              open.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3 outline-1 -outline-offset-1 outline-black/5"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} complete`}
                    className="size-4.5 shrink-0 rounded-full border-2 border-muted-foreground/40 hover:border-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {task.due || "No deadline"} · {task.priority}
                      {task.durationMinutes ? ` · ${task.durationMinutes} min` : ""}
                      {task.source === "meeting" ? " · from meeting" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-border p-4">
            <Field label="Add a task">
              <TextInput
                value={newTask.title}
                onChange={(event) => setNewTask({ ...newTask, title: event.target.value })}
                placeholder="Prepare board presentation"
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Deadline">
                <TextInput
                  value={newTask.due}
                  onChange={(event) => setNewTask({ ...newTask, due: event.target.value })}
                  placeholder="Fri 16:00"
                />
              </Field>
              <Field label="Priority">
                <SelectInput
                  value={newTask.priority}
                  onChange={(event) =>
                    setNewTask({ ...newTask, priority: event.target.value as Priority })
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </SelectInput>
              </Field>
              <Field label="Minutes">
                <TextInput
                  inputMode="numeric"
                  value={newTask.duration}
                  onChange={(event) => setNewTask({ ...newTask, duration: event.target.value })}
                  placeholder="60"
                />
              </Field>
            </div>
            <button
              onClick={() => {
                if (!newTask.title.trim()) {
                  toast.error("Give the task a name.");
                  return;
                }
                addTask({
                  title: newTask.title.trim(),
                  due: newTask.due.trim() || undefined,
                  priority: newTask.priority,
                  durationMinutes: Number(newTask.duration) || undefined,
                  source: "manual",
                });
                setNewTask({ title: "", due: "", priority: "medium", duration: "" });
                toast.success("Task added");
              }}
              className="w-full rounded-lg bg-foreground py-2 text-sm font-medium text-background active:opacity-90"
            >
              Add task
            </button>
          </div>

          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Working hours">
                <TextInput
                  value={workingHours}
                  onChange={(event) => setWorkingHours(event.target.value)}
                  placeholder="09:00–17:00"
                />
              </Field>
              <Field label="Horizon">
                <SelectInput
                  value={horizon}
                  onChange={(event) => setHorizon(event.target.value as "day" | "week")}
                >
                  <option value="day">Daily schedule</option>
                  <option value="week">Weekly schedule</option>
                </SelectInput>
              </Field>
            </div>
            <Field label="Constraints & preferences">
              <TextArea
                rows={3}
                value={focusNote}
                onChange={(event) => setFocusNote(event.target.value)}
                placeholder="Standup at 09:15. Deep work best in the morning. Lunch 13:00."
              />
            </Field>
            <PrimaryButton onClick={run} loading={loading}>
              {loading ? "Planning…" : "Generate schedule"}
            </PrimaryButton>
          </div>
          <PromptInspector system={prompt.system} user={prompt.user} />
        </section>

        <section>
          <SectionLabel>Proposed schedule</SectionLabel>
          {loading ? (
            <LoadingCard message="Sequencing your day…" />
          ) : error ? (
            <ErrorState message={error} onRetry={run} />
          ) : !result ? (
            <EmptyState
              title="No schedule yet"
              body="Add your tasks and working hours, then generate a time-blocked plan you can edit before committing."
            />
          ) : (
            <div className="surface-card p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                  Draft plan
                </span>
                <div className="flex flex-wrap gap-2">
                  <CopyButton
                    value={blocks.map((block) => `${block.start}–${block.end}  ${block.title}`).join("\n")}
                  />
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

              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-4 rounded-xl p-3 outline-1 -outline-offset-1 outline-black/5 ${
                      blockTone[block.type] ?? "bg-card"
                    }`}
                  >
                    <span className="w-24 shrink-0 pt-0.5 text-xs font-medium text-primary">
                      {block.start}–{block.end}
                    </span>
                    <div className="min-w-0 flex-1">
                      <input
                        value={block.title}
                        onChange={(event) =>
                          setBlocks(
                            blocks.map((current, currentIndex) =>
                              currentIndex === index
                                ? { ...current, title: event.target.value }
                                : current,
                            ),
                          )
                        }
                        className="w-full bg-transparent text-sm font-medium outline-none"
                        aria-label="Schedule block title"
                      />
                      {block.note ? (
                        <p className="text-[11px] text-muted-foreground">{block.note}</p>
                      ) : null}
                    </div>
                    <button
                      onClick={() => setBlocks(blocks.filter((_, i) => i !== index))}
                      aria-label="Remove block"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>

              {result.rationale?.length ? (
                <div className="mt-5">
                  <h3 className="label-eyebrow mb-2">Why this order</h3>
                  <ul className="space-y-1.5">
                    {result.rationale.map((reason, index) => (
                      <li key={index} className="flex gap-2 text-sm text-pretty text-muted-foreground">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.conflicts?.length ? (
                <div className="mt-5 rounded-xl border border-destructive/25 bg-destructive/5 p-3">
                  <h3 className="label-eyebrow mb-2 text-destructive">Conflicts to resolve</h3>
                  <ul className="space-y-1 text-sm text-destructive/90">
                    {result.conflicts.map((conflict, index) => (
                      <li key={index}>{conflict}</li>
                    ))}
                  </ul>
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
