"use client";

// ---------------------------------------------------------------------------
// MathSolverView (S8-L) — the single-column solver: borderless problem
// textarea + camera/image attach (client-side MIME guard — rejected files
// fire ZERO outbound requests), the /api/math/solve round-trip (120 s AI
// deadline), the aria-live "Math solution" card, and the persisted solver
// history from the aiMessages slice (surface "solver").
// ---------------------------------------------------------------------------

import * as React from "react";
import { Calculator, Camera, History, ImagePlus, RefreshCw, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { apiSend, isTimeoutError } from "@/lib/api";
import { mutations, useDataStore } from "@/lib/data";
import { SectionCard, Spinner, ViewHeader } from "@/components/views/shared";
import { cn } from "@/lib/utils";

const SOLVER_TIMEOUT_MS = 120_000;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** Pair the solver surface's persisted rows into Q/A cards (user row opens a
 *  pair; the following assistant row answers it). */
function pairSolverMessages(
  messages: { id: string; role: string; content: string; surface: string; createdAt: string }[],
): { id: string; question: string; answer: string | null; createdAt: string }[] {
  const pairs: { id: string; question: string; answer: string | null; createdAt: string }[] = [];
  for (const message of messages) {
    if (message.surface !== "solver") continue;
    if (message.role === "user") {
      pairs.push({ id: message.id, question: message.content, answer: null, createdAt: message.createdAt });
    } else if (pairs.length > 0) {
      const last = pairs[pairs.length - 1];
      if (last.answer === null) last.answer = message.content;
    }
  }
  return pairs.reverse();
}

export function MathSolverView() {
  const { toast } = useToast();
  const aiMessages = useDataStore((s) => s.aiMessages);
  const loading = useDataStore((s) => s.loading);

  const [problem, setProblem] = React.useState("");
  const [image, setImage] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [solution, setSolution] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onPickImage = () => fileInputRef.current?.click();

  // S13 client-side MIME guard: reject BEFORE any outbound request.
  const onImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only PNG, JPG, or WebP images are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImage(reader.result);
    };
    reader.onerror = () => toast.error("That image could not be read. Try another file.");
    reader.readAsDataURL(file);
  };

  const solve = async () => {
    const text = problem.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const response = await apiSend<{ solution: string }>(
        "POST",
        "/api/math/solve",
        { problem: text, image: image ?? undefined },
        { timeoutMs: SOLVER_TIMEOUT_MS },
      );
      setSolution(response.solution);
      setProblem("");
      setImage(null);
      await mutations.refreshAiMessages();
    } catch (err: unknown) {
      toast.error(
        isTimeoutError(err)
          ? "The solver took too long to respond. Please try again."
          : errorMessage(err, "The solver could not solve that problem."),
      );
    } finally {
      setBusy(false);
    }
  };

  const history = React.useMemo(
    () =>
      pairSolverMessages(
        [...aiMessages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      ),
    [aiMessages],
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <ViewHeader
        title="Math Solver"
        subtitle="Snap a photo or type a problem"
        icon={Calculator}
        size="lg"
      />

      {/* ---- input card ---- */}
      <div className="sf-card p-0">
        <Textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Type your math problem… e.g. Solve 2x + 5 = 15"
          aria-label="Math problem"
          className="min-h-[120px] resize-none border-0 text-lg shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        {image && (
          <div className="px-4 pb-3">
            <div className="relative inline-block">
              <img src={image} alt="Attached problem" className="h-20 rounded-lg border border-slate-200 dark:border-slate-700" />
              <button
                type="button"
                aria-label="Remove attached image"
                onClick={() => setImage(null)}
                className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-slate-800 text-white shadow-md hover:bg-slate-700"
              >
                <X className="size-3.5" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-3 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Attach an image of your problem"
              onClick={onPickImage}
              disabled={busy}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-sf-primary disabled:opacity-50 dark:hover:bg-slate-800"
            >
              <ImagePlus className="size-5" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Take a photo of your problem"
              onClick={onPickImage}
              disabled={busy}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-sf-primary disabled:opacity-50 dark:hover:bg-slate-800"
            >
              <Camera className="size-5" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Clear the problem"
              onClick={() => {
                setProblem("");
                setImage(null);
              }}
              disabled={busy}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-sf-primary disabled:opacity-50 dark:hover:bg-slate-800"
            >
              <RefreshCw className="size-5" strokeWidth={2} aria-hidden />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              aria-label="Choose a problem image"
              onChange={onImageSelected}
            />
          </div>
          <Button
            variant="gradient"
            className="sf-gradient-shadow"
            onClick={() => void solve()}
            disabled={busy || !problem.trim()}
          >
            {busy ? <Spinner className="size-4" /> : <Sparkles className="size-4" strokeWidth={2} aria-hidden />}
            Solve
          </Button>
        </div>
      </div>

      {/* ---- solution (the S14 aria-live contract) ---- */}
      <section
        className="sf-card p-6"
        aria-live="polite"
        aria-busy={busy}
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Math solution</h2>
        {busy ? (
          <p aria-hidden className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <Spinner className="size-4" /> Working through it…
          </p>
        ) : solution !== null ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{solution}</p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Type a problem or attach a photo, then press Solve — step-by-step help appears here.
          </p>
        )}
      </section>

      {/* ---- past solutions ---- */}
      <SectionCard title="Recent solutions" icon={History}>
        {loading && history.length === 0 ? (
          <div className="flex justify-center py-6">
            <Spinner className="size-5 text-sf-primary" />
          </div>
        ) : history.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Problems you solve will be saved here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {history.slice(0, 10).map((pair) => (
              <li key={pair.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <p className={cn("text-sm font-medium text-slate-800 dark:text-slate-100")}>{pair.question}</p>
                {pair.answer !== null && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">{pair.answer}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
