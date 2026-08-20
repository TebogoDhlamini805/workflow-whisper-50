import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  AiNotice,
  CopyButton,
  ErrorState,
  LoadingCard,
  PromptInspector,
  SectionLabel,
  TextArea,
} from "@/components/ai-ui";
import { askAssistant } from "@/lib/ai.functions";
import { assistantSystemPrompt, quickPrompts } from "@/lib/prompts";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Cadence" },
      {
        name: "description",
        content:
          "Ask the Cadence workplace assistant for prioritisation help, agendas, drafts and structured advice on daily work problems.",
      },
      { property: "og:title", content: "AI Assistant — Cadence" },
      {
        property: "og:description",
        content: "A structured workplace assistant for prioritising, drafting and planning.",
      },
    ],
  }),
  component: AssistantPage,
});

type Message = { role: "user" | "assistant"; content: string };

function renderMarkdown(text: string) {
  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-2" />;
    const withBold = trimmed.replace(/^[-*]\s+/, "");
    const parts = withBold.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={partIndex} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={partIndex}>{part.replace(/[#`]/g, "")}</span>
      ),
    );
    const isBullet = /^[-*]\s+/.test(trimmed);
    return (
      <p key={index} className={`text-sm leading-relaxed text-pretty ${isBullet ? "flex gap-2" : ""}`}>
        {isBullet ? <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> : null}
        <span>{parts}</span>
      </p>
    );
  });
}

function AssistantPage() {
  const runAsk = useServerFn(askAssistant);
  const { addHistory } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content) return;
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const { text: reply } = await runAsk({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
      addHistory({
        tool: "assistant",
        title: content.slice(0, 60),
        saved: false,
        input: content,
        output: { text: reply },
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The AI request failed.");
      toast.error("The assistant could not reply.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="AI Assistant"
      description="Your general workplace copilot. It keeps the full conversation in context and points you to the right tool."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <section>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <Sparkles className="mx-auto mb-3 size-5 text-primary" aria-hidden />
                <p className="text-sm font-medium">Ask a work question</p>
                <p className="mx-auto mt-1 max-w-[46ch] text-pretty text-sm text-muted-foreground">
                  Prioritisation, agendas, difficult replies, planning — the assistant answers in
                  structured, actionable form.
                </p>
              </div>
            ) : (
              messages.map((message, index) =>
                message.role === "user" ? (
                  <div key={index} className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {message.content}
                    </p>
                  </div>
                ) : (
                  <div key={index} className="surface-card space-y-1 p-5">
                    {renderMarkdown(message.content)}
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                      <AiNotice />
                      <CopyButton value={message.content} />
                    </div>
                  </div>
                ),
              )
            )}

            {loading ? <LoadingCard message="Thinking…" /> : null}
            {error ? <ErrorState message={error} /> : null}
          </div>

          <form
            className="mt-6 flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <TextArea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              placeholder="How should I sequence three deadlines that all land on Friday?"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="size-4" aria-hidden />
            </button>
          </form>
          <PromptInspector
            system={assistantSystemPrompt}
            user="CONTEXT\nThe full conversation history is resent on every turn so the assistant keeps context."
          />
        </section>

        <aside>
          <SectionLabel>Quick prompts</SectionLabel>
          <div className="space-y-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => void send(prompt)}
                disabled={loading}
                className="w-full rounded-xl bg-secondary/60 p-3 text-left text-sm outline-1 -outline-offset-1 outline-black/5 transition-colors hover:bg-secondary disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
