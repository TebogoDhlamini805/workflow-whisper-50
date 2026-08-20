import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callAiJson, callAiText } from "./ai-core.server";
import { assistantSystemPrompt, emailPrompt, meetingPrompt, plannerPrompt } from "./prompts";
import type { EmailResult, MeetingResult, ScheduleResult } from "./types";

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        purpose: z.string().min(3),
        recipient: z.string().min(1),
        keyInformation: z.string().min(3),
        tone: z.string().min(1),
        length: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const prompt = emailPrompt(data);
    return callAiJson<EmailResult>(prompt.system, prompt.user);
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ notes: z.string().min(30) }).parse(data))
  .handler(async ({ data }) => {
    const prompt = meetingPrompt(data.notes);
    return callAiJson<MeetingResult>(prompt.system, prompt.user);
  });

export const planSchedule = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        tasks: z.string().min(3),
        workingHours: z.string().min(1),
        focusNote: z.string(),
        horizon: z.enum(["day", "week"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const prompt = plannerPrompt(data);
    return callAiJson<ScheduleResult>(prompt.system, prompt.user);
  });

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) }))
          .min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const text = await callAiText(assistantSystemPrompt, data.messages);
    return { text };
  });
