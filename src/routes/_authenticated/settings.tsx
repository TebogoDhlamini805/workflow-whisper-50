import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Field, SectionLabel, SelectInput, TextInput } from "@/components/ai-ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Responsible AI — Cadence" },
      {
        name: "description",
        content:
          "Set your name, role, working hours and default tone, and read how Cadence uses AI responsibly.",
      },
      { property: "og:title", content: "Settings & Responsible AI — Cadence" },
      {
        property: "og:description",
        content: "Workspace preferences and the Responsible AI policy behind every Cadence output.",
      },
    ],
  }),
  component: SettingsPage,
});

const principles = [
  {
    title: "AI assists, people decide",
    body: "Every output is a draft. Cadence never sends an email, books a meeting or completes a task on your behalf — you review and approve first.",
  },
  {
    title: "Outputs can be wrong",
    body: "Generated text may contain factual errors, invented details or misread context. Verify names, dates, figures and commitments before acting on them.",
  },
  {
    title: "Keep sensitive data out",
    body: "Do not paste personal data, credentials, customer records or confidential material into the AI tools. Content you submit is sent to a third-party model provider for processing.",
  },
  {
    title: "Bias and tone",
    body: "Models reflect patterns in their training data and can produce biased or culturally inappropriate phrasing. Adjust tone and wording to your own judgement.",
  },
  {
    title: "You control your data",
    body: "Tasks, history and preferences are stored locally in this browser. You can delete any item or clear everything from the AI History page at any time.",
  },
  {
    title: "Transparency",
    body: "Every AI screen shows the exact structured prompt sent to the model, so you can see how a result was produced.",
  },
];

function SettingsPage() {
  const { profile, updateProfile, tasks, history } = useStore();

  return (
    <AppShell
      title="Settings"
      description="Personalise how Cadence writes for you, and review the Responsible AI commitments that govern every feature."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <SectionLabel>Your profile</SectionLabel>
          <div className="surface-card space-y-4 p-5">
            <Field label="Name" hint="Used to sign generated emails.">
              <TextInput
                value={profile.name}
                onChange={(event) => updateProfile({ name: event.target.value })}
                placeholder="Alex Moreau"
              />
            </Field>
            <Field label="Role" hint="Gives the model context about your responsibilities.">
              <TextInput
                value={profile.role}
                onChange={(event) => updateProfile({ role: event.target.value })}
                placeholder="Operations Manager"
              />
            </Field>
            <Field label="Working hours" hint="Default window used by the Task Planner.">
              <TextInput
                value={profile.workingHours}
                onChange={(event) => updateProfile({ workingHours: event.target.value })}
                placeholder="09:00–17:00"
              />
            </Field>
            <Field label="Default email tone">
              <SelectInput
                value={profile.defaultTone}
                onChange={(event) => updateProfile({ defaultTone: event.target.value })}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="concise">Concise & direct</option>
                <option value="apologetic">Apologetic</option>
                <option value="persuasive">Persuasive</option>
              </SelectInput>
            </Field>
            <button
              onClick={() => toast.success("Preferences saved to this browser")}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
            >
              Save preferences
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary/60 p-4">
              <p className="font-serif text-2xl">{tasks.length}</p>
              <p className="text-xs text-muted-foreground">Tasks tracked</p>
            </div>
            <div className="rounded-xl bg-secondary/60 p-4">
              <p className="font-serif text-2xl">{history.length}</p>
              <p className="text-xs text-muted-foreground">AI outputs generated</p>
            </div>
          </div>
        </section>

        <section id="responsible-ai">
          <SectionLabel>Responsible AI</SectionLabel>
          <div className="surface-card p-5">
            <div className="flex items-start gap-3 border-b border-border pb-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <p className="text-pretty text-sm text-muted-foreground">
                Cadence uses generative AI to draft content. AI-generated output may be inaccurate,
                incomplete or biased and must be reviewed by a human before it is sent, shared or
                acted upon.
              </p>
            </div>
            <dl className="mt-4 space-y-4">
              {principles.map((principle) => (
                <div key={principle.title}>
                  <dt className="text-sm font-semibold">{principle.title}</dt>
                  <dd className="mt-1 text-pretty text-sm text-muted-foreground">{principle.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
