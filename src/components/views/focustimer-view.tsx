"use client";

// ---------------------------------------------------------------------------
// FocusTimerView — the 30px-title focus timer: Focus / Short Break / Long
// Break modes with the Pomodoro + Deep Work presets, an SVG ring progress
// around the big tabular time display, gradient Start/Pause + ghost Reset,
// and the focus-completion flow (POST focusSession → toast → auto-switch to
// Short Break). One interval, always cleaned up; document.title untouched.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { mutations, useDataStore } from "@/lib/data";
import { isSameDay, startOfDay } from "@/lib/date";
import { Spinner } from "@/components/views/shared";
import { cn } from "@/lib/utils";

type TimerMode = "focus" | "short-break" | "long-break";

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

const PRESETS = [
  { id: "pomodoro", label: "Pomodoro 25/5/15", minutes: { focus: 25, "short-break": 5, "long-break": 15 } },
  { id: "deep", label: "Deep Work 50/10/30", minutes: { focus: 50, "short-break": 10, "long-break": 30 } },
] as const;

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function FocusTimerView() {
  const { toast } = useToast();
  const subjects = useDataStore((s) => s.subjects);
  const focusSessions = useDataStore((s) => s.focusSessions);
  const loading = useDataStore((s) => s.loading);

  const [presetId, setPresetId] = React.useState<(typeof PRESETS)[number]["id"]>("pomodoro");
  const [durations, setDurations] = React.useState<Record<TimerMode, number>>({
    focus: 25 * 60,
    "short-break": 5 * 60,
    "long-break": 15 * 60,
  });
  const [mode, setMode] = React.useState<TimerMode>("focus");
  const [remaining, setRemaining] = React.useState(25 * 60);
  const [running, setRunning] = React.useState(false);
  const [subjectId, setSubjectId] = React.useState("none");
  const [saving, setSaving] = React.useState(false);

  const today = startOfDay(new Date());
  const sessionsToday = focusSessions.filter(
    (s) => s.mode === "focus" && isSameDay(new Date(s.startedAt), today),
  ).length;

  const total = durations[mode];

  // The single interval — cleaned up on stop/unmount.
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Completion side effects run as a reaction to remaining === 0 — deferred
  // to a macrotask so the effect body itself never sets state synchronously
  // (the set-state-in-effect lint contract).
  const complete = React.useCallback(() => {
    setRunning(false);
    if (mode !== "focus") {
      toast.info("Break's over — ready for another round?");
      return;
    }
    setSaving(true);
    mutations
      .createFocusSession({
        startedAt: new Date().toISOString(),
        durationSeconds: durations.focus,
        mode: "focus",
        completed: true,
        subjectId: subjectId === "none" ? null : subjectId,
      })
      .then(() => {
        toast.success("Focus session saved — take a break!");
        setMode("short-break");
        setRemaining(durations["short-break"]);
      })
      .catch((err: unknown) => toast.error(errorMessage(err, "Could not save the focus session.")))
      .finally(() => setSaving(false));
  }, [mode, durations, subjectId, toast, mutations]);

  React.useEffect(() => {
    if (!running || remaining > 0) return;
    const t = window.setTimeout(complete, 0);
    return () => window.clearTimeout(t);
  }, [running, remaining, complete]);

  const switchMode = (next: TimerMode) => {
    setMode(next);
    setRemaining(durations[next]);
    setRunning(false);
  };

  const applyPreset = (id: (typeof PRESETS)[number]["id"]) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    const next: Record<TimerMode, number> = {
      focus: preset.minutes.focus * 60,
      "short-break": preset.minutes["short-break"] * 60,
      "long-break": preset.minutes["long-break"] * 60,
    };
    setDurations(next);
    setRemaining(next[mode]);
    setRunning(false);
  };

  const reset = () => {
    setRemaining(durations[mode]);
    setRunning(false);
  };

  const ringOffset = total > 0 ? CIRCUMFERENCE * (1 - remaining / total) : CIRCUMFERENCE;

  return (
    <div className="flex flex-col gap-8">
      {/* ---- custom 30px header ---- */}
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-800 dark:text-slate-100">
          <Timer className="size-7 shrink-0 text-sf-primary" strokeWidth={2} aria-hidden />
          Focus Timer
        </h1>
        <p className="mt-1 text-base text-slate-500 dark:text-slate-400">Stay focused with timed sessions</p>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        {/* ---- mode tabs ---- */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Timer mode">
          {(Object.keys(MODE_LABELS) as TimerMode[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => switchMode(m)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                mode === m
                  ? "sf-gradient text-white"
                  : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-700/60",
              )}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* ---- presets ---- */}
        <div className="flex items-center gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              aria-pressed={presetId === preset.id}
              className={cn(presetId === preset.id && "border-sf-primary text-sf-primary-strong")}
              onClick={() => applyPreset(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* ---- ring + time ---- */}
        <div className="relative">
          <svg viewBox="0 0 200 200" className="size-64 -rotate-90" role="img" aria-label="Timer progress">
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              strokeWidth="8"
              stroke="#f1f5f9"
              className="dark:stroke-slate-800"
            />
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              strokeWidth="8"
              stroke="rgb(var(--sf-primary))"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
              {formatClock(remaining)}
            </span>
            <span className="mt-1 text-sm text-slate-500">{MODE_LABELS[mode]}</span>
          </div>
        </div>

        {/* ---- subject ---- */}
        <div className="flex w-full flex-col gap-1.5">
          <Label htmlFor="focus-subject">Subject (optional)</Label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger id="focus-subject" aria-label="Session subject">
              <SelectValue placeholder="No subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No subject</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ---- controls ---- */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={running ? "Pause timer" : "Start timer"}
            onClick={() => setRunning((r) => !r)}
            className="sf-gradient sf-gradient-shadow flex size-20 items-center justify-center rounded-full text-white transition-transform hover:scale-105"
          >
            {running ? (
              <Pause className="size-8" strokeWidth={2} aria-hidden />
            ) : (
              <Play className="size-8 translate-x-0.5" strokeWidth={2} aria-hidden />
            )}
          </button>
          <Button variant="ghost" size="icon" aria-label="Reset timer" onClick={reset}>
            <RotateCcw className="size-5" strokeWidth={2} aria-hidden />
          </Button>
          {saving && <Spinner className="size-4 text-sf-primary" />}
        </div>

        {/* ---- session count ---- */}
        <p className="text-sm text-slate-500" aria-live="polite">
          {loading && focusSessions.length === 0
            ? "Loading your sessions…"
            : `${sessionsToday} focus ${sessionsToday === 1 ? "session" : "sessions"} today`}
        </p>
      </div>
    </div>
  );
}
