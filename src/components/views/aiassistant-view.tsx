"use client";

// ---------------------------------------------------------------------------
// AIAssistantView — the study copilot transcript. The optimistic-send
// contract (S13): the user's message enters the transcript with a LOCAL id
// BEFORE the POST; on failure it is removed and the text bounces back into
// the composer (the restored text IS the retry affordance). The transcript
// is an aria-live="polite" region with aria-busy (S14).
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  BookOpen,
  Bot,
  Brain,
  Calculator,
  FileText,
  Languages,
  Lightbulb,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { apiSend, isTimeoutError } from "@/lib/api";
import { mutations, useDataStore, type AiChatMessageRow } from "@/lib/data";
import { Spinner, ViewHeader } from "@/components/views/shared";
import { cn } from "@/lib/utils";

const CHAT_TIMEOUT_MS = 120_000;

type PendingMessage = { id: string; role: "user"; content: string };

const QUICK_ACTIONS = [
  { title: "Explain Concept", icon: BookOpen, prompt: "Explain a concept from my studies" },
  { title: "Study Tips", icon: Brain, prompt: "Give me study tips for my next exam" },
  { title: "Summarize Notes", icon: FileText, prompt: "Summarize my notes" },
  { title: "Solve Problem", icon: Calculator, prompt: "Solve this problem step by step" },
  { title: "Essay Ideas", icon: Lightbulb, prompt: "Brainstorm essay ideas for my topic" },
  { title: "Translate", icon: Languages, prompt: "Translate a passage I am studying" },
] as const;

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function AIAssistantView() {
  const { toast } = useToast();
  const aiMessages = useDataStore((s) => s.aiMessages);
  const loading = useDataStore((s) => s.loading);

  const [input, setInput] = React.useState("");
  const [pending, setPending] = React.useState<PendingMessage[]>([]);
  const [busy, setBusy] = React.useState(false);

  const transcriptRef = React.useRef<HTMLDivElement>(null);

  const persisted: AiChatMessageRow[] = React.useMemo(
    () =>
      aiMessages
        .filter((m) => m.surface === "assistant")
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [aiMessages],
  );

  // Keep the newest turn in view as the transcript grows.
  React.useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [persisted.length, pending.length, busy]);

  const send = async (raw: string) => {
    const content = raw.trim();
    if (!content || busy) return;
    setBusy(true);
    // The optimistic id is captured BEFORE the try — the rollback needs it.
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setPending((list) => [...list, { id: localId, role: "user", content }]);
    setInput("");
    try {
      const history = [...persisted.map((m) => ({ role: m.role, content: m.content }))];
      await apiSend(
        "POST",
        "/api/ai/chat",
        { messages: [...history, { role: "user", content }].slice(-20), surface: "assistant" },
        { timeoutMs: CHAT_TIMEOUT_MS },
      );
      await mutations.refreshAiMessages();
      setPending((list) => list.filter((m) => m.id !== localId));
    } catch (err: unknown) {
      // Rollback: remove the optimistic bubble, bounce the text back.
      setPending((list) => list.filter((m) => m.id !== localId));
      setInput(content);
      const offline =
        typeof navigator !== "undefined" && !navigator.onLine;
      toast.error(
        offline
          ? "You appear to be offline. Check your connection and try again."
          : isTimeoutError(err)
            ? "The assistant took too long to respond. Please try again."
            : errorMessage(err, "The assistant could not respond. Try again."),
      );
    } finally {
      setBusy(false);
    }
  };

  const emptyTranscript = persisted.length === 0 && pending.length === 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <ViewHeader title="AI Study Assistant" subtitle="Your study copilot" icon={Bot} size="lg" />

      {/* ---- transcript (S14 aria-live contract) ---- */}
      <div
        ref={transcriptRef}
        aria-live="polite"
        aria-busy={busy}
        className="sf-scroll mt-6 flex max-h-full flex-1 flex-col space-y-4 overflow-y-auto pb-4"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4">
          {emptyTranscript && !busy && (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-sf-primary-soft dark:bg-sf-primary-soft-dark/40">
                <Bot className="size-8 text-sf-primary" strokeWidth={2} aria-hidden />
              </div>
              <p className="text-center text-sm text-slate-500">
                Ask anything about your studies — or start with a quick prompt.
              </p>
              <div className="grid w-full grid-cols-2 gap-2" aria-label="Quick actions">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.title}
                    type="button"
                    onClick={() => setInput(action.prompt)}
                    className="sf-card rounded-xl p-4 text-left outline-none transition-colors hover:border-sf-primary/40 focus-visible:ring-2 focus-visible:ring-sf-primary/40"
                  >
                    <action.icon className="size-8 text-sf-primary" strokeWidth={2} aria-hidden />
                    <span role="heading" aria-level={3} className="mt-2 block text-base font-semibold text-slate-800 dark:text-slate-100">
                      {action.title}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {loading && persisted.length === 0 && (
            <div className="flex justify-center py-6">
              <Spinner className="size-5 text-sf-primary" />
            </div>
          )}

          {persisted.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm",
                message.role === "user"
                  ? "self-end rounded-br-md bg-sf-primary text-sf-primary-foreground"
                  : "self-start rounded-bl-md border border-slate-100 bg-white text-slate-700 dark:border-slate-700 dark:bg-card dark:text-slate-200",
              )}
            >
              {message.content}
            </div>
          ))}

          {pending.map((message) => (
            <div
              key={message.id}
              className="self-end max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-sf-primary px-4 py-2.5 text-sm text-sf-primary-foreground"
            >
              {message.content}
            </div>
          ))}

          {busy && (
            <div aria-hidden className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-card">
              <span className="flex items-center gap-1">
                <span className="size-1.5 animate-pulse rounded-full bg-slate-400" />
                <span className="size-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
              </span>
              <span className="text-sm text-slate-500">Thinking…</span>
            </div>
          )}
        </div>
      </div>

      {/* ---- composer ---- */}
      <form
        className="flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your study copilot anything…"
          aria-label="Message the assistant"
          className="flex-1"
          disabled={busy}
        />
        <Button
          type="submit"
          variant="gradient"
          className="sf-gradient-shadow"
          disabled={busy || !input.trim()}
          aria-label="Send message"
        >
          {busy ? <Spinner className="size-4" /> : <WandSparkles className="size-4" strokeWidth={2} aria-hidden />}
          Send
        </Button>
        </div>
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Press Enter to send, Shift + Enter for a new line
        </p>
      </form>
    </div>
  );
}
