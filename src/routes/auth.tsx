import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { safeRedirect, useSession } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — AI Productivity Assistant" },
      {
        name: "description",
        content:
          "Sign in or create an account to draft emails, summarise meetings and plan your day with AI.",
      },
      { property: "og:title", content: "Sign in — AI Productivity Assistant" },
      {
        property: "og:description",
        content: "Secure access to your AI-powered email, meeting and planning workspace.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const target = safeRedirect(redirect);
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) navigate({ to: target, replace: true });
  }, [loading, session, navigate, target]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your inbox and confirm your email address to finish signing up.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try again.");
        return;
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="size-4 text-primary-foreground" aria-hidden />
          </div>
          <div>
            <p className="font-serif text-lg leading-none">AI Productivity&nbsp;Assistant</p>
            <p className="text-[11px] text-muted-foreground">Workplace AI</p>
          </div>
        </div>

        <h1 className="text-2xl font-medium">
          {mode === "signin" ? "Sign in to your workspace" : "Create your workspace"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your tasks, drafts and AI history stay tied to your account.
        </p>

        <form onSubmit={handleSubmit} className="surface-card mt-6 space-y-4 p-5">
          {mode === "signup" ? (
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tebogo Dhlamini"
              />
            </label>
          ) : null}
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Work email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@company.com"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </label>

          {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full rounded-lg border border-input bg-background py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setNotice(null);
            }}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
}
