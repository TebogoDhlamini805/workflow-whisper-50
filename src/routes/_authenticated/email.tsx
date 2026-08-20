import { createFileRoute } from "@tanstack/react-router";
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
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/ai-ui";
import { generateEmail } from "@/lib/ai.functions";
import { emailPrompt } from "@/lib/prompts";
import { useStore } from "@/lib/store";
import type { EmailInput, EmailResult } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Cadence" },
      {
        name: "description",
        content:
          "Generate professional workplace emails with a chosen tone and length, then review, edit, copy or save the draft.",
      },
      { property: "og:title", content: "Smart Email Generator — Cadence" },
      {
        property: "og:description",
        content: "Structured AI prompts turn a purpose and a few facts into a ready-to-send email.",
      },
    ],
  }),
  component: EmailPage,
});

const tones = ["Formal", "Friendly", "Persuasive", "Professional", "Concise"];
const lengths = ["Short", "Medium", "Detailed"];

function EmailPage() {
  const runGenerate = useServerFn(generateEmail);
  const { addHistory, toggleSaved, history, profile } = useStore();

  const [form, setForm] = useState<EmailInput>({
    purpose: "",
    recipient: "",
    keyInformation: "",
    tone: profile.defaultTone,
    length: "Medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [draft, setDraft] = useState({ subject: "", body: "" });
  const [historyId, setHistoryId] = useState<string | null>(null);

  const saved = history.find((item) => item.id === historyId)?.saved ?? false;
  const prompt = emailPrompt(form);

  const update = (key: keyof EmailInput) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function run() {
    if (!form.purpose.trim() || !form.recipient.trim() || form.keyInformation.trim().length < 3) {
      toast.error("Add a purpose, a recipient and the key information first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const output = await runGenerate({ data: form });
      setResult(output);
      setDraft({ subject: output.subject, body: output.body });
      setHistoryId(
        addHistory({
          tool: "email",
          title: output.subject || form.purpose,
          saved: false,
          input: `${form.purpose} → ${form.recipient}`,
          output,
        }),
      );
      toast.success("Draft ready for review");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The AI request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Email Generator"
      description="Describe the situation once. Cadence writes a subject line and a full email body in the tone you choose."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <SectionLabel>Input</SectionLabel>
          <div className="space-y-4">
            <Field label="Purpose of the email">
              <TextInput
                value={form.purpose}
                onChange={(event) => update("purpose")(event.target.value)}
                placeholder="Notify the client of a two-day delay"
              />
            </Field>
            <Field label="Recipient">
              <TextInput
                value={form.recipient}
                onChange={(event) => update("recipient")(event.target.value)}
                placeholder="Sarah Mokoena, client project manager"
              />
            </Field>
            <Field
              label="Key information"
              hint="Only facts you include here will appear in the email."
            >
              <TextArea
                rows={5}
                value={form.keyInformation}
                onChange={(event) => update("keyInformation")(event.target.value)}
                placeholder="API integration hit a blocker. New delivery date is Thursday. No budget change."
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tone">
                <SelectInput
                  value={form.tone}
                  onChange={(event) => update("tone")(event.target.value)}
                >
                  {tones.map((tone) => (
                    <option key={tone}>{tone}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Length">
                <SelectInput
                  value={form.length}
                  onChange={(event) => update("length")(event.target.value)}
                >
                  {lengths.map((length) => (
                    <option key={length}>{length}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>
            <PrimaryButton onClick={run} loading={loading}>
              {loading ? "Drafting…" : "Generate email"}
            </PrimaryButton>
          </div>
          <PromptInspector system={prompt.system} user={prompt.user} />
        </section>

        <section>
          <SectionLabel>Output</SectionLabel>
          {loading ? (
            <LoadingCard message="Synthesizing response…" />
          ) : error ? (
            <ErrorState message={error} onRetry={run} />
          ) : !result ? (
            <EmptyState
              title="No draft yet"
              body="Fill in the purpose, recipient and key information, then generate. You can edit everything before sending."
            />
          ) : (
            <div className="surface-card p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                  Draft complete
                </span>
                <div className="flex flex-wrap gap-2">
                  <CopyButton value={`Subject: ${draft.subject}\n\n${draft.body}`} />
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

              <Field label="Subject">
                <TextInput
                  value={draft.subject}
                  onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
                />
              </Field>
              <div className="mt-4">
                <Field label="Body">
                  <TextArea
                    rows={14}
                    value={draft.body}
                    onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                  />
                </Field>
              </div>

              {result.followUp ? (
                <p className="mt-4 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Suggested follow-up: </span>
                  {result.followUp}
                </p>
              ) : null}

              <div className="mt-4 border-t border-border pt-4">
                <AiNotice />
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
