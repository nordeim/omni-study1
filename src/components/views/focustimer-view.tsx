"use client";

// ---------------------------------------------------------------------------
// FocusTimerView — the 30px-title focus timer: Focus / Short Break / Long
// Break modes with the Pomodoro + Deep Work presets, an SVG ring progress
// around the big tabular time display, gradient Start/Pause + ghost Reset,
// and the focus-completion flow (POST focusSession → toast → auto-switch to
// the streak-aware break). One interval, always cleaned up; document.title
// untouched.
//
// S174/DX2 + DX3 (measured live at the s174 probe): the reference's
// surface re-measured — subtitle "Stay focused and productive" (the
// scaffold-era "Stay focused with timed sessions" retired), the clock
// sub-label "Focus Time" (CLOCK_LABELS, separate from the mode-tab
// labels), the Today stat's DURATION value shape ("0h 0m" — the summed
// focus time today, not a session count), the mode-tab glyphs
// brain/coffee/coffee (the S9 measurement superseded), and TWO controls
// the clone lacked: the Timer Settings dialog (four sliders — Focus
// Duration 5-90 step 5, Short Break 1-30 step 1, Long Break 5-60 step 5,
// Sessions before long break 2-8 step 1 — with [Apply Settings][Close];
// the apply path exercised live 25 → 50 → 35 → 25, the clock re-rendering
// on apply; the settings DO NOT persist across reload — client-state
// only, the measured behavior) and the volume toggle (volume2 ↔
// volume-x, gating a short WebAudio completion chime — the oscillator
// sweep is the sandbox-safe implementation; the reference's own audible
// asset was not exercisable headlessly; default muted OFF, the measured
// default icon). The sessions-before-long-break counter feeds the
// completion switch: after N consecutive completed focus sessions the
// auto-break is LONG and the streak resets (the measured control's
// label semantics — Reasoned, N full sessions exceed the probe budget).
// ---------------------------------------------------------------------------

import * as React from "react";
import { createFetchSeq } from "@/lib/fetch-seq";
import {
  Brain,
  Check,
  Coffee,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Target,
  Timer,
  Volume2,
  VolumeX,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/toast";
import { mutations, useDataStore } from "@/lib/data";
import { isSameDay, startOfDay } from "@/lib/date";
import { Spinner, StatCard } from "@/components/views/shared";
import { cn } from "@/lib/utils";

type TimerMode = "focus" | "short-break" | "long-break";

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

// S174/DX2: the CLOCK sub-labels (measured by mode-switching on the
// reference — focus reads "Focus Time", the breaks their tab labels).
// SEPARATE from MODE_LABELS: the mode TABS keep the measured "Focus" /
// "Short Break" / "Long Break" button copy.
const CLOCK_LABELS: Record<TimerMode, string> = {
  focus: "Focus Time",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

// The mode tabs carry the measured glyphs (S174/DX2: the s174 re-measure
// reads brain / coffee / coffee — the S9-era Clock/Timer readings
// superseded; Long Break keeps coffee, the moon still deliberately
// absent from the reference set).
const MODE_ICONS: Record<TimerMode, LucideIcon> = {
  focus: Brain,
  "short-break": Coffee,
  "long-break": Coffee,
};

const PRESETS = [
  { id: "pomodoro", name: "Pomodoro", durations: "25/5/15", minutes: { focus: 25, "short-break": 5, "long-break": 15 } },
  { id: "deep", name: "Deep Work", durations: "50/10/30", minutes: { focus: 50, "short-break": 10, "long-break": 30 } },
] as const;

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// S174/DX3: the completion chime — a short WebAudio oscillator sweep (the
// sandbox-safe superset implementation; no binary asset, an AudioContext
// failure is swallowed — the chime is best-effort and never fails the save
// flow). Gated by the measured volume toggle at the call site.
function playChime(): void {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => void ctx.close().catch(() => undefined);
  } catch {
    // The chime is decorative — never surfaces a failure.
  }
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
  // S174/DX3: the measured controls' state — the settings dialog's opener,
  // the volume toggle (default muted OFF, the measured volume2 default
  // icon), and the sessions-before-long-break cycle (the streak counts
  // CONSECUTIVE COMPLETED focus sessions; at N the auto-break is LONG and
  // the streak resets). Client-state only — the reference's own settings
  // do not persist across reload (measured: 35 applied → reload → 25:00).
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(false);
  const [focusStreak, setFocusStreak] = React.useState(0);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = React.useState(4);

  const today = startOfDay(new Date());
  const todaysFocus = focusSessions.filter(
    (s) => s.mode === "focus" && isSameDay(new Date(s.startedAt), today),
  );
  const sessionsToday = todaysFocus.length;
  // S174/DX2: the Today stat's measured VALUE SHAPE — the summed focus
  // TIME today as "Xh Ym" (the reference's "0h 0m" at zero; a count never
  // renders h/m), not the session count (the count keeps its aria-live
  // line below — the clone's own superset surface).
  const focusSecondsToday = todaysFocus.reduce(
    (sum, s) => sum + (s.completed ? s.durationSeconds : 0),
    0,
  );
  const todayLabel = `${Math.floor(focusSecondsToday / 3600)}h ${Math.floor((focusSecondsToday % 3600) / 60)}m`;

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
  //
  // S145/CT1 (audit B-M1): the settle-CAS — the save's late .then/.catch
  // state writes must respect currency. The ticket is INSTANCE-scoped
  // (the React.useRef idiom — the S144/CS1 lesson: a function-body
  // instantiation mints a fresh seq per render and the guard silently
  // degenerates); every newer timer interaction (switchMode/applyPreset/
  // reset) mints, so a stale settle can never clobber a newer pick.
  const settleSeq = React.useRef(createFetchSeq()).current;
  const complete = React.useCallback(() => {
    // S145/CT1 (audit B-M1): the completion window guard — the effect
    // re-arms whenever `running` flips true at remaining === 0, and a
    // second fire while a save is in flight would double-log the session
    // (and, after a failed save, POST the FULL nominal duration from zero
    // elapsed time — the phantom). Unlatch running so the interval never
    // spins at 00:00; the in-flight save owns the rest.
    if (saving) {
      setRunning(false);
      return;
    }
    // S151/CZ3 (audit B-L3): the phantom-session gate — a Complete on a
    // NEVER-STARTED timer (running never flipped, remaining at the full
    // preset — exactly the state after every mount/switchMode/applyPreset/
    // reset) has NO elapsed interval; the old path floored the zero
    // elapsed to 1 s (Math.max(1, …)) and minted a phantom completed
    // session (stats +1, a spurious saved row, an auto-switch to Short
    // Break) from one stray click. A real interval exists iff the timer
    // ran (running) or any time came off the preset (remaining < the
    // preset) — and the gate speaks (the S14 contract: a rejected action
    // names its reason; the break-mode branch below rides the same gate —
    // nothing ran, so nothing is "over").
    if (!running && remaining >= durations[mode]) {
      toast.info("Start the timer first — there's no session to save yet.");
      return;
    }
    setRunning(false);
    if (mode !== "focus") {
      toast.info("Break's over — ready for another round?");
      return;
    }
    setSaving(true);
    const settle = settleSeq.begin();
    // S123/BX6: the ELAPSED duration, not the nominal preset — a manual
    // early complete previously logged the full 25:00 (every focus stat
    // silently inflated). The auto path arrives at remaining === 0 and
    // records the full duration unchanged; the schema's min-1 floors a
    // sub-second complete.
    mutations
      .createFocusSession({
        startedAt: new Date().toISOString(),
        durationSeconds: Math.max(1, durations.focus - remaining),
        mode: "focus",
        completed: true,
        subjectId: subjectId === "none" ? null : subjectId,
      })
      .then(() => {
        toast.success("Focus session saved — take a break!");
        // S174/DX3: the completion chime — gated by the measured volume
        // toggle (best-effort: an AudioContext failure never fails the
        // save flow).
        if (soundOn) playChime();
        // S145/CT1: the settle's state writes are currency-gated — a newer
        // mode/preset pick made during the in-flight save owns the timer;
        // the late success must not clobber it (the toast still informs).
        if (!settleSeq.isCurrent(settle)) return;
        // S174/DX3: the streak-aware break — after N consecutive completed
        // focus sessions the auto-break is LONG and the streak resets (the
        // measured "Sessions before long break" control's semantics).
        const nextStreak = focusStreak + 1;
        const breakMode: TimerMode =
          nextStreak >= sessionsBeforeLongBreak ? "long-break" : "short-break";
        setFocusStreak(nextStreak >= sessionsBeforeLongBreak ? 0 : nextStreak);
        setMode(breakMode);
        setRemaining(durations[breakMode]);
      })
      .catch((err: unknown) => {
        toast.error(errorMessage(err, "Could not save the focus session."));
        // S145/CT1 (audit B-M1): the failure re-latch — without it the
        // window stays open forever (mode="focus", remaining=0): a retry
        // press re-fires the completion effect and logs the phantom
        // full-duration session. The re-latch restores a FRESH full
        // duration, so the retry starts a real session; a newer pick made
        // during the window is never overwritten (currency-gated).
        if (settleSeq.isCurrent(settle)) {
          setRemaining(durations[mode]);
        }
      })
      .finally(() => setSaving(false));
    // S127/CB1: `remaining` joins the deps — the pre-CB1 array omitted it,
    // so the memoized callback closed over the MOUNT-time value and
    // `durations.focus - remaining` was always 0: every session (auto AND
    // manual paths) logged durationSeconds: 1, and the BX6 elapsed fix was
    // dead code behind the stale closure.
    // S129/CD3: `mutations` LEAVES the array — it is the module-level import
    // (an outer-scope value, not a reactive dependency; the exhaustive-deps
    // unnecessary-dependency class). No behavior change: its identity never
    // changes, so the callback identity is unaffected.
    // S145/CT1: `saving` JOINS the array — the completion-window guard
    // reads it (the CD3-era omission was load-bearing only because the
    // guard did not exist yet). `settleSeq` joins too — a stable
    // useRef-derived instance (identity never changes; the exhaustive-deps
    // rule owns the entry, the cost is nil). S151/CZ3: `running` joins —
    // the phantom-session gate reads it (the same CD3 discipline: the
    // omission was load-bearing only while the gate did not exist).
  }, [saving, running, mode, durations, remaining, subjectId, settleSeq, toast, soundOn, focusStreak, sessionsBeforeLongBreak]);

  React.useEffect(() => {
    if (!running || remaining > 0) return;
    const t = window.setTimeout(complete, 0);
    return () => window.clearTimeout(t);
  }, [running, remaining, complete]);

  const switchMode = (next: TimerMode) => {
    settleSeq.begin(); // a newer timer interaction — any in-flight settle stops owning the state
    setMode(next);
    setRemaining(durations[next]);
    setRunning(false);
  };

  const applyPreset = (id: (typeof PRESETS)[number]["id"]) => {
    settleSeq.begin(); // a newer timer interaction — any in-flight settle stops owning the state
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
    settleSeq.begin(); // a newer timer interaction — any in-flight settle stops owning the state
    setRemaining(durations[mode]);
    setRunning(false);
  };

  // S174/DX3: the measured Timer Settings apply path — the committed
  // durations replace the preset-derived values (the preset buttons stay;
  // a later preset pick overwrites the custom set, the measured reference
  // shape) and `remaining` re-anchors to the new CURRENT-mode duration
  // (the measured clock re-render on apply). The timer stops — the same
  // posture as applyPreset.
  const applySettings = (next: {
    durations: Record<TimerMode, number>;
    sessionsBeforeLongBreak: number;
  }) => {
    settleSeq.begin(); // a newer timer interaction — any in-flight settle stops owning the state
    setDurations(next.durations);
    setSessionsBeforeLongBreak(next.sessionsBeforeLongBreak);
    setRemaining(next.durations[mode]);
    setRunning(false);
    setSettingsOpen(false);
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
        <p className="mt-1 text-base text-slate-500 dark:text-slate-400">Stay focused and productive</p>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        {/* ---- stats (S136/CK4: the CE3 gate — an in-flight load renders
            the loading branch, never the false 0/0/0 row) ---- */}
        {/* S175/DY2: the in-flight window is announced — the Spinner is
            aria-hidden, so an unlabeled gate is silent to assistive tech
            (the DM2/DL2/DK4 precedent, the family-wide port COMPLETED
            this cycle). */}
        {loading && focusSessions.length === 0 ? (
          <div role="status" aria-label="Loading sessions" className="flex w-full justify-center py-10 text-sf-primary">
            <Spinner className="size-6" />
          </div>
        ) : (
        <div className="grid w-full grid-cols-3 gap-3">
          <StatCard icon={Flame} label="Pomodoros" value={focusSessions.filter((s) => s.mode === "focus").length} hint="All-time focus sessions" />
          {/* S174/DX2: the measured VALUE SHAPE — the summed focus TIME
              today as "Xh Ym" (the reference's "0h 0m" at zero), not the
              session count. */}
          <StatCard icon={Target} label="Today" value={todayLabel} hint="Focus time today" />
          <StatCard icon={Zap} label="Sessions" value={focusSessions.length} hint="Total sessions logged" />
        </div>
        )}
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
              {React.createElement(MODE_ICONS[m], {
                className: "size-3.5",
                strokeWidth: 2,
                "aria-hidden": true,
              })}
            </button>
          ))}
        </div>

        {/* ---- presets ---- */}
        {/* S124/BY13: the labeled container gives the forced-colors
            restoration its scope (invisible in normal rendering). */}
        <div className="flex items-center gap-2" role="group" aria-label="Timer presets">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              aria-pressed={presetId === preset.id}
              className={cn(presetId === preset.id && "border-sf-primary text-sf-primary-strong")}
              onClick={() => applyPreset(preset.id)}
            >
              <span className="flex flex-col items-center leading-tight">
                <span className="text-xs text-slate-500 dark:text-slate-400">{preset.name}</span>
                <span className="text-sm font-semibold">{preset.durations}</span>
              </span>
            </Button>
          ))}
        </div>

        {/* ---- ring + time ---- */}
        <div className="relative">
          <svg viewBox="0 0 200 200" className="h-64 w-64 -rotate-90" role="img" aria-label="Timer progress">
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
            <span role="timer" aria-label="Time remaining" className="text-5xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
              {formatClock(remaining)}
            </span>
            <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">{CLOCK_LABELS[mode]}</span>
          </div>
        </div>

        {/* ---- subject + the measured sound/settings controls ---- */}
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-end gap-2">
            <div className="flex-1">
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
            {/* S174/DX3: the measured volume + settings icon buttons (the
                reference renders both at the subject row's end). The
                clone's aria-labels are the documented a11y superset. */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={soundOn ? "Mute completion sound" : "Enable completion sound"}
              aria-pressed={soundOn}
              className="mb-0.5"
              onClick={() => setSoundOn((on) => !on)}
            >
              {soundOn ? (
                <Volume2 className="size-4" strokeWidth={2} aria-hidden />
              ) : (
                <VolumeX className="size-4" strokeWidth={2} aria-hidden />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Timer settings"
              className="mb-0.5"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="size-4" strokeWidth={2} aria-hidden />
            </Button>
          </div>
        </div>

        {/* ---- controls ---- */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={running ? "Pause timer" : "Start timer"}
            onClick={() => setRunning((r) => !r)}
            // S145/CT1 (audit B-M1): disabled during the in-flight save —
            // the completion window's primary entry (a Play press at
            // 00:00 re-armed the completion effect); parity with the
            // Complete button's own saving disable.
            disabled={saving}
            className="sf-gradient sf-gradient-shadow-lg flex size-16 items-center justify-center rounded-full text-white transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-50"
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
          <Button
            variant="ghost"
            size="icon"
            aria-label="Complete session"
            onClick={complete}
            disabled={saving}
          >
            <Check className="size-5" strokeWidth={2} aria-hidden />
          </Button>
          {saving && <Spinner className="size-4 text-sf-primary" />}
        </div>

        {/* ---- session count ---- */}
        <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
          {loading && focusSessions.length === 0
            ? "Loading your sessions…"
            : `${sessionsToday} focus ${sessionsToday === 1 ? "session" : "sessions"} today`}
        </p>
      </div>

      {/* S174/DX3: the measured Timer Settings dialog (the key-remount
          idiom — the draft re-seeds from the live durations per open). */}
      <TimerSettingsDialog
        key={settingsOpen ? "open" : "closed"}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        durations={durations}
        sessionsBeforeLongBreak={sessionsBeforeLongBreak}
        onApply={applySettings}
      />
    </div>
  );
}

// S174/DX3 — the measured Timer Settings dialog (the reference's own,
// probed live: heading "Timer Settings"; four sliders — Focus Duration
// 5-90 step 5, Short Break 1-30 step 1, Long Break 5-60 step 5, Sessions
// before long break 2-8 step 1 — each rendering its live-value label; the
// footer [Apply Settings][Close]). The dialog edits a DRAFT; Apply
// commits through the parent's applySettings (which re-anchors the clock
// + closes); Close/X/Escape discards — the measured discard path leaves
// the clock untouched.
function TimerSettingsDialog({
  open,
  onOpenChange,
  durations,
  sessionsBeforeLongBreak,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  durations: Record<TimerMode, number>;
  sessionsBeforeLongBreak: number;
  onApply: (next: {
    durations: Record<TimerMode, number>;
    sessionsBeforeLongBreak: number;
  }) => void;
}) {
  const [focusMin, setFocusMin] = React.useState(Math.round(durations.focus / 60));
  const [shortMin, setShortMin] = React.useState(Math.round(durations["short-break"] / 60));
  const [longMin, setLongMin] = React.useState(Math.round(durations["long-break"] / 60));
  const [sessions, setSessions] = React.useState(sessionsBeforeLongBreak);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label>Focus Duration: {focusMin} min</Label>
            <Slider
              aria-label="Focus Duration"
              value={[focusMin]}
              min={5}
              max={90}
              step={5}
              onValueChange={([v]) => setFocusMin(v)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Short Break: {shortMin} min</Label>
            <Slider
              aria-label="Short Break"
              value={[shortMin]}
              min={1}
              max={30}
              step={1}
              onValueChange={([v]) => setShortMin(v)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Long Break: {longMin} min</Label>
            <Slider
              aria-label="Long Break"
              value={[longMin]}
              min={5}
              max={60}
              step={5}
              onValueChange={([v]) => setLongMin(v)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Sessions before long break: {sessions}</Label>
            <Slider
              aria-label="Sessions before long break"
              value={[sessions]}
              min={2}
              max={8}
              step={1}
              onValueChange={([v]) => setSessions(v)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            variant="gradient"
            onClick={() =>
              onApply({
                durations: {
                  focus: focusMin * 60,
                  "short-break": shortMin * 60,
                  "long-break": longMin * 60,
                },
                sessionsBeforeLongBreak: sessions,
              })
            }
          >
            Apply Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
