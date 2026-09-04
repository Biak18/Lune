import { supabase } from "@/lib/supabase";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type GeminiChatResponse = {
  output_text: string;
  text?: string;
  intent?: ParsedIntent;
  id?: string;
  model?: string;
  fallback?: boolean;
  error?: string;
};

export type ParsedIntent = {
  occasion: string | null;
  style: string | null;
  color: string | null;
};

function getErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) return String((error as { message: unknown }).message);
  return String(error);
}

export const assistantService = {
  /**
   * Full conversational AI via Supabase Edge Function `gemini` (Gemini 3.8 Flash).
   * Keeps GEMINI_API_KEY server-side. Supports history for multi-turn.
   */
  async chat(input: string, messages?: ChatMessage[]): Promise<string> {
    const res = await assistantService.chatWithIntent(input, messages);
    return res.text;
  },

  /** Single-call variant that returns both stylist reply and parsed intent (saves free-tier quota) */
  async chatWithIntent(
    input: string,
    messages?: ChatMessage[],
  ): Promise<{ text: string; intent: ParsedIntent }> {
    const { data, error } = await supabase.functions.invoke<GeminiChatResponse>("gemini", {
      body: {
        input,
        messages: messages?.map((m) => ({ role: m.role, content: m.content })),
      },
    });
    if (error) throw new Error(getErrorMessage(error));
    if (!data) throw new Error("Empty response from AI");
    if (data.error) throw new Error(data.error);
    const text = data.output_text ?? data.text ?? "";
    if (!text) throw new Error("AI returned empty text");
    const intent: ParsedIntent = data.intent ?? { occasion: null, style: null, color: null };
    return { text, intent };
  },

  /**
   * Streaming variant — returns incrementally via callback.
   * Falls back to non-streaming if streaming not supported (e.g. local invoke without stream handler).
   */
  async chatStream(
    input: string,
    messages: ChatMessage[] | undefined,
    onDelta: (delta: string) => void,
  ): Promise<string> {
    // Use direct fetch for SSE so we can read stream with anon key
    const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/gemini`;
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey || url.includes("placeholder")) {
      // No URL configured — fallback to invoke
      const full = await assistantService.chat(input, messages);
      onDelta(full);
      return full;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ input, messages, stream: true }),
    });

    if (!response.ok || !response.body) {
      // Fallback to non-streaming invoke
      const full = await assistantService.chat(input, messages);
      onDelta(full);
      return full;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";
      for (const block of lines) {
        const line = block.trim();
        if (!line.startsWith("data:")) continue;
        const jsonStr = line.slice(5).trim();
        try {
          const evt = JSON.parse(jsonStr) as { delta?: string; done?: boolean; error?: string };
          if (evt.delta) {
            fullText += evt.delta;
            onDelta(evt.delta);
          }
          if (evt.error) throw new Error(evt.error);
        } catch {
          // ignore parse errors
        }
      }
    }
    // If nothing streamed, fallback
    if (!fullText) {
      const fb = await assistantService.chat(input, messages);
      onDelta(fb);
      return fb;
    }
    return fullText;
  },

  async parseIntent(text: string): Promise<ParsedIntent> {
    // Single Edge Function `gemini` handles both chat and intent (mode: "intent")
    const { data, error } = await supabase.functions.invoke<ParsedIntent>("gemini", {
      body: { mode: "intent", text },
    });
    if (error) throw new Error(getErrorMessage(error));
    if (!data) throw new Error("Empty intent response");
    return data;
  },
};
