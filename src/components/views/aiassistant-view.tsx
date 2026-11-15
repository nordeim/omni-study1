"use client";

// ---------------------------------------------------------------------------
// AIAssistantView — the study copilot transcript. The optimistic-send
// contract (S13): the user's message enters the transcript with a LOCAL id
// BEFORE the POST; on failure it is removed and the text bounces back into
// the composer (the restored text IS the retry affordance). The transcript
// is an aria-live="polite" region with aria-busy (S14). The S192/EP port
// restructured the chrome to the measured reference anatomy (the max-w-5xl
// wrapper, the quick-action grid, the big chat card — see
// docs/remediation-plan-session192.md); every behavioral contract above is
// untouched.
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
  Send,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { apiSend, isTimeoutError } from "@/lib/api";
import { mutations, useDataStore, type AiChatMessageRow } from "@/lib/data";
import { Spinner, ViewHeader } from "@/components/views/shared";
import { cn } from "@/lib/utils";

const CHAT_TIMEOUT_MS = 120_000;

type PendingMessage = { id: string; role: "user"; content: string };

const QUICK_ACTIONS = [
  // S190/EN: the reference's measured six — titles AND order (probed live
  // 2026-11-15; the recon dossier's own record agrees). The third mode is
  // "Summarize" (the clone's "Summarize Notes" was transcription drift)
  // and the tail pair is Translate then Essay Ideas.
  { title: "Explain Concept", icon: BookOpen, prompt: "Explain a concept from my studies" },
  { title: "Study Tips", icon: Brain, prompt: "Give me study tips for my next exam" },
  { title: "Summarize", icon: FileText, prompt: "Summarize my notes" },
  { title: "Solve Problem", icon: Calculator, prompt: "Solve this problem step by step" },
  { title: "Translate", icon: Languages, prompt: "Translate a passage I am studying" },
  { title: "Essay Ideas", icon: Lightbulb, prompt: "Brainstorm essay ideas for my topic" },
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
    // S127/CB8: the send and the post-send refresh are SEPARATE failure
    // domains — the pre-CB8 single try treated a flaky refresh as a failed
    // send: the DELIVERED message bounced back into the composer with a
    // false "could not respond" toast (and a retry duplicated the row).
    try {
      try {
        const history = [...persisted.map((m) => ({ role: m.role, content: m.content }))];
        await apiSend(
          "POST",
          "/api/ai/chat",
          { messages: [...history, { role: "user", content }].slice(-20), surface: "assistant" },
          { timeoutMs: CHAT_TIMEOUT_MS },
        );
      } catch (err: unknown) {
        // The send itself failed — rollback: remove the optimistic bubble,
        // bounce the text back.
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
        return;
      }
      // The message IS delivered server-side. A refresh failure gets one
      // retry, then the honest soft toast — never a send rollback.
      try {
        await mutations.refreshAiMessages();
      } catch {
        try {
          await mutations.refreshAiMessages();
        } catch {
          toast.error("Sent — but the history didn't refresh. Reload to catch up.");
        }
      }
      setPending((list) => list.filter((m) => m.id !== localId));
    } finally {
      setBusy(false);
    }
  };

  const emptyTranscript = persisted.length === 0 && pending.length === 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* S192/EP: the measured max-w-5xl view wrapper — the header, the
          quick-action grid (empty transcript only), and the chat card all
          ride the reference's 1024px column (measured 2026-11-16; the
          transcript's old max-w-3xl was the never-measured stand-in). */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col space-y-6">
      <ViewHeader
        title="AI Study Assistant"
        subtitle="Your personal AI tutor, available 24/7"
        icon={Bot}
      />

      {/* ---- quick actions (S192/EP: the measured grid — 2 cols at base,
           3 from md, 16px gap; above the card, empty transcript only) ---- */}
      {!loading && emptyTranscript && !busy && (
        <div role="group" className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-label="Quick actions">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.title}
              type="button"
              onClick={() => setInput(action.prompt)}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-violet-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:border-slate-700 dark:bg-card dark:hover:border-violet-400"
            >
              <action.icon
                className="mb-3 size-8 text-sf-primary transition-transform group-hover:scale-110"
                strokeWidth={2}
                aria-hidden
              />
              {/* The title face: the reference ships a REAL h3 here, but its
                  own heading order (h1 view header → h3 card titles) trips
                  axe's heading-order rule — the reference's own a11y gap,
                  NOT replicated (the S190 Clear-key precedent: the
                  axe-clean contract is a repo-level pin that outranks
                  exact DOM parity). The clone's stand-in: a span heading
                  role at level 2 — visually byte-identical (same classes,
                  same computed styles), axe-clean order (h1 → 2). */}
              <span
                role="heading"
                aria-level={2}
                className="block font-semibold text-slate-800 dark:text-slate-100"
              >
                {action.title}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ---- the big chat card (S192/EP: the measured panel — the
              transcript AND the composer inside one rounded-2xl card,
              min-h-500) ---- */}
      <div className="flex min-h-[500px] flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-card">
      {/* ---- transcript (S14 aria-live contract) ---- */}
      <div
        ref={transcriptRef}
        aria-live="polite"
        aria-busy={busy}
        className="sf-scroll flex-1 space-y-4 overflow-y-auto p-6"
      >
          {/* S192/EP: the measured empty-state hero — INSIDE the card's
              transcript area (the old bot-circle + one-liner + grid-below
              layout was the never-measured stand-in). */}
          {!loading && emptyTranscript && !busy && (
            <div className="py-20 text-center">
              <WandSparkles
                className="mx-auto mb-4 size-16 text-violet-300 dark:text-violet-300/80"
                strokeWidth={2}
                aria-hidden
              />
              {/* The hero heading: the same S192/EP axe-clean adjudication
                  as the quick-action titles — the reference's h3 (after an
                  h1) trips heading-order; the span heading role at level 2
                  is visually identical and axe-clean. */}
              <span
                role="heading"
                aria-level={2}
                className="mb-2 block text-xl font-semibold text-slate-700 dark:text-slate-200"
              >
                How can I help you study today?
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Ask me anything - explanations, summaries, problem solving, and more!
              </p>
            </div>
          )}

          {loading && persisted.length === 0 && (
            <div className="flex justify-center py-6">
              <Spinner className="size-5 text-sf-primary" />
            </div>
          )}

          <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4">
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
              <span className="text-sm text-slate-500 dark:text-slate-400">Thinking…</span>
            </div>
          )}
          </div>
      </div>

      {/* ---- composer (S192/EP: the measured border-t footer INSIDE the
              card — p-4, row gap-3, the icon-only gradient send, the
              left-aligned hint with the reference's exact copy) ---- */}
      <form
        className="border-t border-slate-100 p-4 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <div className="flex gap-3">
        {/* S119/BT6 — the composer is a REAL textarea, matching the reference's
            measured element (rows=2, 60px, resize-none, the "Ask me anything..."
            placeholder) and honoring the pinned hint's PROMISE: Enter sends,
            Shift+Enter inserts a real newline (the reference's own Shift+Enter
            sends — measured live; delivering the promised behavior is the
            superset half of the parity decision P1). The S192/EP port adds
            the measured max-h-120 + text-base/md:text-sm responsive face. */}
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Ask me anything..."
          aria-label="Message the assistant"
          className="max-h-[120px] flex-1 resize-none text-base shadow-sm md:text-sm"
          rows={2}
          disabled={busy}
        />
        {/* The measured send: ICON-ONLY (the reference's lucide-send, no
            text — its own button carries no label; the clone's aria-label
            stays as the a11y superset the s14/resilience pins ride). */}
        <Button
          type="submit"
          variant="gradient"
          className="h-[60px] px-6"
          disabled={busy || !input.trim()}
          aria-label="Send message"
        >
          {busy ? <Spinner className="size-4" /> : <Send className="size-5" strokeWidth={2} aria-hidden />}
        </Button>
        </div>
        {/* The hint: the reference's own copy + left alignment; the color
            rides slate-500 not the measured slate-400 (2.84:1 on white —
            the reference's own AA fail, the documented not-replicated
            class; slate-500 = 4.76:1, the S190 inactive-tab precedent). */}
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Press Enter to send, Shift + Enter for new line
        </p>
      </form>
      </div>
      </div>
    </div>
  );
}
