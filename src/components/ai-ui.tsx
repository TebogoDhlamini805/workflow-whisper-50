import { AlertTriangle, Check, Copy, RefreshCw, Save } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export function AiNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-[11px] text-muted-foreground italic ${className}`}>
      <AlertTriangle className="mt-px size-3 shrink-0 not-italic" aria-hidden />
      AI-generated content — review before use.
    </p>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="label-eyebrow mb-3">{children}</h2>;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="label-eyebrow block">{label}</label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-lg bg-secondary px-3 py-2.5 text-sm outline-1 -outline-offset-1 outline-black/5 transition-shadow placeholder:text-muted-foreground/70 focus:outline-2 focus:outline-primary";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function PrimaryButton({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity active:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ""}`}
    >
      {loading ? <RefreshCw className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <GhostButton
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1600);
        } catch {
          toast.error("Copying is blocked in this browser");
        }
      }}
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {label}
    </GhostButton>
  );
}

export function RegenerateButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <GhostButton onClick={onClick} disabled={disabled}>
      <RefreshCw className="size-3.5" aria-hidden />
      Regenerate
    </GhostButton>
  );
}

export function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <GhostButton onClick={onClick}>
      <Save className="size-3.5" aria-hidden />
      {saved ? "Saved" : "Save"}
    </GhostButton>
  );
}

export function LoadingCard({ message }: { message: string }) {
  return (
    <div className="surface-card relative min-h-40 p-5" aria-busy="true" aria-live="polite">
      <div className="flex animate-pulse flex-col gap-3">
        <div className="h-3 w-1/3 rounded-full bg-secondary" />
        <div className="h-2 w-full rounded-full bg-secondary" />
        <div className="h-2 w-full rounded-full bg-secondary" />
        <div className="h-2 w-4/5 rounded-full bg-secondary" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-card/50">
        <span className="label-eyebrow">{message}</span>
      </div>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-[46ch] text-pretty text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"
    >
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 text-pretty text-destructive/85">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="mt-3 text-xs font-medium underline underline-offset-4">
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function PromptInspector({ system, user }: { system: string; user: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 rounded-xl border border-border bg-secondary/60 p-3">
      <button
        onClick={() => setOpen((value) => !value)}
        className="label-eyebrow flex w-full items-center justify-between"
        aria-expanded={open}
      >
        Structured prompt used
        <span className="text-muted-foreground">{open ? "Hide" : "View"}</span>
      </button>
      {open ? (
        <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-card p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {system}
          {"\n\n"}
          {user}
        </pre>
      ) : null}
    </div>
  );
}
