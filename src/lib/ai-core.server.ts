import { streamText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3.7-flash";

function friendlyError(error: unknown): never {
  const anyError = error as { statusCode?: number; message?: string };
  const status = anyError?.statusCode;
  if (status === 429) {
    throw new Error("The AI service is busy right now. Please wait a moment and try again.");
  }
  if (status === 402) {
    throw new Error(
      "AI credits for this workspace are exhausted. Add credits in Lovable to continue using AI features.",
    );
  }
  if (status === 403) {
    throw new Error("AI access is currently blocked for this workspace. Contact the workspace admin.");
  }
  if (status === 401) {
    throw new Error("The AI service is not configured correctly (missing or invalid key).");
  }
  throw new Error(anyError?.message || "The AI request failed. Please try again.");
}

export async function callAiText(system: string, messages: { role: "user" | "assistant"; content: string }[]) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const gateway = createLovableAiGatewayProvider(key);

  try {
    const result = streamText({ model: gateway(MODEL), system, messages });
    return await result.text;
  } catch (error) {
    friendlyError(error);
  }
}

function extractJson(raw: string) {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI returned an unreadable response. Try regenerating.");
  return text.slice(start, end + 1);
}

export async function callAiJson<T>(system: string, user: string): Promise<T> {
  const raw = await callAiText(system, [{ role: "user", content: user }]);
  try {
    return JSON.parse(extractJson(raw)) as T;
  } catch {
    throw new Error("The AI returned an unreadable response. Please regenerate.");
  }
}
