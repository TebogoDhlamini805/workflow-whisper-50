import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { HistoryItem, HistoryTool, Priority, Task } from "./types";

const TASKS_KEY = "cadence.tasks.v1";
const HISTORY_KEY = "cadence.history.v1";
const PROFILE_KEY = "cadence.profile.v1";

export type Profile = { name: string; role: string; workingHours: string; defaultTone: string };

const defaultProfile: Profile = {
  name: "Nancy",
  role: "Operations Lead",
  workingHours: "09:00–17:00",
  defaultTone: "Professional",
};

const seedTasks: Task[] = [
  {
    id: "seed-1",
    title: "Finalise Q4 strategy proposal",
    due: "Today, 16:00",
    priority: "high",
    durationMinutes: 90,
    done: false,
    source: "manual",
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    title: "Client handover sync with Thabo",
    due: "Today, 14:00",
    priority: "medium",
    durationMinutes: 45,
    done: false,
    source: "manual",
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    title: "Review supplier invoices",
    due: "Tomorrow",
    priority: "low",
    durationMinutes: 30,
    done: false,
    source: "manual",
    createdAt: new Date().toISOString(),
  },
];

type StoreValue = {
  hydrated: boolean;
  tasks: Task[];
  history: HistoryItem[];
  profile: Profile;
  addTask: (task: Omit<Task, "id" | "createdAt" | "done">) => void;
  addTasks: (tasks: Omit<Task, "id" | "createdAt" | "done">[]) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addHistory: (item: Omit<HistoryItem, "id" | "createdAt">) => string;
  toggleSaved: (id: string) => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
  updateProfile: (profile: Partial<Profile>) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [profile, setProfile] = useState<Profile>(defaultProfile);

  useEffect(() => {
    setTasks(read(TASKS_KEY, seedTasks));
    setHistory(read(HISTORY_KEY, []));
    setProfile({ ...defaultProfile, ...read(PROFILE_KEY, {} as Partial<Profile>) });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  const addTasks = useCallback((incoming: Omit<Task, "id" | "createdAt" | "done">[]) => {
    setTasks((current) => [
      ...incoming.map((task) => ({
        ...task,
        id: uid(),
        done: false,
        createdAt: new Date().toISOString(),
      })),
      ...current,
    ]);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      hydrated,
      tasks,
      history,
      profile,
      addTask: (task) => addTasks([task]),
      addTasks,
      toggleTask: (id) =>
        setTasks((current) => current.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
      deleteTask: (id) => setTasks((current) => current.filter((t) => t.id !== id)),
      addHistory: (item) => {
        const id = uid();
        setHistory((current) =>
          [{ ...item, id, createdAt: new Date().toISOString() }, ...current].slice(0, 60),
        );
        return id;
      },
      toggleSaved: (id) =>
        setHistory((current) => current.map((h) => (h.id === id ? { ...h, saved: !h.saved } : h))),
      deleteHistory: (id) => setHistory((current) => current.filter((h) => h.id !== id)),
      clearHistory: () => setHistory([]),
      updateProfile: (next) => setProfile((current) => ({ ...current, ...next })),
    }),
    [hydrated, tasks, history, profile, addTasks],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

export const priorityLabel: Record<Priority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

export const toolLabel: Record<HistoryTool, string> = {
  email: "Email Generator",
  meeting: "Meeting Summarizer",
  planner: "Task Planner",
  assistant: "AI Assistant",
};
