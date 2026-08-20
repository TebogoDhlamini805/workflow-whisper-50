export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  due?: string | undefined;
  priority: Priority;
  durationMinutes?: number | undefined;
  done: boolean;
  source: "manual" | "meeting";
  owner?: string | undefined;
  createdAt: string;
};

export type EmailResult = {
  subject: string;
  body: string;
  followUp?: string | undefined;
};

export type MeetingResult = {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner?: string | undefined; deadline?: string | undefined; priority: Priority }[];
  deadlines: { item: string; date: string }[];
};

export type ScheduleBlock = {
  start: string;
  end: string;
  title: string;
  type: "task" | "break" | "buffer" | "meeting";
  note?: string | undefined;
};

export type ScheduleResult = {
  blocks: ScheduleBlock[];
  rationale: string[];
  conflicts: string[];
};

export type HistoryTool = "email" | "meeting" | "planner" | "assistant";

export type HistoryItem = {
  id: string;
  tool: HistoryTool;
  title: string;
  createdAt: string;
  saved: boolean;
  input: string;
  output: unknown;
};

export type EmailInput = {
  purpose: string;
  recipient: string;
  keyInformation: string;
  tone: string;
  length: string;
};

export type PlannerInput = {
  tasks: string;
  workingHours: string;
  focusNote: string;
  horizon: "day" | "week";
};
