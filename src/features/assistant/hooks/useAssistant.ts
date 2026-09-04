import { useState, useCallback, useRef } from "react";
import { assistantService, type ChatMessage } from "../services/assistantService";

type Msg = { id: string; role: "assistant" | "user"; text: string };

export function useAssistant() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m0",
      role: "assistant",
      text: "Hi! I'm your Dress Shop stylist — powered by Gemini. Tell me the occasion, style, or vibe and I'll curate picks for you.",
    },
  ]);
  const historyRef = useRef<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setIsThinking(true);
    setError(null);
    setStreamingText("");

    // Build history for Gemini (last 8 turns to stay within token limits)
    const history: ChatMessage[] = historyRef.current.slice(-8);
    history.push({ role: "user", content: trimmed });

    let full = "";
    try {
      full = await assistantService.chatStream(trimmed, history.length > 1 ? history.slice(0, -1) : undefined, (delta) => {
        full += delta;
        setStreamingText((prev) => (prev ?? "") + delta);
      });

      // If streamingText was not used (non-streaming fallback already wrote via callback), ensure full captured
      if (!full && streamingText) full = streamingText;

      const assistantMsg: Msg = { id: `a-${Date.now()}`, role: "assistant", text: full.trim() || "Here to help — try asking for a wedding guest dress in beige, minimal style." };
      setMessages((m) => [...m, assistantMsg]);
      historyRef.current = [...historyRef.current, { role: "user" as const, content: trimmed }, { role: "assistant" as const, content: assistantMsg.text }].slice(-16);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setMessages((m) => [
        ...m,
        { id: `a-err-${Date.now()}`, role: "assistant", text: "Sorry — my stylist is briefly offline. Try the Style Finder chips or retry in a moment." },
      ]);
    } finally {
      setIsThinking(false);
      setStreamingText(null);
    }
  }, [isThinking, streamingText]);

  const reset = useCallback(() => {
    historyRef.current = [];
    setMessages([
      {
        id: "m0",
        role: "assistant",
        text: "Hi! I'm your Dress Shop stylist — powered by Gemini. Tell me the occasion, style, or vibe and I'll curate picks for you.",
      },
    ]);
    setError(null);
    setStreamingText(null);
  }, []);

  return { messages, send, reset, isThinking, streamingText, error, historyRef };
}
